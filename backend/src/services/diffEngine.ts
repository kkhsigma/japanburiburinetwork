import crypto from 'crypto';

export interface DocumentSnapshot {
  docId: string;
  title: string;
  bodyText: string;
  rawHash: string;
  tables?: string[][];
  entities?: {
    compounds: string[];
    agencies: string[];
    actions: string[];
    dates: string[];
  };
  legalState?: {
    status: string;
    effectiveDates: string[];
    thresholds: Record<string, string>;
  };
}

export interface DiffResult {
  hasChanged: boolean;
  diffType: 'none' | 'surface' | 'structural' | 'semantic';
  changes: DiffChange[];
}

export interface DiffChange {
  field: string;
  before: string;
  after: string;
  changeType: 'text_added' | 'text_removed' | 'status_changed' | 'date_changed' | 'threshold_changed' | 'scope_changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function computeHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[、。！？]/g, '')
    .trim()
    .toLowerCase();
}

// Quick check: if raw hash is the same, no changes at all
export function quickHashCheck(prev: DocumentSnapshot, curr: DocumentSnapshot): boolean {
  return prev.rawHash === curr.rawHash;
}

// Compare two snapshots and produce a diff result
export function compareSnapshots(prev: DocumentSnapshot, curr: DocumentSnapshot): DiffResult {
  // Quick exit: identical hash
  if (quickHashCheck(prev, curr)) {
    return { hasChanged: false, diffType: 'none', changes: [] };
  }

  const changes: DiffChange[] = [];

  // Check title change
  if (prev.title !== curr.title) {
    changes.push({
      field: 'title',
      before: prev.title,
      after: curr.title,
      changeType: 'text_added',
      severity: 'medium',
    });
  }

  // Normalized text comparison (filters surface-only changes)
  const prevNorm = normalizeText(prev.bodyText);
  const currNorm = normalizeText(curr.bodyText);

  if (prevNorm === currNorm) {
    // Only formatting/punctuation changed — surface diff, suppress notification
    return { hasChanged: true, diffType: 'surface', changes: [] };
  }

  // Check for threshold changes
  if (prev.legalState?.thresholds && curr.legalState?.thresholds) {
    for (const [key, prevVal] of Object.entries(prev.legalState.thresholds)) {
      const currVal = curr.legalState.thresholds[key];
      if (currVal && prevVal !== currVal) {
        changes.push({
          field: `threshold.${key}`,
          before: prevVal,
          after: currVal,
          changeType: 'threshold_changed',
          severity: 'critical',
        });
      }
    }
    // Check for new threshold categories
    for (const [key, currVal] of Object.entries(curr.legalState.thresholds)) {
      if (!prev.legalState.thresholds[key]) {
        changes.push({
          field: `threshold.${key}`,
          before: '(none)',
          after: currVal,
          changeType: 'scope_changed',
          severity: 'high',
        });
      }
    }
  }

  // Check for status changes
  if (prev.legalState?.status && curr.legalState?.status && prev.legalState.status !== curr.legalState.status) {
    changes.push({
      field: 'legal_status',
      before: prev.legalState.status,
      after: curr.legalState.status,
      changeType: 'status_changed',
      severity: 'critical',
    });
  }

  // Check for date changes
  if (prev.legalState?.effectiveDates && curr.legalState?.effectiveDates) {
    const prevDates = new Set(prev.legalState.effectiveDates);
    const newDates = curr.legalState.effectiveDates.filter(d => !prevDates.has(d));
    for (const date of newDates) {
      changes.push({
        field: 'effective_date',
        before: prev.legalState.effectiveDates.join(', ') || '(none)',
        after: date,
        changeType: 'date_changed',
        severity: 'high',
      });
    }
  }

  // Check table row additions (critical for designated substances list)
  if (prev.tables && curr.tables) {
    const prevRowCount = prev.tables.length;
    const currRowCount = curr.tables.length;
    if (currRowCount > prevRowCount) {
      changes.push({
        field: 'table_rows',
        before: `${prevRowCount} rows`,
        after: `${currRowCount} rows (+${currRowCount - prevRowCount} new)`,
        changeType: 'text_added',
        severity: 'critical', // Table row addition in designated substances = critical
      });
    }
  }

  // Check entity changes (new compounds detected)
  if (prev.entities?.compounds && curr.entities?.compounds) {
    const prevCompounds = new Set(prev.entities.compounds);
    const newCompounds = curr.entities.compounds.filter(c => !prevCompounds.has(c));
    if (newCompounds.length > 0) {
      changes.push({
        field: 'compounds_detected',
        before: prev.entities.compounds.join(', '),
        after: curr.entities.compounds.join(', '),
        changeType: 'scope_changed',
        severity: 'high',
      });
    }
  }

  // Determine diff type
  const hasSemantic = changes.some(c =>
    c.changeType === 'status_changed' ||
    c.changeType === 'threshold_changed'
  );
  const hasStructural = changes.some(c =>
    c.changeType === 'date_changed' ||
    c.changeType === 'scope_changed' ||
    c.changeType === 'text_added'
  );

  let diffType: DiffResult['diffType'] = 'surface';
  if (hasSemantic) diffType = 'semantic';
  else if (hasStructural) diffType = 'structural';

  return { hasChanged: true, diffType, changes };
}

// Apply false positive suppression rules
export function suppressFalsePositives(diff: DiffResult): DiffResult {
  if (!diff.hasChanged || diff.changes.length === 0) return diff;

  const filteredChanges = diff.changes.filter(change => {
    // Rule 1: No notification if only punctuation/layout changed (handled by normalizeText above)

    // Rule 2: "Planned"/"Under consideration" never auto-upgrades to "Confirmed"
    if (change.changeType === 'status_changed') {
      const plannedTerms = ['予定', '検討', '案', 'planned', 'under_consideration', 'draft'];
      const confirmedTerms = ['確定', 'official_confirmed', 'effective', 'promulgated'];
      const beforeIsPlanned = plannedTerms.some(t => change.before.includes(t));
      const afterIsConfirmed = confirmedTerms.some(t => change.after.includes(t));
      if (beforeIsPlanned && afterIsConfirmed) {
        // Flag for manual review rather than auto-upgrade
        change.severity = 'medium';
      }
    }

    return true;
  });

  return {
    ...diff,
    changes: filteredChanges,
  };
}
