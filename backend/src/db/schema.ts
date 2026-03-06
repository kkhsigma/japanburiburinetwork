import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, uuid, real } from 'drizzle-orm/pg-core';

// Enums
export const legalStatusEnum = pgEnum('legal_status', [
  'unknown',
  'under_review',
  'pending',
  'reported',
  'official_confirmed',
  'promulgated',
  'effective',
  'recalled',
]);

export const riskLevelEnum = pgEnum('risk_level', [
  'SAFE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'ILLEGAL',
]);

export const alertSeverityEnum = pgEnum('alert_severity', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const alertCategoryEnum = pgEnum('alert_category', [
  'regulation',
  'designated_substance',
  'threshold',
  'enforcement',
  'market',
]);

export const alertStatusEnum = pgEnum('alert_status', [
  'pending',
  'verified',
  'official_confirmed',
]);

export const sourceTierEnum = pgEnum('source_tier', ['1', '2', '3', '4', '5']);

export const sourceTypeEnum = pgEnum('source_type', [
  'official_html',
  'official_pdf',
  'committee_page',
  'news_article',
  'industry_article',
  'product_page',
  'review_page',
  'rss_feed',
]);

export const entityTypeEnum = pgEnum('entity_type', [
  'compound',
  'product_form',
  'brand',
  'agency',
]);

export const notificationPrefEnum = pgEnum('notification_preference', [
  'critical_only',
  'all',
]);

// Tables

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  sourceType: sourceTypeEnum('source_type').notNull(),
  tier: sourceTierEnum('tier').notNull(),
  fetchFrequency: integer('fetch_frequency').notNull().default(3600), // seconds
  lastFetchedAt: timestamp('last_fetched_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').notNull().references(() => sources.id),
  fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
  title: text('title'),
  bodyText: text('body_text'),
  canonicalUrl: text('canonical_url'),
  contentType: text('content_type'),
  language: text('language').default('ja'),
  rawHash: text('raw_hash').notNull(),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const compounds = pgTable('compounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  aliases: jsonb('aliases').$type<string[]>().default([]),
  chemicalFamily: text('chemical_family'),
  naturalOrSynthetic: text('natural_or_synthetic'),
  legalStatusJapan: legalStatusEnum('legal_status_japan').notNull().default('unknown'),
  legalStatusUpdatedAt: timestamp('legal_status_updated_at'),
  riskLevel: riskLevelEnum('risk_level').notNull().default('LOW'),
  effectsSummary: text('effects_summary'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  category: alertCategoryEnum('category').notNull(),
  severity: alertSeverityEnum('severity').notNull(),
  status: alertStatusEnum('status').notNull().default('pending'),
  sourceTier: sourceTierEnum('source_tier').notNull(),
  confidenceLevel: text('confidence_level').notNull().default('unverified'),
  publishedAt: timestamp('published_at'),
  effectiveAt: timestamp('effective_at'),
  summaryWhat: text('summary_what'),
  summaryWhy: text('summary_why'),
  summaryWho: text('summary_who'),
  compounds: jsonb('compounds').$type<string[]>().default([]),
  productForms: jsonb('product_forms').$type<string[]>().default([]),
  agencies: jsonb('agencies').$type<string[]>().default([]),
  diffBefore: text('diff_before'),
  diffAfter: text('diff_after'),
  diffType: text('diff_type'),
  primarySourceUrl: text('primary_source_url'),
  importanceScore: integer('importance_score').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const compoundStateHistory = pgTable('compound_state_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  compoundId: uuid('compound_id').notNull().references(() => compounds.id),
  previousState: legalStatusEnum('previous_state').notNull(),
  newState: legalStatusEnum('new_state').notNull(),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
  triggerAlertId: uuid('trigger_alert_id').references(() => alerts.id),
  sourceUrl: text('source_url'),
  notes: text('notes'),
});

export const thcRegulations = pgTable('thc_regulations', {
  id: uuid('id').primaryKey().defaultRandom(),
  productCategory: text('product_category').notNull(),
  maxThcLevel: text('max_thc_level').notNull(),
  measurementMethod: text('measurement_method'),
  effectiveDate: timestamp('effective_date'),
  sourceUrl: text('source_url'),
  isCurrent: boolean('is_current').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const governmentNotices = pgTable('government_notices', {
  id: uuid('id').primaryKey().defaultRandom(),
  agency: text('agency').notNull(),
  title: text('title').notNull(),
  date: timestamp('date').notNull(),
  summary: text('summary'),
  riskLevel: riskLevelEnum('risk_level'),
  sourceUrl: text('source_url'),
  documentId: uuid('document_id').references(() => documents.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const enforcementEvents = pgTable('enforcement_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  location: text('location'),
  date: timestamp('date').notNull(),
  productType: text('product_type'),
  compounds: jsonb('compounds').$type<string[]>().default([]),
  charges: text('charges'),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const designatedSubstances = pgTable('designated_substances', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  chemicalFamily: text('chemical_family'),
  designationDate: timestamp('designation_date'),
  previousStatus: text('previous_status'),
  legalStatus: legalStatusEnum('legal_status').notNull().default('unknown'),
  gazetteReference: text('gazette_reference'),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: text('device_id').unique(),
  notificationPreference: notificationPrefEnum('notification_preference').default('critical_only'),
  language: text('language').default('ja'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
});

export const watchlists = pgTable('watchlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  notificationEnabled: boolean('notification_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
