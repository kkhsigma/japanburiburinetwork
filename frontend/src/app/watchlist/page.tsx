"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, X, Filter, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchlist, useWatchlistHighlights, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useWatchlistSync } from "@/hooks/useWatchlistSync";
import { mockWatchlist, mockWatchlistHighlights } from "@/lib/mock-data";
import { WatchlistHighlightsBar } from "@/components/watchlist/WatchlistHighlightsBar";
import { EmptyWatchlist } from "@/components/watchlist/EmptyWatchlist";
import { NotificationToggle } from "@/components/tracking/NotificationToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWatchlistStore } from "@/stores/watchlistStore";
import type { RiskLevel, LegalStatus } from "@/types";

const RISK_DOT_COLORS: Record<RiskLevel, string> = {
  safe: "#22c55e",
  low: "#4ade80",
  medium: "#d4a72d",
  high: "#f97316",
  illegal: "#b91c1c",
};

const STATUS_LABELS: Record<LegalStatus, string> = {
  unknown: "Unknown",
  under_review: "Under Review",
  pending: "Pending",
  reported: "Reported",
  official_confirmed: "Confirmed",
  promulgated: "Promulgated",
  effective: "Effective",
  recalled: "Recalled",
};

const RISK_FILTER_OPTIONS: { value: RiskLevel | "all"; label: string; color: string }[] = [
  { value: "all", label: "すべて", color: "#94a3b8" },
  { value: "illegal", label: "違法", color: "#b91c1c" },
  { value: "high", label: "高リスク", color: "#f97316" },
  { value: "medium", label: "要注意", color: "#d4a72d" },
  { value: "low", label: "低リスク", color: "#4ade80" },
  { value: "safe", label: "合法", color: "#22c55e" },
];

// Backend returns risk_level as UPPERCASE; normalize to lowercase RiskLevel
function normalizeRiskLevel(raw: string | undefined | null): RiskLevel {
  if (!raw) return "medium";
  const lower = raw.toLowerCase();
  if (lower === "safe" || lower === "low" || lower === "medium" || lower === "high" || lower === "illegal") {
    return lower;
  }
  return "medium";
}

// Backend returns legal_status_japan as potentially uppercase or mixed
function normalizeLegalStatus(raw: string | undefined | null): LegalStatus {
  if (!raw) return "unknown";
  const lower = raw.toLowerCase();
  const valid: LegalStatus[] = [
    "unknown", "under_review", "pending", "reported",
    "official_confirmed", "promulgated", "effective", "recalled",
  ];
  return valid.includes(lower as LegalStatus) ? (lower as LegalStatus) : "unknown";
}

export default function WatchlistPage() {
  // Sync watchlist store with React Query data
  useWatchlistSync();

  const { data: watchlistData, isLoading, isError, refetch } = useWatchlist();
  const entries = watchlistData?.data ?? mockWatchlist;

  const { data: highlightsData } = useWatchlistHighlights();
  const highlights = highlightsData?.data ?? mockWatchlistHighlights;

  const removeMutation = useRemoveFromWatchlist();

  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  const handleRemove = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        removeMutation.mutate(id);
      } catch {
        useWatchlistStore.getState().removeEntry(id);
      }
    },
    [removeMutation],
  );

  // The API response includes legal_status_japan and risk_level from the JOIN.
  // These fields are not on the WatchlistEntry TS type, so we cast to access them.
  type EntryWithCompoundData = (typeof entries)[number] & {
    legal_status_japan?: string;
    risk_level?: string;
  };

  const entriesWithData = entries as EntryWithCompoundData[];

  const filteredEntries = riskFilter === "all"
    ? entriesWithData
    : entriesWithData.filter(
        (entry) => normalizeRiskLevel(entry.risk_level) === riskFilter,
      );

  return (
    <div className="min-h-screen bg-[#030303] text-[#e2e8f0]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#030303]/90 backdrop-blur-md border-b border-[#1e1e1e]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/universe"
            className="p-1.5 rounded-md hover:bg-[#1a1a1a] transition-colors"
            aria-label="Back to universe"
          >
            <ArrowLeft size={18} className="text-[#94a3b8]" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">ウォッチリスト</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-8">
            <section>
              <Skeleton className="h-4 w-28 mb-3" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-64 rounded-lg shrink-0" />
                ))}
              </div>
            </section>
            <section>
              <Skeleton className="h-4 w-36 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-lg" />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={28} className="text-[#64748b] mb-3" />
            <p className="text-sm text-[#94a3b8] mb-1">ウォッチリストの読み込みに失敗しました</p>
            <p className="text-xs text-[#64748b] mb-3">Could not load watchlist. Showing cached data.</p>
            <button
              onClick={() => refetch()}
              className="rounded-md px-4 py-2 text-xs text-[#1a9a8a] hover:bg-[#1e1e1e] transition-colors"
            >
              再読み込み / Retry
            </button>
          </div>
        )}

        {/* Highlights section */}
        {!isLoading && highlights.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
              最近の変更
            </h2>
            <WatchlistHighlightsBar highlights={highlights} />
          </section>
        )}

        {/* Tracked entries */}
        {!isLoading && entries.length === 0 ? (
          <EmptyWatchlist />
        ) : !isLoading ? (
          <section>
            <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
              追跡中の物質 ({entries.length}件)
            </h2>

            {/* Risk level filter bar */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              <Filter size={14} className="text-[#64748b] flex-shrink-0" />
              {RISK_FILTER_OPTIONS.map((opt) => {
                const isActive = riskFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setRiskFilter(opt.value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                      transition-all whitespace-nowrap border
                      ${isActive
                        ? "border-opacity-60 bg-opacity-20"
                        : "border-[#1e1e1e] bg-transparent text-[#64748b] hover:text-[#94a3b8] hover:border-[#2d3a4d]"
                      }
                    `}
                    style={
                      isActive
                        ? {
                            borderColor: `${opt.color}60`,
                            backgroundColor: `${opt.color}18`,
                            color: opt.color,
                          }
                        : undefined
                    }
                  >
                    {opt.value !== "all" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Cards grid with stagger animation */}
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEntries.map((entry, index) => {
                  const risk = normalizeRiskLevel(entry.risk_level);
                  const riskDot = RISK_DOT_COLORS[risk];
                  const legalStatus = normalizeLegalStatus(entry.legal_status_japan);
                  const legalLabel = STATUS_LABELS[legalStatus];
                  const shouldPulse = risk === "high" || risk === "illegal";

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        layout: { duration: 0.25 },
                      }}
                      whileHover={{ scale: 1.025 }}
                    >
                      <Link
                        href={`/explore/compounds/${entry.entity_id}`}
                        className="block relative rounded-lg border border-[#1e1e1e] bg-[#111111] p-4 hover:border-[#2d3a4d] transition-colors cursor-pointer"
                      >
                        {/* Remove button */}
                        <button
                          onClick={(e) => handleRemove(e, entry.id)}
                          className="absolute top-3 right-3 p-1 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1a1a] transition-colors z-10"
                          aria-label={`Remove ${entry.entity_name}`}
                        >
                          <X size={14} />
                        </button>

                        {/* Name + risk dot */}
                        <div className="flex items-center gap-2 mb-2 pr-6">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${shouldPulse ? "animate-pulse-risk" : ""}`}
                            style={{
                              backgroundColor: riskDot,
                              boxShadow: `0 0 4px ${riskDot}40`,
                            }}
                          />
                          <h3 className="text-base font-bold text-[#e2e8f0] truncate">
                            {entry.entity_name}
                          </h3>
                        </div>

                        {/* Legal status badge */}
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#1a1a1a] text-[#94a3b8] mb-2">
                          {legalLabel}
                        </span>

                        {/* Risk level tag */}
                        <span
                          className="inline-block ml-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2"
                          style={{
                            backgroundColor: `${riskDot}18`,
                            color: riskDot,
                          }}
                        >
                          {risk}
                        </span>

                        {/* Footer: last updated + notification toggle */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1e1e1e] mt-2">
                          <span className="text-[11px] text-[#64748b]">
                            {format(new Date(entry.created_at), "yyyy/MM/dd")}
                          </span>
                          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <NotificationToggle
                              entryId={entry.id}
                              enabled={entry.notification_enabled}
                            />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

            {/* No results for filter */}
            {filteredEntries.length === 0 && entries.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[#64748b] text-sm py-12"
              >
                このリスクレベルの追跡中の物質はありません
              </motion.p>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
