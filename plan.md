# JBN (Japan Botanical Network) - Development Plan

## Project Overview

JBN is a **Regulatory Intelligence System** for the Japanese cannabinoid market. It is NOT a news aggregator — it is a "Difference Detection Radar" that tracks legal status changes, enforcement timelines, and compliance risks. The core value proposition: users compare "Before" vs "After" states of regulations to make decisions.

**Tech Stack:**
- **Frontend (Web):** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Canvas API
- **Frontend (Mobile - future):** React Native + Skia
- **Backend:** Node.js (Express or tRPC), PostgreSQL, Redis, Bull (job queues)
- **AI/ML:** OpenAI or Claude API (LLM summarization, entity extraction, classification)
- **Infrastructure:** Vercel (frontend), Railway/Render (backend), Supabase or managed Postgres

**Design Language:** Bloomberg x Apple Health x Notion — dark navy, white, accent green. Trustworthy, information-dense, readable.

---

## MVP Phases

| Phase | Focus | Scope |
|-------|-------|-------|
| **v0** | Regulatory Radar | Source monitoring, diff detection, alerts, watchlist, 5 screens |
| **v1** | Substance & Product Layer | Compound DB, product risk scoring, automated diff detection |
| **v2** | Community & Commerce | Product reviews, trip blogs (safe), COA database, brand tracking |

**This plan covers v0 in full detail, with v1/v2 outlined for future reference.**

---

## Agent Assignment

| Agent | Role | Focus Area |
|-------|------|------------|
| **Agent 1** | Frontend Core | UI components, pages, navigation, animations, design system |
| **Agent 2** | Backend Core | API, database, auth, data pipeline, scraping, LLM integration |
| **Agent 3** | Integration & Infrastructure | API integration, state management, notifications, deployment, testing |

---

# AGENT 1: Frontend Core

## Phase 1: Project Setup & Design System (Priority: P0)

### 1.1 Next.js Project Initialization
- [x] Initialize Next.js 14 with App Router, TypeScript, Tailwind CSS
- [x] Configure `tailwind.config.ts` with JBN design tokens:
  - Colors: Dark Navy (`#0a1628`), White (`#ffffff`), Accent Green (`#3a7d44`), Alert Red (`#dc2626`), Warning Yellow (`#eab308`), Info Blue (`#3b82f6`)
  - Typography: System font stack, monospace for data/numbers
  - Spacing, border-radius, shadows
- [x] Set up folder structure:
  ```
  src/
    app/           # App Router pages
    components/    # Reusable UI components
      ui/          # Base components (Button, Card, Badge, etc.)
      layout/      # Navigation, TabBar, Header
      alerts/      # Alert cards, diff views
      watchlist/   # Watchlist components
      explore/     # Compound/Product cards
      intro/       # Intro animation
    lib/           # Utilities, API client, constants
    hooks/         # Custom React hooks
    types/         # TypeScript type definitions
    stores/        # State management (Zustand)
  ```
- [x] Install core dependencies: `framer-motion`, `zustand`, `date-fns`, `lucide-react`

### 1.2 Design System & Base Components
- [x] **Button** — Primary, Secondary, Ghost, Danger variants
- [x] **Card** — Base card with severity border (red/yellow/green/blue)
- [x] **Badge** — Status badges: LEGAL, UNDER REVIEW, PENDING, ILLEGAL, etc.
- [x] **SourceTierBadge** — Tier 1-5 with color coding and label
- [x] **ConfidenceLabel** — Official / Verified / Unverified / Rumor
- [x] **CountdownTimer** — Days/hours until enforcement date
- [x] **DiffView** — GitHub-style before/after with red (removed) / green (added) highlighting
- [x] **StatusIndicator** — Green circle (Legal), Yellow (Caution), Red (Illegal)
- [x] **Skeleton loaders** for all card types

## Phase 2: Navigation & Layout (Priority: P0)

### 2.1 Five-Tab Navigation
- [x] **TabBar** component (bottom on mobile, sidebar on desktop)
  - Home — Dashboard icon
  - Alerts — Bell icon
  - Watchlist — Eye icon
  - Explore — Search/compass icon
  - Profile — User icon
- [x] Active state animations (subtle scale + color shift)
- [x] Responsive layout: mobile-first, desktop sidebar breakpoint at 768px
- [x] **Header** component with JBN logo + search trigger

## Phase 3: Intro Animation (Priority: P1)

### 3.1 "Data Grass" Intro Sequence
- [x] **GrassCanvas** — Canvas-based grass growing animation
  - Step 1 (0.7s): Scattered data points on dark background
  - Step 2 (0.7s): Points transform into botanical sprouts
  - Step 3 (0.9s): Sprouts grow into dense grass field (500 blades desktop, 200 mobile)
  - Step 4 (0.6s): JBN logo reveal with "Scanning Regulations..." text
  - Step 5: Progress text rotation: "Collecting sources" → "Analyzing updates" → "Checking substances"
- [x] **UpdatePopup** — Game-style update cards after 100%
  - Sequential card display (scale 0.8→1, opacity 0→1)
  - Severity color coding: Red (EMERGENCY), Yellow (WARNING), Blue (UPDATE)
  - "OK" button to dismiss, "Details" link to alert
  - After all cards dismissed → "Continue" button
- [x] **GrassSplit** — Grass splits left/right revealing Home page (Framer Motion x animation)
- [x] **Display logic:**
  - Full version (3.4s): First visit OR >24 hours since last visit (localStorage `jbn_last_visit`)
  - Short version (1.5s): Returning within 24 hours
  - Skip option in Profile settings

## Phase 4: Page — Home (Intelligence Dashboard) (Priority: P0)

### 4.1 Home Screen Components
- [x] **JBNRadar** (Hero section)
  - Count of active Critical Alerts
  - Substances reaching "Effective" status within 7 days
  - Watchlist state-machine transition count
- [x] **CriticalAlertsList** — Top 3 highest-severity alerts, horizontally scrollable cards
- [x] **UpcomingDates** — Countdown cards for enforcement deadlines, public comment closing dates
- [x] **WatchlistHighlights** — Real-time status changes for followed entities (e.g., "Under Review" → "Promulgated")
- [x] **SearchBar** — Universal search with real-time suggestions (Compound / Product / Alert categorization)
- [ ] Pull-to-refresh on mobile (deferred to mobile app)

## Phase 5: Page — Alerts (Regulatory Difference Radar) (Priority: P0)

### 5.1 Alert Feed
- [x] **AlertFeed** — Filterable list by category: Critical / Verified / Pending / Upcoming
- [x] **AlertCard** — Compact card with:
  - Severity color bar (left border)
  - Title, date, affected compounds/products
  - Source tier badge
  - Confidence label
  - Last checked timestamp
- [x] **AlertDetail** page:
  - Summary Block: "What Changed" / "Why it Matters" / "Who is Affected"
  - Source Verification section with Tier 1-5 hierarchy display
  - **SemanticDiff** — The core UI: GitHub-style diff for legal data
    - THC threshold changes (e.g., 0.5ppm → 0.1ppm) with green/red
    - Legal state transitions with visual indicators
    - Before/After side-by-side or inline view
  - Primary source link (always at top)
  - Related alerts section

## Phase 6: Page — Watchlist (Priority: P0)

### 6.1 Watchlist UI
- [x] **WatchlistPage** — Grid/list of tracked entities
- [x] **EntityCard** — Shows current legal status, last change date, risk level
- [x] **AddToWatchlist** — Search + add flow for Compounds, Product Forms, Brands, Agencies
- [x] **StatusChangeTimeline** — Visual timeline of state machine transitions for each entity
- [x] Push notification opt-in per entity

## Phase 7: Page — Explore (Priority: P1)

### 7.1 Explore Hub
- [x] **ExplorePage** — Tab sections: Compounds / Products / Laws & Agencies
- [x] **CompoundPage** — Wikipedia-style entity page:
  - Legal status badge (with conditions)
  - THC threshold info
  - Affected product forms
  - Recent news/alerts timeline
  - Risk notes
- [x] **ProductDatabase** (v1 stub) — Placeholder with coming soon
- [x] **LawsLibrary** — Links to primary docs (NCD import manuals, MHLW Q&As)
- [x] **UniversalSearch** — Real-time categorized suggestions

## Phase 8: Page — Profile (Priority: P1)

### 8.1 Profile & Settings
- [x] **NotificationSettings** — "Critical Alerts Only" vs "All Changes" toggle
- [x] **SafetyFilters** — Content filter controls
- [x] **IntroAnimationToggle** — Enable/disable intro sequence
- [x] **LanguageDisplay** — Technical vs simplified legal terminology
- [x] **AccountSection** — Basic user info (v0: anonymous/local, v1: auth)

---

# AGENT 2: Backend Core

## Phase 1: Database & API Setup (Priority: P0)

### 1.1 Database Schema (PostgreSQL)
- [x] **`sources`** — Monitored information sources
  ```
  id, name, url, source_type (official_html, official_pdf, news_article, etc.),
  tier (1-5), fetch_frequency, last_fetched_at, is_active
  ```
- [x] **`documents`** — Raw fetched documents / snapshots
  ```
  id, source_id, fetched_at, published_at, title, body_text, canonical_url,
  content_type, language, raw_hash, metadata_json
  ```
- [x] **`compounds`** — Substance registry
  ```
  id, name, aliases[], chemical_family, natural_or_synthetic,
  legal_status_japan (8-state enum), legal_status_updated_at,
  risk_level (SAFE/LOW/MEDIUM/HIGH/ILLEGAL), effects_summary, notes
  ```
- [x] **`alerts`** — Generated regulatory change events
  ```
  id, title, category (regulation/designated_substance/threshold/enforcement/market),
  severity (critical/high/medium/low), status (pending/verified/official_confirmed),
  source_tier, confidence_level, published_at, effective_at,
  summary_what, summary_why, summary_who,
  compounds[], product_forms[], agencies[],
  diff_before, diff_after, diff_type,
  primary_source_url, importance_score, created_at
  ```
- [x] **`compound_state_history`** — State machine transitions
  ```
  id, compound_id, previous_state, new_state, changed_at,
  trigger_alert_id, source_url, notes
  ```
- [x] **`thc_regulations`** — THC threshold tracking
  ```
  id, product_category, max_thc_level, measurement_method,
  effective_date, source_url, is_current
  ```
- [x] **`government_notices`** — Administrative notices
  ```
  id, agency, title, date, summary, risk_level, source_url, document_id
  ```
- [x] **`enforcement_events`** — Enforcement/crackdown tracking
  ```
  id, location, date, product_type, compounds[], charges, source_url
  ```
- [x] **`watchlists`** — User watchlist entries
  ```
  id, user_id, entity_type (compound/product_form/brand/agency),
  entity_id, created_at, notification_enabled
  ```
- [x] **`users`** — Basic user table (v0: minimal)
  ```
  id, device_id, notification_preference (critical_only/all),
  language, created_at, last_active_at
  ```
- [x] **`designated_substances`** — Designated substance registry
  ```
  id, name, chemical_family, designation_date, previous_status,
  legal_status, gazette_reference, source_url
  ```
- [x] Run migrations, seed initial compound data (CBD, CBN, CBG, THC, THCV, HHC, HHCH, HHCP, H4CBD, THCP, CBC, CBL)

### 1.2 API Layer (REST or tRPC)
- [x] **Alerts API**
  - `GET /api/alerts` — List alerts, filter by severity/category/compound, pagination
  - `GET /api/alerts/:id` — Alert detail with diff data
  - `GET /api/alerts/critical` — Current critical alerts for home dashboard
  - `GET /api/alerts/upcoming` — Upcoming enforcement dates
- [x] **Compounds API**
  - `GET /api/compounds` — List all tracked compounds with current status
  - `GET /api/compounds/:id` — Compound detail with state history
  - `GET /api/compounds/:id/timeline` — State machine transition history
- [x] **Watchlist API**
  - `GET /api/watchlist` — User's watchlist
  - `POST /api/watchlist` — Add entity to watchlist
  - `DELETE /api/watchlist/:id` — Remove from watchlist
  - `GET /api/watchlist/highlights` — Recent changes for watched entities
- [x] **Search API**
  - `GET /api/search?q=` — Universal search across compounds, alerts, products
- [x] **Intro API**
  - `GET /api/updates/recent` — Get update cards for intro animation popup
- [x] **Settings API**
  - `GET/PUT /api/settings` — User preferences

## Phase 2: Data Ingestion Pipeline (Priority: P0)

### 2.1 Source Monitoring System
- [x] **SourceFetcher** service — Scheduled jobs (Bull/BullMQ) per source
  - HTML fetcher (cheerio/puppeteer for JS-rendered pages)
  - PDF fetcher + text extraction (pdf-parse)
  - RSS fetcher (rss-parser)
- [x] **DocumentNormalizer** — Convert all sources to common schema:
  ```json
  {
    "doc_id": "",
    "source_name": "",
    "source_tier": 1,
    "fetched_at": "",
    "published_at": "",
    "title": "",
    "body_text": "",
    "canonical_url": "",
    "content_type": "",
    "language": "ja",
    "raw_hash": ""
  }
  ```
- [x] **SnapshotStore** — Store document snapshots for diff comparison
- [x] Initial source list (10 priority sources for v0):
  1. MHLW Press Releases (Medical Affairs Bureau)
  2. Designated Substances List PDF
  3. Pharmaceutical Affairs Council (Designated Substances Subcommittee)
  4. Cannabis Control Act Amendment Page
  5. THC Residual Limit Notice PDF
  6. NCD CBD Import Page
  7. CBD Import Manual PDF
  8. Product Category Classification PDF
  9. Consumer Affairs Agency Press Briefings
  10. Wellness Daily News

### 2.2 Diff Detection Engine
- [x] **SnapshotDiffer** — Compare current vs previous document snapshot
  - Raw hash comparison (quick exit if unchanged)
  - Normalized text diff (ignore formatting-only changes)
  - Table row diff (critical for designated substances list)
  - Date field diff detection
  - Threshold value diff detection
- [x] **SemanticChunker** — Split legal documents into meaningful units:
  - Headings, bullet points, table rows, notices, FAQ items
  - For legal docs: articles, clauses, table entries, annotation blocks
- [x] **False positive suppression rules:**
  - Rule 1: No notification if only punctuation/layout changed
  - Rule 2: "Planned"/"Under consideration" never auto-upgrades to "Confirmed"
  - Rule 3: Tier 4 alone cannot update illegal status
  - Rule 4: Substance name normalization (delta-9 THC = Δ9-THC = THC = tetrahydrocannabinol)
  - Rule 5: Table row addition in designated substances PDF = critical event

## Phase 3: AI/LLM Integration (Priority: P0)

### 3.1 Entity Extraction
- [x] **CompoundExtractor** — Detect compound names in text (rule-based + LLM)
  - Compound dictionary: CBD, CBN, CBG, THC, THCV, HHC, HHCH, HHCP, H4CBD, THCP, etc.
  - Aliases and Japanese names mapping
- [x] **LegalEntityExtractor** — Extract from each document:
  ```json
  {
    "compounds_detected": [],
    "product_forms_detected": [],
    "legal_actions_detected": [],
    "agencies_detected": [],
    "dates_detected": [],
    "risk_signals": []
  }
  ```
- [x] **Legal action vocabulary:**
  - 指定薬物追加, 麻薬指定, パブコメ開始, 公布, 施行, 注意喚起, 行政調査, 回収, 終売, 輸入確認手続変更

### 3.2 Classification & Summarization
- [x] **AlertClassifier** — Rule-based + LLM classification:
  ```json
  {
    "category_primary": "regulation",
    "category_secondary": "designated_substance",
    "jurisdiction": "Japan",
    "compounds": ["CBN"],
    "forms": ["oil", "gummy"],
    "action": "planned_designation",
    "confidence": 0.92,
    "effective_dates": [],
    "summary_ja": "..."
  }
  ```
- [x] **AlertSummarizer** — Generate JBN decision-summary cards:
  - What changed
  - When it takes effect
  - What is affected
  - What is different (before/after)
  - User impact
  - Business impact
  - Primary source
  - Trust level
  - Current status

### 3.3 Importance Scoring
- [x] **ImportanceScorer** — Calculate notification priority:
  ```
  importance_score = source_score + legal_score + date_score + user_match_score + novelty_score
  ```
  - Source: Tier1=40, Tier2=25, Tier3=15, Tier4=10, Tier5=5
  - Legal: Designation=+40, Promulgation=+35, THC change=+30, Recall=+25
  - Date: <7 days to enforcement=+35, <30 days=+20
  - User match: Followed compound=+15, Followed form=+10
  - Novelty: Brand new=+20, Minor update=+3
  - **>=80 → Push notification, >=50 → Digest, <50 → DB only**

## Phase 4: Admin & Moderation (Priority: P1)

### 4.1 Admin Dashboard API
- [ ] **Source Monitoring** — Fetch status logs, error tracking, last successful fetch
- [x] **Alert Review Queue** — Human-in-the-loop verification before "Verified" status
  - `GET /api/admin/review-queue` — Pending alerts
  - `POST /api/admin/alerts/:id/verify` — Approve alert
  - `POST /api/admin/alerts/:id/reject` — Reject false positive
- [ ] **Entity Management** — Merge compound aliases, update state machine
- [ ] **Content Safety Classifier** — Rule-based filter for user content (v2):
  - OK: taste, smell, packaging, brand responsiveness, price
  - NG: dosage advice, detection evasion, medical claims, illegal use guidance

---

# AGENT 3: Integration & Infrastructure

## Phase 1: State Management & API Integration (Priority: P0)

### 1.1 Frontend State (Zustand)
- [x] **alertsStore** — Alert list, filters, selected alert, loading states
- [x] **compoundsStore** — Compound list, selected compound, search results
- [x] **watchlistStore** — User watchlist, highlights, change notifications
- [x] **settingsStore** — User preferences, notification settings, intro toggle
- [x] **introStore** — Intro animation state, update cards queue, display logic
- [x] **searchStore** — Search query, categorized results

### 1.2 API Client
- [x] Set up API client (fetch wrapper or axios) with base URL config
- [x] Request/response interceptors for error handling
- [x] Typed API response interfaces matching backend schemas
- [x] SWR or React Query hooks for data fetching with caching:
  - `useAlerts(filters)` — Paginated alerts
  - `useAlert(id)` — Single alert detail
  - `useCriticalAlerts()` — Home dashboard
  - `useCompounds()` — Compound list
  - `useCompound(id)` — Compound detail with timeline
  - `useWatchlist()` — User watchlist
  - `useWatchlistHighlights()` — Recent changes
  - `useSearch(query)` — Universal search
  - `useRecentUpdates()` — Intro popup cards

## Phase 2: Notification System (Priority: P0)

### 2.1 Push Notifications
- [ ] **Web Push** setup (service worker + VAPID keys)
- [ ] Notification permission request flow
- [ ] 3-tier notification dispatch:
  1. **Flash Alert** — Critical regulatory changes (push immediately)
  2. **Watchlist Update** — Followed entity state change (push)
  3. **Daily/Weekly Digest** — Summary of all changes (scheduled)
- [ ] Notification preferences sync with backend settings API
- [ ] In-app notification center (bell icon badge count)

### 2.2 Real-time Updates
- [ ] Server-Sent Events (SSE) or WebSocket for live alert feed
- [ ] Optimistic UI updates for watchlist add/remove

## Phase 3: Deployment & CI/CD (Priority: P0)

### 3.1 Infrastructure Setup
- [x] **Frontend:** Vercel deployment with environment variables
- [x] **Backend:** Railway or Render deployment (Dockerfile + .dockerignore created)
- [ ] **Database:** Managed PostgreSQL (Supabase, Neon, or Railway Postgres)
- [ ] **Redis:** Upstash or Railway Redis (for Bull job queues + caching)
- [x] Environment config: `.env.local`, `.env.production`
- [ ] Domain setup + SSL

### 3.2 CI/CD Pipeline
- [x] GitHub Actions workflow:
  - Lint (ESLint + Prettier)
  - Type check (tsc)
  - Unit tests (Vitest)
  - Build check
  - Auto-deploy on main branch merge
- [ ] Branch protection rules on `main`

## Phase 4: Testing (Priority: P1)

### 4.1 Frontend Tests
- [ ] Component unit tests (Vitest + Testing Library)
  - AlertCard rendering with different severities
  - DiffView before/after display
  - CountdownTimer accuracy
  - StatusBadge correct states
- [ ] Integration tests for page flows
- [ ] Intro animation display logic (24h rule)

### 4.2 Backend Tests
- [ ] API endpoint tests (supertest)
- [ ] Diff engine unit tests:
  - Hash comparison
  - Table row addition detection
  - Threshold value change detection
  - False positive suppression
- [ ] LLM extraction accuracy tests (sample documents)
- [ ] Importance scoring calculation tests

### 4.3 E2E Tests
- [ ] Playwright setup
- [ ] Critical flows:
  - Home → Alert detail → Source link
  - Add compound to watchlist → Receive highlight
  - Search → Navigate to compound page
  - Intro animation → Update cards → Home transition

## Phase 5: Content Safety & Legal Compliance (Priority: P1)

### 5.1 Safety Implementation
- [x] Age gate on first visit (store in localStorage)
- [x] Disclaimer banner: "This is not medical or legal advice"
- [x] Primary source links mandatory on all alert cards
- [ ] Content report flow (flag → instant hide → admin review)
- [x] Terms of Service & Privacy Policy pages

### 5.2 App Store Readiness (Future)
- [ ] Content rating appropriate for regulatory information
- [ ] No promotion of illegal substances
- [ ] Abstract botanical branding (not cannabis-specific imagery)

---

# Execution Order (Recommended)

## Sprint 1 (Week 1-2): Foundation
| Agent 1 (Frontend) | Agent 2 (Backend) | Agent 3 (Integration) |
|---|---|---|
| Project setup + design system | Database schema + migrations | State management setup |
| Base UI components | Seed compound data | API client + typed interfaces |
| TabBar + Layout | Core API endpoints (alerts, compounds) | Environment + deployment config |

## Sprint 2 (Week 3-4): Core Features
| Agent 1 (Frontend) | Agent 2 (Backend) | Agent 3 (Integration) |
|---|---|---|
| Home page (Radar, Alerts, Upcoming) | Source fetcher (5 priority sources) | Connect Home to API |
| Alert feed + Alert detail page | Document normalizer | Connect Alerts to API |
| DiffView component | Snapshot differ (basic) | Search integration |

## Sprint 3 (Week 5-6): Intelligence Layer
| Agent 1 (Frontend) | Agent 2 (Backend) | Agent 3 (Integration) |
|---|---|---|
| Watchlist page | LLM entity extraction | Watchlist API integration |
| Compound page | Alert classifier + summarizer | Push notification setup |
| Intro animation | Importance scorer | Real-time updates (SSE) |

## Sprint 4 (Week 7-8): Polish & Launch
| Agent 1 (Frontend) | Agent 2 (Backend) | Agent 3 (Integration) |
|---|---|---|
| Explore page | Admin review queue API | E2E tests |
| Profile/Settings page | Remaining 5 sources | CI/CD pipeline |
| Intro update cards + grass split | False positive suppression | Safety features + legal pages |
| Responsive polish | Cron job scheduling | Performance optimization |

---

# v1 Roadmap (Post-Launch)

- Automated diff detection for all 30 sources
- Product database with COA verification
- Brand tracking and risk scoring
- Regulatory prediction AI (designation probability)
- Topic clustering across sources
- official_confirmed / reported state management
- Mobile app (React Native)

# v2 Roadmap (Future)

- Community features (safe reviews: taste/smell/packaging/price only)
- Product DB with lab test verification
- Trip blog with content safety classifier
- International regulation comparison map (Japan/EU/US/Thailand)
- EC platform monitoring (Rakuten, Amazon)
- Market/industry intelligence dashboard

---

# Progress Tracking

> **Instructions for all agents:** After completing each task, update this section. Change `[ ]` to `[x]` on the task above AND add a log entry below with date, what was done, and files created/modified.

## Agent 1 (Frontend Core) Progress

| Date | Task Completed | Files Created/Modified | Notes |
|------|---------------|----------------------|-------|
| 2026-03-06 | Phase 1: Next.js project init + design tokens | frontend/ (new project), tailwind.config.ts, globals.css | Next.js 14 + App Router + TS + Tailwind. All design tokens configured (colors, fonts, shadows, animations). |
| 2026-03-06 | Phase 1: All base UI components | components/ui/Button, Card, Badge, SourceTierBadge, ConfidenceLabel, CountdownTimer, DiffView, StatusIndicator, Skeleton, SearchBar | 10 components with full prop typing. Mock data in lib/mock-data.ts with 6 alerts, 12 compounds, watchlist, highlights, update cards. |
| 2026-03-06 | Phase 2: Navigation & Layout | components/layout/TabBar, Header, AppShell | 5-tab nav (bottom mobile, sidebar desktop), Framer Motion active indicators, responsive at 768px breakpoint. |
| 2026-03-06 | Phase 3: Data Grass intro animation | components/intro/GrassCanvas, UpdatePopup, IntroSequence | Canvas grass (500 desktop/200 mobile), progress text rotation, game-style update cards, grass split animation, 24h localStorage logic, skip toggle in Profile. |
| 2026-03-06 | Phase 4: Home page | app/home-page.tsx, app/page.tsx | JBN Radar hero, critical alerts (horizontal scroll), upcoming dates with countdown, watchlist highlights, search bar. |
| 2026-03-06 | Phase 5: Alerts page + detail | app/alerts/page.tsx, app/alerts/[id]/page.tsx, components/alerts/AlertCard | Filterable feed (Critical/High/Medium/Low), AlertCard with severity border + tier + confidence. Detail page with summary block, semantic diff, primary source link, compounds/forms, importance score. |
| 2026-03-06 | Phase 6: Watchlist page | app/watchlist/page.tsx, components/watchlist/EntityCard, StatusChangeTimeline | Entity grid, status badges, add-to-watchlist search flow, notification toggle per entity, state change timeline. |
| 2026-03-06 | Phase 7: Explore page + Compound detail | app/explore/page.tsx, app/explore/compounds/[id]/page.tsx, components/explore/CompoundCard | 3-tab explore (Compounds/Laws/Agencies), Wikipedia-style compound detail with aliases, status, timeline, related alerts. Laws library links. |
| 2026-03-06 | Phase 8: Profile page | app/profile/page.tsx | Notification prefs, safety filters, intro toggle (persists to localStorage), language display, account section. |
| 2026-03-06 | Audit: Profile page now uses settingsStore | app/profile/page.tsx | Replaced local useState with useSettingsStore. Added push notification toggle, ToggleSwitch and RadioOption sub-components. All settings sync to Zustand store. |
| 2026-03-06 | Audit: React 18 compatibility fix | app/alerts/[id]/page.tsx, app/explore/compounds/[id]/page.tsx | Removed React 19 use() import, changed params from Promise to plain object (Next.js 14 pattern). |
| 2026-03-06 | Audit: CSS and component cleanup | globals.css, components/intro/GrassCanvas.tsx | Added safe-area-bottom utility class for iOS safe area. Removed unnecessary eslint-disable, fixed unused parameter. |

## Agent 2 (Backend Core) Progress

| Date | Task Completed | Files Created/Modified | Notes |
|------|---------------|----------------------|-------|
| 2026-03-06 | Backend project initialization | backend/package.json, backend/tsconfig.json, backend/.env.example, backend/.gitignore, backend/drizzle.config.ts | Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM. Runs on port 3001. |
| 2026-03-06 | Full database schema (11 tables) | backend/src/db/schema.ts, backend/src/db/migrations/001_initial.sql, backend/src/db/index.ts, backend/src/db/migrate.ts | All tables from plan created: sources, documents, compounds, alerts, compound_state_history, thc_regulations, government_notices, enforcement_events, designated_substances, users, watchlists. Includes all enums (8-state legal status, risk levels, severity, etc.) and indexes. |
| 2026-03-06 | Seed data (12 compounds, 10 sources, 5 alerts, 3 THC regs) | backend/src/db/seed.ts | CBD, CBN, CBG, CBC, CBL, THC, THCV, THCP, HHC, HHCH, HHCP, H4CBD with aliases (EN+JP), legal statuses, risk levels, and notes. 10 priority sources (Tier 1-4). 5 realistic sample alerts including Mar 4 2026 designation, CBN review, THC limits, use crimes. |
| 2026-03-06 | All REST API endpoints | backend/src/routes/alerts.ts, compounds.ts, watchlist.ts, search.ts, updates.ts, settings.ts, admin.ts | Alerts (list/filter/paginate, detail, critical, upcoming), Compounds (list, detail+timeline), Watchlist (CRUD, highlights), Search (universal), Updates (recent), Settings (GET/PUT), Admin (review-queue, verify, reject). |
| 2026-03-06 | TypeScript types + Express server | backend/src/types/index.ts, backend/src/index.ts, backend/src/middleware/errorHandler.ts, backend/src/utils/logger.ts | All types defined (LegalStatus, AlertSeverity, SourceTier, etc.). Server with CORS, Helmet, JSON parsing, health check. |
| 2026-03-06 | Diff Detection Engine | backend/src/services/diffEngine.ts | SnapshotDiffer with hash check, normalized text diff, threshold/status/date/table/entity change detection. False positive suppression (5 rules). |
| 2026-03-06 | Compound Dictionary + Entity Extraction | backend/src/services/compoundDictionary.ts | Rule-based compound name extraction (12 compounds + aliases + Japanese names). Legal action keyword detection (18 keywords). |
| 2026-03-06 | Importance Scorer | backend/src/services/importanceScorer.ts | Score formula: source + legal + date + user_match + novelty. Push >= 80, Digest >= 50, DB only < 50. |
| 2026-03-06 | Source Fetcher (complete) | backend/src/services/sourceFetcher.ts | HTML (cheerio), PDF (pdf-parse), RSS (rss-parser) fetchers. Unified fetchSource() dispatcher with hash-based change detection. storeDocument() for DB persistence. |
| 2026-03-06 | Document Normalizer (complete) | backend/src/services/documentNormalizer.ts | normalizeDocument() converting all source types to common schema. Section extraction, table extraction, heading detection for Japanese legal docs. |
| 2026-03-06 | Semantic Chunker | backend/src/services/semanticChunker.ts | chunkDocument() splitting legal text into article/clause/table_entry/faq_item/notice/paragraph/list_block types. Token estimation, mergeSmallChunks(). |
| 2026-03-06 | Legal Entity Extractor | backend/src/services/legalEntityExtractor.ts | Rule-based extraction of compounds, product forms (oil/vape/gummy/capsule/powder/cosmetic), legal actions, agencies (MHLW/NCD/CAA/NPA), dates (YYYY-MM-DD, Japanese era 令和/平成), risk signals. LLM fallback via Anthropic API. |
| 2026-03-06 | Alert Classifier | backend/src/services/alertClassifier.ts | Rule-based classification: designated_substance->critical, public_comment->medium, enforcement->high. Tier-based confidence/status. classifyAlert() + classifyAlertWithLLM(). Tier 4 cannot update legal status (safety rule). |
| 2026-03-06 | Alert Summarizer | backend/src/services/alertSummarizer.ts | Template-based summary generation: what/why/who. Diff pair generation (before/after). generateSummary() + generateSummaryWithLLM(). |
| 2026-03-06 | Fetch Scheduler | backend/src/jobs/fetchScheduler.ts | Full pipeline: fetch -> normalize -> chunk -> extract entities -> diff -> classify -> score -> create alert. startScheduler()/stopScheduler() with configurable interval. Compound state history updates with Tier 1 safety rule. |

## Agent 3 (Integration & Infrastructure) Progress

| Date | Task Completed | Files Created/Modified | Notes |
|------|---------------|----------------------|-------|
| 2026-03-06 | TypeScript types for all API response shapes | src/types/index.ts | Covers Alert, Compound, Watchlist, Search, Settings, UpdateCard, all enums |
| 2026-03-06 | 6 Zustand stores (alerts, compounds, watchlist, settings, intro, search) | src/stores/*.ts | introStore includes 24h localStorage logic |
| 2026-03-06 | API client (axios) with interceptors + device ID | src/lib/api-client.ts, src/lib/api.ts | All endpoints typed, ready for Agent 2 backend |
| 2026-03-06 | React Query hooks for all data fetching | src/hooks/useAlerts.ts, useCompounds.ts, useWatchlist.ts, useSearch.ts, useSettings.ts, useRecentUpdates.ts | Optimistic UI for watchlist add/remove |
| 2026-03-06 | QueryProvider + layout wiring | src/lib/query-provider.tsx, src/app/layout.tsx | App metadata updated to JBN |
| 2026-03-06 | Vercel config + env files | frontend/vercel.json, .env.local, .env.production | Needs VAPID key for push notifications |
| 2026-03-06 | GitHub Actions CI pipeline | .github/workflows/ci.yml | Lint + type check + build on PR/push to main |
| 2026-03-06 | Installed dependencies | frontend/package.json | zustand, @tanstack/react-query, axios, date-fns, lucide-react |
| 2026-03-06 | Wired all pages to React Query hooks | home-page.tsx, alerts/page.tsx, alerts/[id]/page.tsx, watchlist/page.tsx, explore/page.tsx | All pages use hooks with mock data fallback. Loading skeletons added. |
| 2026-03-06 | Content safety: AgeGate + DisclaimerBanner | components/ui/AgeGate.tsx, components/ui/DisclaimerBanner.tsx, app/layout.tsx | AgeGate checks localStorage jbn_age_verified, DisclaimerBanner dismissible per session. Both integrated into root layout. |
| 2026-03-06 | Terms of Service + Privacy Policy pages | app/terms/page.tsx, app/privacy/page.tsx | 8-section ToS, 9-section Privacy Policy. APPI compliance noted. |
| 2026-03-06 | Backend deployment config | backend/Dockerfile, backend/.dockerignore | Multi-stage Docker build (deps, build, production). Health check on /health. Port 3001. |
| 2026-03-06 | Alert detail: wired useAlert hook | app/alerts/[id]/page.tsx | Added useAlert(id) React Query hook with loading skeleton and mock data fallback. |
| 2026-03-06 | DisclaimerBanner: sessionStorage persistence | components/ui/DisclaimerBanner.tsx | Dismissal now persists via sessionStorage (reappears each new browser session). |
| 2026-03-06 | Terms: added Content Policy section | app/terms/page.tsx | Section 5 covers prohibited content: dosage advice, detection evasion, medical claims, illegal use. Now 9 sections total. |

## Blockers & Dependencies

| Date | Agent | Blocker Description | Blocked By | Status |
|------|-------|-------------------|-----------|--------|
| 2026-03-06 | Agent 3 | Cannot connect pages to API — no UI pages exist yet | Agent 1 | RESOLVED - Agent 1 built all pages |
| 2026-03-06 | Agent 3 | Cannot test API integration — no backend endpoints running | Agent 2 | RESOLVED - Agent 2 built all routes |
| 2026-03-06 | Agent 3 | Push notification setup needs VAPID keys — requires backend to generate | Agent 2 | OPEN - deferred to next sprint |
