-- Migration 003: Full-text search support for JBN
-- Adds tsvector columns, GIN indexes, trigram indexes, and auto-update triggers
-- Uses 'simple' config (works for Japanese text, no English-only stemming)
-- Idempotent: safe to run multiple times

BEGIN;

-- ============================================================
-- 1. Enable pg_trgm extension for fuzzy matching
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 2. Add search_vector columns to all searchable tables
-- ============================================================
ALTER TABLE compounds
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE thc_regulations
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE government_notices
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE designated_substances
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================================
-- 3. Populate existing rows with weighted tsvector data
-- ============================================================

-- compounds: A=name, B=aliases+chemical_family, C=effects_summary, D=notes
UPDATE compounds SET search_vector =
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce((SELECT string_agg(elem::text, ' ') FROM jsonb_array_elements_text(coalesce(aliases, '[]'::jsonb)) AS elem), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(chemical_family, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(effects_summary, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(notes, '')), 'D');

-- alerts: A=title, B=compounds, C=summary_what+summary_why, D=summary_who
UPDATE alerts SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce((SELECT string_agg(elem::text, ' ') FROM jsonb_array_elements_text(coalesce(compounds, '[]'::jsonb)) AS elem), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(summary_what, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(summary_why, '')), 'C') ||
  setweight(to_tsvector('simple', coalesce(summary_who, '')), 'D');

-- thc_regulations: A=product_category, B=max_thc_level, C=measurement_method
UPDATE thc_regulations SET search_vector =
  setweight(to_tsvector('simple', coalesce(product_category, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(max_thc_level, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(measurement_method, '')), 'C');

-- sources: A=name, D=url
UPDATE sources SET search_vector =
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(url, '')), 'D');

-- government_notices: A=title, B=agency, C=summary
UPDATE government_notices SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(agency, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(summary, '')), 'C');

-- designated_substances: A=name, B=chemical_family, D=gazette_reference
UPDATE designated_substances SET search_vector =
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(chemical_family, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(gazette_reference, '')), 'D');

-- ============================================================
-- 4. Create GIN indexes on search_vector columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_compounds_search_vector
  ON compounds USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_alerts_search_vector
  ON alerts USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_thc_regulations_search_vector
  ON thc_regulations USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_sources_search_vector
  ON sources USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_government_notices_search_vector
  ON government_notices USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_designated_substances_search_vector
  ON designated_substances USING gin(search_vector);

-- ============================================================
-- 5. Create trigram indexes on name/title columns for fuzzy fallback
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_compounds_name_trgm
  ON compounds USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_alerts_title_trgm
  ON alerts USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_thc_regulations_product_category_trgm
  ON thc_regulations USING gin(product_category gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sources_name_trgm
  ON sources USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_government_notices_title_trgm
  ON government_notices USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_designated_substances_name_trgm
  ON designated_substances USING gin(name gin_trgm_ops);

-- ============================================================
-- 6. Trigger functions that auto-update search_vector on INSERT/UPDATE
-- ============================================================

-- compounds
CREATE OR REPLACE FUNCTION compounds_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce((SELECT string_agg(elem::text, ' ') FROM jsonb_array_elements_text(coalesce(NEW.aliases, '[]'::jsonb)) AS elem), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.chemical_family, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.effects_summary, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.notes, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compounds_search_vector ON compounds;
CREATE TRIGGER trg_compounds_search_vector
  BEFORE INSERT OR UPDATE ON compounds
  FOR EACH ROW EXECUTE FUNCTION compounds_search_vector_update();

-- alerts
CREATE OR REPLACE FUNCTION alerts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce((SELECT string_agg(elem::text, ' ') FROM jsonb_array_elements_text(coalesce(NEW.compounds, '[]'::jsonb)) AS elem), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary_what, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary_why, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary_who, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alerts_search_vector ON alerts;
CREATE TRIGGER trg_alerts_search_vector
  BEFORE INSERT OR UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION alerts_search_vector_update();

-- thc_regulations
CREATE OR REPLACE FUNCTION thc_regulations_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.product_category, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.max_thc_level, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.measurement_method, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_thc_regulations_search_vector ON thc_regulations;
CREATE TRIGGER trg_thc_regulations_search_vector
  BEFORE INSERT OR UPDATE ON thc_regulations
  FOR EACH ROW EXECUTE FUNCTION thc_regulations_search_vector_update();

-- sources
CREATE OR REPLACE FUNCTION sources_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.url, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sources_search_vector ON sources;
CREATE TRIGGER trg_sources_search_vector
  BEFORE INSERT OR UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION sources_search_vector_update();

-- government_notices
CREATE OR REPLACE FUNCTION government_notices_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.agency, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_government_notices_search_vector ON government_notices;
CREATE TRIGGER trg_government_notices_search_vector
  BEFORE INSERT OR UPDATE ON government_notices
  FOR EACH ROW EXECUTE FUNCTION government_notices_search_vector_update();

-- designated_substances
CREATE OR REPLACE FUNCTION designated_substances_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.chemical_family, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.gazette_reference, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_designated_substances_search_vector ON designated_substances;
CREATE TRIGGER trg_designated_substances_search_vector
  BEFORE INSERT OR UPDATE ON designated_substances
  FOR EACH ROW EXECUTE FUNCTION designated_substances_search_vector_update();

COMMIT;
