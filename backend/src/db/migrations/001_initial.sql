-- JBN Initial Schema Migration
-- Legal State Machine: unknown -> under_review -> pending -> reported -> official_confirmed -> promulgated -> effective -> recalled

-- Enums
DO $$ BEGIN
  CREATE TYPE legal_status AS ENUM ('unknown', 'under_review', 'pending', 'reported', 'official_confirmed', 'promulgated', 'effective', 'recalled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('SAFE', 'LOW', 'MEDIUM', 'HIGH', 'ILLEGAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_category AS ENUM ('regulation', 'designated_substance', 'threshold', 'enforcement', 'market');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_status AS ENUM ('pending', 'verified', 'official_confirmed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_tier AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type AS ENUM ('official_html', 'official_pdf', 'committee_page', 'news_article', 'industry_article', 'product_page', 'review_page', 'rss_feed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('compound', 'product_form', 'brand', 'agency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_preference AS ENUM ('critical_only', 'all');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sources: Monitored information sources
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type source_type NOT NULL,
  tier source_tier NOT NULL,
  fetch_frequency INTEGER NOT NULL DEFAULT 3600,
  last_fetched_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents: Raw fetched snapshots
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  title TEXT,
  body_text TEXT,
  canonical_url TEXT,
  content_type TEXT,
  language TEXT DEFAULT 'ja',
  raw_hash TEXT NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compounds: Substance registry
CREATE TABLE IF NOT EXISTS compounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  aliases JSONB DEFAULT '[]',
  chemical_family TEXT,
  natural_or_synthetic TEXT,
  legal_status_japan legal_status NOT NULL DEFAULT 'unknown',
  legal_status_updated_at TIMESTAMPTZ,
  risk_level risk_level NOT NULL DEFAULT 'LOW',
  effects_summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alerts: Generated regulatory change events
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category alert_category NOT NULL,
  severity alert_severity NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  source_tier source_tier NOT NULL,
  confidence_level TEXT NOT NULL DEFAULT 'unverified',
  published_at TIMESTAMPTZ,
  effective_at TIMESTAMPTZ,
  summary_what TEXT,
  summary_why TEXT,
  summary_who TEXT,
  compounds JSONB DEFAULT '[]',
  product_forms JSONB DEFAULT '[]',
  agencies JSONB DEFAULT '[]',
  diff_before TEXT,
  diff_after TEXT,
  diff_type TEXT,
  primary_source_url TEXT,
  importance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compound State History: State machine transitions
CREATE TABLE IF NOT EXISTS compound_state_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compound_id UUID NOT NULL REFERENCES compounds(id),
  previous_state legal_status NOT NULL,
  new_state legal_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_alert_id UUID REFERENCES alerts(id),
  source_url TEXT,
  notes TEXT
);

-- THC Regulations: Threshold tracking per product category
CREATE TABLE IF NOT EXISTS thc_regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_category TEXT NOT NULL,
  max_thc_level TEXT NOT NULL,
  measurement_method TEXT,
  effective_date TIMESTAMPTZ,
  source_url TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Government Notices: Administrative notices
CREATE TABLE IF NOT EXISTS government_notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency TEXT NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  summary TEXT,
  risk_level risk_level,
  source_url TEXT,
  document_id UUID REFERENCES documents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforcement Events
CREATE TABLE IF NOT EXISTS enforcement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT,
  date TIMESTAMPTZ NOT NULL,
  product_type TEXT,
  compounds JSONB DEFAULT '[]',
  charges TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Designated Substances
CREATE TABLE IF NOT EXISTS designated_substances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  chemical_family TEXT,
  designation_date TIMESTAMPTZ,
  previous_status TEXT,
  legal_status legal_status NOT NULL DEFAULT 'unknown',
  gazette_reference TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE,
  notification_preference notification_preference DEFAULT 'critical_only',
  language TEXT DEFAULT 'ja',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_source_id ON documents(source_id);
CREATE INDEX IF NOT EXISTS idx_documents_raw_hash ON documents(raw_hash);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_importance_score ON alerts(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_effective_at ON alerts(effective_at);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compound_state_history_compound ON compound_state_history(compound_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_entity ON watchlists(entity_type, entity_id);
