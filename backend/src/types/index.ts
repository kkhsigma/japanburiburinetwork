// Legal State Machine - 8 states
export type LegalStatus =
  | 'unknown'
  | 'under_review'
  | 'pending'
  | 'reported'
  | 'official_confirmed'
  | 'promulgated'
  | 'effective'
  | 'recalled';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'ILLEGAL';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertCategory =
  | 'regulation'
  | 'designated_substance'
  | 'threshold'
  | 'enforcement'
  | 'market';

export type AlertStatus = 'pending' | 'verified' | 'official_confirmed';

export type ConfidenceLevel = 'official' | 'verified' | 'unverified' | 'rumor';

export type SourceTier = 1 | 2 | 3 | 4 | 5;

export type SourceType =
  | 'official_html'
  | 'official_pdf'
  | 'committee_page'
  | 'news_article'
  | 'industry_article'
  | 'product_page'
  | 'review_page'
  | 'rss_feed';

export type DiffType = 'threshold' | 'status' | 'scope' | 'date' | 'text';

export type EntityType = 'compound' | 'product_form' | 'brand' | 'agency';

export type NotificationPreference = 'critical_only' | 'all';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AlertFilters {
  severity?: AlertSeverity;
  category?: AlertCategory;
  compound?: string;
  status?: AlertStatus;
}
