# JBN Tracking Feature — Implementation Plan

## Overview

Build the end-to-end tracking system: monitored sources feed data into the pipeline, generate alerts, and users can track substances and view regulatory changes in real time.

The backend pipeline is **already fully built** — fetch → normalize → chunk → extract → classify → summarize → score → store. What's needed: source configuration, frontend pages, and wiring everything together.

---

## Part 1: Sources to Monitor

### Tier 1 — Official Government (auto-confirmed, highest trust)

| # | Source | URL | Type | Frequency | Content |
|---|--------|-----|------|-----------|---------|
| 1 | 厚労省プレスリリース | `https://www.mhlw.go.jp/stf/houdou/index.html` | official_html | 15 min | Designated substance announcements, policy changes |
| 2 | 厚労省 指定薬物ページ | `https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/yakubuturanyou/designated_substance.html` | official_html | 30 min | Designated substance list updates |
| 3 | 官報 (Kanpō) | `https://kanpou.npb.go.jp/` | official_html | 30 min | Official gazette — promulgations, effective dates |
| 4 | パブリックコメント e-Gov | `https://public-comment.e-gov.go.jp/servlet/Public` | official_html | 1 hour | Draft regulations open for public comment |
| 5 | 薬事・食品衛生審議会 | `https://www.mhlw.go.jp/stf/shingi/shingi-yakuji_127349.html` | committee_page | 1 hour | Committee meeting agendas, minutes, review materials |
| 6 | 厚労省 大麻取締法関連 | `https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iyakuhin/taima/index.html` | official_html | 1 hour | Cannabis Control Act amendments |
| 7 | 厚労省 PDF通知 | Various (linked from press pages) | official_pdf | 1 hour | Official notices, circulars in PDF format |

### Tier 2 — Semi-official (verified, high trust)

| # | Source | URL | Type | Frequency | Content |
|---|--------|-----|------|-----------|---------|
| 8 | PMDA 安全性情報 | `https://www.pmda.go.jp/safety/info-services/0001.html` | official_html | 2 hours | Adverse event reports, safety alerts |
| 9 | 警察庁 薬物関連 | `https://www.npa.go.jp/bureau/sosikihanzai/yakubutujyuki/yakumitu/index.html` | official_html | 6 hours | Drug enforcement statistics, policy |
| 10 | 消費者庁 (CAA) | `https://www.caa.go.jp/policies/policy/consumer_safety/release/` | official_html | 2 hours | Consumer safety warnings, recalls |
| 11 | 麻薬取締部 (NCD) | `https://www.ncd.mhlw.go.jp/` | official_html | 2 hours | Narcotics control updates, CBD compliance |

### Tier 3 — News (unverified, needs confirmation)

| # | Source | URL | Type | Frequency | Content |
|---|--------|-----|------|-----------|---------|
| 12 | NHK 医療・健康 | `https://www3.nhk.or.jp/news/catnew.html` (filtered) | rss_feed | 30 min | National news coverage of drug policy |
| 13 | 朝日新聞 社会 | RSS feed | rss_feed | 30 min | News articles on regulation |
| 14 | 毎日新聞 社会 | RSS feed | rss_feed | 30 min | News articles on enforcement |

### Tier 4 — Industry / Market (low trust, market signals only)

| # | Source | URL | Type | Frequency | Content |
|---|--------|-----|------|-----------|---------|
| 15 | CBD業界ニュース | Various industry RSS | rss_feed | 6 hours | Product launches, market trends |

### Total: 15 sources (7 Tier 1, 4 Tier 2, 3 Tier 3, 1 Tier 4)

### Substance Scope (v1)

**Covered:**
- All cannabinoids (CBD, CBN, CBG, THC, THCV, THCP, HHC, HHCH, HHCP, H4CBD, etc.)
- Designated substance list additions (any category)
- THC residual limit changes

**Not covered in v1 (future):**
- Psychedelics (1P-LSD, psilocybin, etc.) — pages exist but tracking deferred
- Kratom/mitragynine
- Novel synthetics outside cannabinoid family

---

## Part 2: Data Pipeline (Already Built)

The backend has a complete ETL pipeline. Here's the flow:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Scheduler   │────▶│ sourceFetcher │────▶│  Document DB  │
│ (15min loop) │     │ HTML/PDF/RSS  │     │  (raw_hash    │
│              │     │ + hash check  │     │   dedup)      │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                    ┌──────────────┐     ┌──────▼───────┐
                    │  diffEngine   │◀────│  normalizer   │
                    │ (change       │     │ (clean text,  │
                    │  detection)   │     │  sections)    │
                    └──────┬───────┘     └──────────────┘
                           │
              ┌────────────▼────────────┐
              │    semanticChunker       │
              │ (800 token chunks,       │
              │  table rows, sections)   │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  legalEntityExtractor    │
              │ (compounds, agencies,    │
              │  dates, risk signals)    │
              │ Rule-based + optional LLM│
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
  │ classifier   │  │ summarizer   │  │ importance   │
  │ (category,   │  │ (what/why/   │  │   Scorer     │
  │  severity,   │  │  who)        │  │ (0-100)      │
  │  status)     │  │              │  │              │
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
                  ┌───────▼───────┐
                  │  Alert DB +    │
                  │  Compound      │
                  │  State Update  │
                  │ (Tier 1 only)  │
                  └───────────────┘
```

### Key Rules
- **Only Tier 1 sources can change compound legal status** (prevents misinformation)
- **Hash-based dedup** on documents (same content = skip)
- **False positive suppression** (surface changes like punctuation don't trigger alerts)
- **Optional LLM enhancement** via Claude API (falls back to rule-based if no key)

---

## Part 3: Frontend Implementation

### 3A. `/alerts` Page — Alert Feed

**Replace current redirect with full filterable alert list.**

```
┌─────────────────────────────────────────────────────────┐
│ [← Universe]  アラートフィード          [ACTIVE ●]       │ sticky header
├─────────────────────────────────────────────────────────┤
│ [CRITICAL] [HIGH] [MEDIUM] [LOW]  │  [規制] [指定薬物]  │ filter chips
│ [閾値] [執行] [市場]  │  [物質名▼]  │  [リセット]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ CRITICAL ──────────────────────────────────────┐   │
│  │ HHCH指定薬物告示                    2026-03-05   │   │
│  │ 厚生労働省 · 対象: HHCH                          │   │
│  │ 厚生労働省は3月5日付の官報にて...     [詳細 →]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ HIGH ──────────────────────────────────────────┐   │
│  │ THCB規制検討                        2026-03-03   │   │
│  │ ...                                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  (more alerts...)                                       │
│                                                         │
│  [← 前へ]  ページ 1 / 3  [次へ →]                      │ pagination
└─────────────────────────────────────────────────────────┘
```

**New files:**
- `src/components/alerts/AlertFilterBar.tsx` — Filter chip bar (severity, category, compound dropdown)
- `src/components/ui/Pagination.tsx` — Reusable pagination controls

**Modified files:**
- `src/app/alerts/page.tsx` — Full rewrite from redirect to alert feed
- `src/hooks/useAlerts.ts` — Add `placeholderData` with mock fallback

**Data flow:**
- `useAlertsStore.filters` → `useAlerts(filters)` → render `AlertCard` list
- Filter changes update store → React Query refetches (filters in queryKey)
- Falls back to `mockAlerts` when backend unreachable

---

### 3B. `/watchlist` Page — Personal Tracking Dashboard

**Replace current redirect with personal substance tracking UI.**

```
┌─────────────────────────────────────────────────────────┐
│ [← Universe]  ウォッチリスト            [ACTIVE ●]       │ sticky header
├─────────────────────────────────────────────────────────┤
│ 最近の変更                                               │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │ horizontal scroll
│ │HHCH    │ │THCB    │ │CBD     │ │        │            │
│ │告示済→ │ │審議開始│ │基準策定│ │        │ ←→         │
│ │施行予定│ │        │ │中      │ │        │            │
│ └────────┘ └────────┘ └────────┘ └────────┘            │
├─────────────────────────────────────────────────────────┤
│ 追跡中の物質 (6件)                                       │
│                                                         │
│  ┌──────────────────────┐ ┌──────────────────────┐     │
│  │ HHCH          [🔔][×]│ │ THCB          [🔔][×]│     │  2-3 col grid
│  │ ● 違法 — 告示済      │ │ ● 高リスク — 審議中  │     │
│  │ 4/1より施行予定      │ │ 薬事審議会にて審議   │     │
│  │ 2026-03-05  [詳細→]  │ │ 2026-03-03  [詳細→]  │     │
│  └──────────────────────┘ └──────────────────────┘     │
│                                                         │
│  ┌──────────────────────┐ ┌──────────────────────┐     │
│  │ CBD          [🔔][×] │ │ HHC          [🔔][×] │     │
│  │ ...                   │ │ ...                   │     │
│  └──────────────────────┘ └──────────────────────┘     │
│                                                         │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │
│  Empty state (when no items):                           │
│  "まだ物質を追跡していません"                              │
│  [探索ページで物質を見つける →]                            │
└─────────────────────────────────────────────────────────┘
```

**New files:**
- `src/hooks/useWatchlistSync.ts` — Syncs React Query → Zustand; exports `useIsTracked(id)`, `useToggleTracking(compound)`
- `src/components/tracking/TrackButton.tsx` — Reusable add/remove watchlist button ("追跡" / "追跡中")
- `src/components/tracking/NotificationToggle.tsx` — Bell icon toggle per tracked item
- `src/components/watchlist/WatchlistHighlightsBar.tsx` — Horizontal scroll of recent changes
- `src/components/watchlist/EmptyWatchlist.tsx` — Empty state with CTA to explore

**Modified files:**
- `src/app/watchlist/page.tsx` — Full rewrite from redirect to tracking dashboard
- `src/hooks/useWatchlist.ts` — Add `placeholderData` with mock fallback
- `src/stores/watchlistStore.ts` — Add `isTracked()` selector, `toggleNotification()` action

**Data flow:**
- `useWatchlist()` → watchlist entries (entity IDs)
- `useCompounds()` → full compound details
- Client-side join: `entries.map(e => compounds.find(c => c.id === e.entity_id))`
- `useWatchlistHighlights()` → recent changes for highlights bar
- Remove/add uses optimistic updates via Zustand store

---

### 3C. TrackButton Integration — Add "Track" to All Compound Surfaces

**Places to add TrackButton:**

| Location | File | Button Size | Notes |
|----------|------|-------------|-------|
| Compound detail page header | `src/app/explore/compounds/[id]/page.tsx` | `md` | Next to status indicator |
| CompoundCard footer | `src/components/explore/CompoundCard.tsx` | `sm` | `e.stopPropagation()` to prevent card navigation |
| Alert detail — compound list | `src/app/alerts/[id]/page.tsx` | `sm` | Per-compound in the alert |
| FloatingSubstances cards | `src/components/dashboard/FloatingSubstances.tsx` | indicator only | Teal dot on tracked items (no button — would interfere with drag physics) |

**TrackButton states:**
```
Not tracked:  [ + 追跡 ]     — outline, gray
Tracked:      [ ✓ 追跡中 ]   — filled, teal
Loading:      [ ... ]         — pulse animation
```

---

### 3D. Connect Mock Data → API Hooks

Replace hardcoded mock data imports with React Query hooks + fallback:

| Component | Current Source | New Source | Fallback |
|-----------|---------------|-----------|----------|
| FloatingSubstances | `mockCompounds` from `lib/mock-data` | `useCompounds()` | `?? mockCompounds` |
| LatestAlerts (dashboard) | `latestAlerts` from `data/dashboard-mock` | `useAlerts({ limit: 4 })` | `?? latestAlerts` |
| Watchlist page | N/A (redirect) | `useWatchlist()` + `useCompounds()` | mock entries |
| Alert feed | N/A (redirect) | `useAlerts(filters)` | `mockAlerts` |

**Pattern** (already established in explore page):
```ts
const { data } = useCompounds();
const compounds = data?.data ?? mockCompounds;
```

---

### 3E. NavBar Updates

**File:** `src/components/universe/NavBar.tsx`

Add watchlist and alerts nav items:
- "ウォッチリスト" → `/watchlist` (with badge showing tracked count from Zustand store)
- "アラート" → `/alerts`

---

## Part 4: Backend Deployment

### Prerequisites
- PostgreSQL database (Railway, Supabase, or Neon)
- Node.js hosting (Railway, Render, or Fly.io)

### Steps
1. Deploy PostgreSQL (recommended: Railway for simplicity)
2. Run migrations: `npx drizzle-kit push:pg`
3. Run seed: `npx tsx src/db/seed.ts`
4. Deploy backend to Railway/Render with env vars:
   - `DATABASE_URL` — PostgreSQL connection string
   - `PORT` — 3001
   - `CORS_ORIGIN` — Vercel frontend URL
   - `ENABLE_SCHEDULER` — true
   - `FETCH_INTERVAL_MINUTES` — 15
   - `LLM_API_KEY` — (optional, for Claude-enhanced extraction)
   - `LLM_PROVIDER` — anthropic
5. Update Vercel `NEXT_PUBLIC_API_URL` to deployed backend URL
6. Redeploy frontend

### Admin Endpoints (for manual oversight)
- `GET /api/admin/review-queue` — List pending alerts
- `POST /api/admin/alerts/:id/verify` — Approve alert
- `POST /api/admin/alerts/:id/reject` — Reject false positive

### Missing Admin Features (to build)
- `POST /api/admin/alerts` — Manual alert creation
- `POST /api/admin/sources` — Add/edit/delete sources
- `GET /api/admin/scheduler/status` — Check scheduler health
- `POST /api/admin/scheduler/trigger` — Force immediate fetch cycle

---

## Part 5: Implementation Order

### Phase 1 — Data Layer (foundation)
1. Add mock fallback to `useAlerts.ts`, `useWatchlist.ts`, `useCompounds.ts`
2. Add `isTracked()` selector to `watchlistStore.ts`
3. Create `useWatchlistSync.ts` hook
**Estimate: Small scope, no UI changes**

### Phase 2 — Reusable Components
4. Build `TrackButton.tsx`
5. Build `NotificationToggle.tsx`
6. Build `Pagination.tsx`
7. Build `AlertFilterBar.tsx`
**Estimate: 4 new components**

### Phase 3 — `/alerts` Page
8. Rewrite `alerts/page.tsx` with filter bar + paginated list
9. Wire to `useAlerts(filters)` with mock fallback
**Estimate: 1 page rewrite**

### Phase 4 — `/watchlist` Page
10. Build `WatchlistHighlightsBar.tsx`
11. Build `EmptyWatchlist.tsx`
12. Rewrite `watchlist/page.tsx` with highlights + grid
**Estimate: 1 page rewrite, 2 new components**

### Phase 5 — Integration
13. Add TrackButton to CompoundCard, compound detail, alert detail
14. Add tracked indicator to FloatingSubstances
15. Connect LatestAlerts dashboard to `useAlerts()` hook
16. Update NavBar with new nav items

### Phase 6 — Backend Deployment
17. Deploy PostgreSQL + backend
18. Configure sources in database
19. Run seed data
20. Update frontend API URL
21. Verify end-to-end data flow

### Phase 7 — Admin Enhancements (post-launch)
22. Manual alert creation endpoint
23. Source management endpoints
24. Scheduler status/trigger endpoints
25. Admin UI page (optional)

---

## Technical Notes

### Existing Infrastructure That's Ready
- **All API routes** — GET/POST/DELETE for alerts, compounds, watchlist
- **All React Query hooks** — with caching, refetch, optimistic updates
- **All Zustand stores** — watchlist, alerts, compounds, settings
- **Full ETL pipeline** — 9 services, all functional
- **Database schema** — complete with migrations
- **Seed data** — 12 compounds, 10 sources, 5 alerts

### Critical Business Rules
- Only Tier 1 sources update compound legal status
- Hash-based document dedup prevents duplicate alerts
- Importance score ≥80 = push notification, ≥50 = digest, <50 = db only
- Scheduler runs every 15 min, Tier 1 sources prioritized

### Mock Data Strategy
- Frontend always works without backend (mock fallback on every hook)
- Pattern: `const data = apiData?.data ?? mockData`
- No loading spinners for initial render (placeholderData in React Query)
