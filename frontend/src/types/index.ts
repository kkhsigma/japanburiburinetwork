// ============================================================
// JBN Type Definitions — Shared across stores, hooks, and API
// ============================================================

// --- Black Hole Transition State Machine ---
export type TransitionState = "idle" | "collapsing" | "singularity" | "zoom" | "supernova" | "navigate";

// --- Legal State Machine (8 states) ---
export type LegalStatus =
  | 'unknown'
  | 'under_review'
  | 'pending'
  | 'reported'
  | 'official_confirmed'
  | 'promulgated'
  | 'effective'
  | 'recalled';

// --- Alert Types ---
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertCategory = 'regulation' | 'designated_substance' | 'threshold' | 'enforcement' | 'market';
export type AlertStatus = 'pending' | 'verified' | 'official_confirmed';
export type DiffType = 'threshold' | 'status' | 'scope' | 'date';
export type ConfidenceLevel = 'official' | 'verified' | 'unverified' | 'rumor';
export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'illegal';
export type SourceTier = 1 | 2 | 3 | 4 | 5;

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  source_tier: SourceTier;
  confidence_level: ConfidenceLevel;
  published_at: string;
  effective_at: string | null;
  summary_what: string;
  summary_why?: string;
  summary_who?: string;
  compounds: string[];
  product_forms: string[];
  agencies?: string[];
  importance_score: number;
  diff_before: string;
  diff_after: string;
  diff_type: DiffType;
  primary_source_url?: string;
  created_at: string;
}

// --- Compound Types ---
export interface Compound {
  id: string;
  name: string;
  aliases: string[];
  chemical_family?: string;
  natural_or_synthetic?: 'natural' | 'synthetic';
  legal_status_japan: LegalStatus;
  risk_level: RiskLevel;
  legal_status_updated_at: string;
  effects_summary: string;
  notes?: string;
}

export interface CompoundStateTransition {
  id: string;
  compound_id: string;
  previous_state: LegalStatus;
  new_state: LegalStatus;
  changed_at: string;
  trigger_alert_id: string | null;
  source_url?: string;
  notes?: string;
}

export interface CompoundDetail extends Compound {
  timeline: CompoundStateTransition[];
}

// --- Watchlist Types ---
export type WatchlistEntityType = 'compound' | 'product_form' | 'brand' | 'agency';

export interface WatchlistEntry {
  id: string;
  user_id: string;
  entity_type: WatchlistEntityType;
  entity_id: string;
  entity_name: string;
  created_at: string;
  notification_enabled: boolean;
}

export interface WatchlistHighlight {
  entity_type: WatchlistEntityType;
  entity_name: string;
  change: string;
  changed_at: string;
}

// --- Search Types ---
export interface SearchResult {
  compounds: Compound[];
  alerts: Alert[];
  products: unknown[];  // v1
}

export interface SearchResultItem {
  id: string;
  type: 'compound' | 'alert' | 'thc_regulation' | 'source' | 'government_notice' | 'designated_substance';
  title: string;
  subtitle: string | null;
  rank: number;
  metadata: Record<string, unknown>;
}

export interface HybridSearchResult {
  compounds: SearchResultItem[];
  alerts: SearchResultItem[];
  thc_regulations: SearchResultItem[];
  sources: SearchResultItem[];
  government_notices: SearchResultItem[];
  designated_substances: SearchResultItem[];
  total_count: number;
  query: string;
  search_mode: 'fulltext' | 'fuzzy';
}

export interface AskJbnResponse {
  answer: string;
  context: HybridSearchResult;
}

export type SearchMode = 'search' | 'ask';

// --- Settings Types ---
export type NotificationPreference = 'critical_only' | 'all';

export interface UserSettings {
  notification_preference: NotificationPreference;
  language: 'technical' | 'simplified';
  intro_enabled: boolean;
  push_enabled: boolean;
}

// --- Update Card (Intro animation) ---
export type UpdateCardType = 'emergency' | 'warning' | 'update';

export interface UpdateCard {
  id: string;
  type: UpdateCardType;
  title: string;
  date: string;
  impact: string[];
  alert_id?: string;
}

// --- API Response Wrappers ---
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };
}

export interface DetailResponse<T> {
  data: T;
}

export interface CompoundSource {
  id: string;
  name: string;
  url: string;
  source_type: string;
  tier: string;
}

export interface CompoundDetailResponse {
  data: Compound;
  timeline: CompoundStateTransition[];
  related_alerts: Alert[];
  sources: CompoundSource[];
}

// --- Filter Types ---
export interface AlertFilters {
  severity?: AlertSeverity;
  category?: AlertCategory;
  compound?: string;
  status?: AlertStatus;
  page?: number;
  limit?: number;
}
