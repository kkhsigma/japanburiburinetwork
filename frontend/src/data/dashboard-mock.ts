import type { AlertSeverity, LegalStatus, RiskLevel, SourceTier } from "@/types";

// --- KPI Data ---
export interface KpiItem {
  label: string;
  value: string | number;
  subtext: string;
  accent: "critical" | "accent" | "signal" | "info";
}

export const kpiData: KpiItem[] = [
  { label: "緊急アラート", value: 3, subtext: "過去7日間", accent: "critical" },
  { label: "追跡物質", value: 47, subtext: "アクティブ監視中", accent: "accent" },
  { label: "監視ソース", value: 12, subtext: "自動スキャン対象", accent: "signal" },
  { label: "最終スキャン", value: "12分前", subtext: "次回: 15:00 JST", accent: "info" },
];

// --- Alert Data ---
export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  date: string;
  source: string;
  substance: string;
  summary: string;
}

export const latestAlerts: DashboardAlert[] = [
  {
    id: "alert-001",
    severity: "critical",
    title: "HHCH及び関連6物質の指定薬物追加が官報告示",
    date: "2026-03-05",
    source: "厚生労働省",
    substance: "HHCH",
    summary:
      "厚生労働省は3月5日付の官報にてHHCH及び構造類似体6種を指定薬物として正式告示。施行日は4月1日。",
  },
  {
    id: "alert-002",
    severity: "high",
    title: "THCBの規制検討が薬事審議会で議題化",
    date: "2026-03-03",
    source: "薬事・食品衛生審議会",
    substance: "THCB",
    summary:
      "第14回指定薬物部会にてTHCBの薬理データレビューが開始。次回部会で規制要否を決定予定。",
  },
  {
    id: "alert-003",
    severity: "medium",
    title: "CBD製品のTHC残留基準パブコメ開始",
    date: "2026-02-28",
    source: "パブリックコメント",
    substance: "CBD",
    summary:
      "CBD製品中のTHC残留許容値に関する基準案が公表され、30日間のパブリックコメント受付が開始。",
  },
  {
    id: "alert-004",
    severity: "low",
    title: "PMDAが海外カンナビノイド安全性レポートを公開",
    date: "2026-02-25",
    source: "PMDA",
    substance: "全般",
    summary:
      "医薬品医療機器総合機構がEU・米国の合成カンナビノイド関連有害事象データの和訳レポートを公開。",
  },
];

// --- Timeline Data ---
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: "regulation" | "enforcement" | "review" | "publication";
  description: string;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "tl-001",
    date: "2026-03-05",
    title: "HHCH指定薬物告示",
    category: "regulation",
    description: "官報にて正式告示、4/1施行",
  },
  {
    id: "tl-002",
    date: "2026-03-03",
    title: "THCB審議開始",
    category: "review",
    description: "薬事審議会部会にて議題化",
  },
  {
    id: "tl-003",
    date: "2026-02-28",
    title: "CBD残留基準パブコメ",
    category: "publication",
    description: "THC残留許容値基準案公表",
  },
  {
    id: "tl-004",
    date: "2026-02-20",
    title: "違法製品回収命令",
    category: "enforcement",
    description: "3製品に対する回収命令を発出",
  },
  {
    id: "tl-005",
    date: "2026-02-15",
    title: "指定薬物省令改正案",
    category: "regulation",
    description: "次期改正に向けた省令案公表",
  },
];

// --- Substance Data ---
export interface TrackedSubstance {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  legalStatus: LegalStatus;
  lastUpdate: string;
  note: string;
}

export const trackedSubstances: TrackedSubstance[] = [
  {
    id: "sub-001",
    name: "HHCH",
    riskLevel: "illegal",
    legalStatus: "promulgated",
    lastUpdate: "2026-03-05",
    note: "4/1より指定薬物として施行予定",
  },
  {
    id: "sub-002",
    name: "THCB",
    riskLevel: "high",
    legalStatus: "under_review",
    lastUpdate: "2026-03-03",
    note: "薬事審議会にて審議中",
  },
  {
    id: "sub-003",
    name: "HHC",
    riskLevel: "illegal",
    legalStatus: "effective",
    lastUpdate: "2025-12-01",
    note: "2024年より指定薬物として規制中",
  },
  {
    id: "sub-004",
    name: "CBD",
    riskLevel: "low",
    legalStatus: "official_confirmed",
    lastUpdate: "2026-02-28",
    note: "合法 — 残留THC基準策定中",
  },
  {
    id: "sub-005",
    name: "THCH",
    riskLevel: "high",
    legalStatus: "pending",
    lastUpdate: "2026-01-15",
    note: "規制候補リストに掲載",
  },
  {
    id: "sub-006",
    name: "CBN",
    riskLevel: "safe",
    legalStatus: "official_confirmed",
    lastUpdate: "2026-01-10",
    note: "規制対象外 — 監視継続中",
  },
];

// --- Source Data ---
export interface MonitoredSource {
  id: string;
  name: string;
  tier: SourceTier;
  lastChecked: string;
  status: "active" | "delayed" | "error";
}

export const monitoredSources: MonitoredSource[] = [
  { id: "src-001", name: "厚労省", tier: 1, lastChecked: "12分前", status: "active" },
  { id: "src-002", name: "官報", tier: 1, lastChecked: "12分前", status: "active" },
  { id: "src-003", name: "パブリックコメント", tier: 1, lastChecked: "30分前", status: "active" },
  { id: "src-004", name: "薬事審議会", tier: 1, lastChecked: "1時間前", status: "active" },
  { id: "src-005", name: "PMDA", tier: 2, lastChecked: "2時間前", status: "active" },
  { id: "src-006", name: "ニュース", tier: 3, lastChecked: "15分前", status: "active" },
  { id: "src-007", name: "製品動向", tier: 4, lastChecked: "3時間前", status: "delayed" },
];
