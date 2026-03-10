"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { useWatchlistSync } from "@/hooks/useWatchlistSync";
import type { RiskLevel, LegalStatus, WatchlistEntry } from "@/types";

/* ── risk‑level colour map (dark‑theme) ── */
const riskConfig: Record<
  RiskLevel,
  { label: string; dot: string; text: string; glow: string; border: string }
> = {
  illegal: {
    label: "違法",
    dot: "bg-red-500",
    text: "text-red-400",
    glow: "shadow-[0_0_12px_rgba(239,68,68,0.35)]",
    border: "border-red-500/30",
  },
  high: {
    label: "高リスク",
    dot: "bg-orange-500",
    text: "text-orange-400",
    glow: "shadow-[0_0_12px_rgba(249,115,22,0.30)]",
    border: "border-orange-500/25",
  },
  medium: {
    label: "要注意",
    dot: "bg-amber-500",
    text: "text-amber-400",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.25)]",
    border: "border-amber-500/20",
  },
  low: {
    label: "低リスク",
    dot: "bg-sky-500",
    text: "text-sky-400",
    glow: "shadow-[0_0_10px_rgba(14,165,233,0.20)]",
    border: "border-sky-500/20",
  },
  safe: {
    label: "合法",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.20)]",
    border: "border-emerald-500/20",
  },
};

const statusLabels: Record<LegalStatus, string> = {
  unknown: "未確認",
  under_review: "審議中",
  pending: "保留",
  reported: "報告済",
  official_confirmed: "確認済",
  promulgated: "告示済",
  effective: "施行中",
  recalled: "撤回",
};

/* ── helpers ── */

/** Extract compound data from the watchlist entry (backend JOINs compound fields) */
function enrichEntry(entry: WatchlistEntry & Record<string, unknown>) {
  return {
    name: entry.entity_name || "Unknown",
    riskLevel: (typeof entry.risk_level === "string" ? entry.risk_level.toLowerCase() : "medium") as RiskLevel,
    legalStatus: ((entry.legal_status_japan as string) ?? "unknown") as LegalStatus,
  };
}

/* ── component ── */

export function TrackedSubstances() {
  useWatchlistSync();
  const entries = useWatchlistStore((s) => s.entries);

  /* only show compound‑type entries */
  const compoundEntries = entries.filter((e) => e.entity_type === "compound");

  return (
    <section className="relative z-10 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 mb-4"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]" />
          <h2 className="text-sm font-semibold text-gray-300 tracking-wide">
            追跡中
          </h2>
          {compoundEntries.length > 0 && (
            <span className="text-[10px] font-mono text-gray-500">
              {compoundEntries.length}
            </span>
          )}
        </motion.div>

        {/* Cards or empty CTA */}
        {compoundEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm px-5 py-4"
          >
            <p className="text-xs text-gray-500">
              物質を追跡して規制変更を監視
            </p>
            <Link
              href="/explore"
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap"
            >
              物質DBを見る →
            </Link>
          </motion.div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {compoundEntries.map((entry, i) => {
              const { name, riskLevel, legalStatus } = enrichEntry(
                entry as WatchlistEntry & Record<string, unknown>,
              );
              const rc = riskConfig[riskLevel];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.08 * i }}
                >
                  <Link
                    href={`/explore/compounds/${entry.entity_id}`}
                    className={`
                      group flex-shrink-0 w-[160px] rounded-xl border
                      ${rc.border}
                      bg-white/[0.03] backdrop-blur-sm
                      ${rc.glow}
                      hover:bg-white/[0.06] hover:scale-[1.02]
                      transition-all duration-200
                      px-4 py-3 block
                    `}
                  >
                    {/* Compound name */}
                    <p className="text-sm font-bold text-gray-200 truncate mb-1.5 group-hover:text-white transition-colors">
                      {name}
                    </p>

                    {/* Risk dot + label */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${rc.dot}`}
                      />
                      <span className={`text-[10px] font-medium ${rc.text}`}>
                        {rc.label}
                      </span>
                    </div>

                    {/* Legal status */}
                    <p className="text-[10px] text-gray-500 font-mono truncate">
                      {statusLabels[legalStatus]}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
