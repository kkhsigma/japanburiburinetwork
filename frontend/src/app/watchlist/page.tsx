"use client";

import { useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, X } from "lucide-react";
import { useWatchlist, useWatchlistHighlights, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { mockWatchlist, mockWatchlistHighlights, mockCompounds } from "@/lib/mock-data";
import { WatchlistHighlightsBar } from "@/components/watchlist/WatchlistHighlightsBar";
import { EmptyWatchlist } from "@/components/watchlist/EmptyWatchlist";
import { NotificationToggle } from "@/components/tracking/NotificationToggle";
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

export default function WatchlistPage() {
  const { data: watchlistData } = useWatchlist();
  const entries = watchlistData?.data ?? mockWatchlist;

  const { data: highlightsData } = useWatchlistHighlights();
  const highlights = highlightsData?.data ?? mockWatchlistHighlights;

  const removeMutation = useRemoveFromWatchlist();

  const handleRemove = useCallback(
    (id: string) => {
      try {
        removeMutation.mutate(id);
      } catch {
        useWatchlistStore.getState().removeEntry(id);
      }
    },
    [removeMutation],
  );

  return (
    <div className="min-h-screen bg-[#06090f] text-[#e2e8f0]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#06090f]/90 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/universe"
            className="p-1.5 rounded-md hover:bg-[#1a2332] transition-colors"
            aria-label="Back to universe"
          >
            <ArrowLeft size={18} className="text-[#94a3b8]" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">ウォッチリスト</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Highlights section */}
        {highlights.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
              最近の変更
            </h2>
            <WatchlistHighlightsBar highlights={highlights} />
          </section>
        )}

        {/* Tracked entries */}
        {entries.length === 0 ? (
          <EmptyWatchlist />
        ) : (
          <section>
            <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
              追跡中の物質 ({entries.length}件)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => {
                const compound = mockCompounds.find((c) => c.id === entry.entity_id);
                const riskDot = compound
                  ? RISK_DOT_COLORS[compound.risk_level]
                  : "#64748b";
                const legalLabel = compound
                  ? STATUS_LABELS[compound.legal_status_japan]
                  : entry.entity_type;

                return (
                  <div
                    key={entry.id}
                    className="relative rounded-lg border border-[#1e293b] bg-[#111827] p-4 hover:border-[#2d3a4d] transition-colors"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="absolute top-3 right-3 p-1 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a2332] transition-colors"
                      aria-label={`Remove ${entry.entity_name}`}
                    >
                      <X size={14} />
                    </button>

                    {/* Name + risk dot */}
                    <div className="flex items-center gap-2 mb-2 pr-6">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
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
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#1a2332] text-[#94a3b8] mb-2">
                      {legalLabel}
                    </span>

                    {/* Summary */}
                    {compound && (
                      <p className="text-xs text-[#94a3b8] line-clamp-2 mb-3">
                        {compound.effects_summary}
                      </p>
                    )}

                    {/* Footer: last updated + notification toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
                      <span className="text-[11px] text-[#64748b]">
                        {format(new Date(entry.created_at), "yyyy/MM/dd")}
                      </span>
                      <NotificationToggle
                        entryId={entry.id}
                        enabled={entry.notification_enabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
