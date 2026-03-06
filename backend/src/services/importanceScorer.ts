import type { SourceTier, AlertCategory } from '../types/index.js';

interface ScoringInput {
  sourceTier: SourceTier;
  legalAction?: string;
  daysToEnforcement?: number;
  userFollowsCompound?: boolean;
  userFollowsForm?: boolean;
  isNovel?: boolean;
}

const SOURCE_SCORES: Record<SourceTier, number> = {
  1: 40,
  2: 25,
  3: 15,
  4: 10,
  5: 5,
};

const LEGAL_ACTION_SCORES: Record<string, number> = {
  'designated_substance_addition': 40,
  'narcotic_designation': 40,
  'promulgation': 35,
  'enforcement_date_confirmed': 35,
  'thc_threshold_change': 30,
  'recall': 25,
  'administrative_warning': 20,
  'public_comment_open': 15,
  'review_increase': 5,
};

export function calculateImportanceScore(input: ScoringInput): number {
  let score = 0;

  // Source score: Tier 1 = 40, Tier 2 = 25, etc.
  score += SOURCE_SCORES[input.sourceTier] || 5;

  // Legal action score
  if (input.legalAction && LEGAL_ACTION_SCORES[input.legalAction]) {
    score += LEGAL_ACTION_SCORES[input.legalAction];
  }

  // Date urgency score
  if (input.daysToEnforcement !== undefined) {
    if (input.daysToEnforcement <= 7) {
      score += 35;
    } else if (input.daysToEnforcement <= 30) {
      score += 20;
    }
  }

  // User match score
  if (input.userFollowsCompound) score += 15;
  if (input.userFollowsForm) score += 10;

  // Novelty score
  if (input.isNovel) {
    score += 20;
  } else {
    score += 3;
  }

  return score;
}

export function getNotificationTier(score: number): 'push' | 'digest' | 'db_only' {
  if (score >= 80) return 'push';
  if (score >= 50) return 'digest';
  return 'db_only';
}
