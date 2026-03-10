-- Add unique constraints so seed can run idempotently on every deploy

-- Remove duplicate alerts (keep oldest) before adding constraint
DELETE FROM alerts a USING alerts b
  WHERE a.id > b.id AND a.title = b.title;

DO $$ BEGIN
  ALTER TABLE alerts ADD CONSTRAINT alerts_title_unique UNIQUE (title);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Remove duplicate thc_regulations (keep oldest) before adding constraint
DELETE FROM thc_regulations a USING thc_regulations b
  WHERE a.id > b.id AND a.product_category = b.product_category;

DO $$ BEGIN
  ALTER TABLE thc_regulations ADD CONSTRAINT thc_regulations_product_category_unique UNIQUE (product_category);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
