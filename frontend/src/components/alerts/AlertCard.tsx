"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Alert, AlertSeverity, SourceTier } from "@/types";

interface AlertCardProps {
  alert: Alert;
}

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#b91c1c",
  high: "#d4a72d",
  medium: "#1a9a8a",
  low: "#64748b",
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const SEVERITY_BG: Record<AlertSeverity, string> = {
  critical: "rgba(185, 28, 28, 0.12)",
  high: "rgba(212, 167, 45, 0.12)",
  medium: "rgba(26, 154, 138, 0.12)",
  low: "rgba(100, 116, 139, 0.12)",
};

const TIER_LABELS: Record<SourceTier, string> = {
  1: "T1",
  2: "T2",
  3: "T3",
  4: "T4",
  5: "T5",
};

export function AlertCard({ alert }: AlertCardProps) {
  const severityColor = SEVERITY_COLORS[alert.severity];

  return (
    <Link href={`/alerts/${alert.id}`}>
      <motion.div
        className="relative rounded-lg border border-[#1e293b] bg-[#111827] p-4 cursor-pointer overflow-hidden"
        style={{ borderLeftWidth: "3px", borderLeftColor: severityColor }}
        whileHover={{
          y: -2,
          borderColor: "rgba(30, 41, 59, 0.8)",
          transition: { duration: 0.2 },
        }}
      >
        {/* Top row: title + time */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-[#e2e8f0] line-clamp-2 flex-1">
            {alert.title}
          </h3>
          <span className="text-[11px] text-[#64748b] whitespace-nowrap flex-shrink-0 font-mono">
            {format(new Date(alert.published_at), "MMM d")}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#94a3b8] line-clamp-1 mb-3">
          {alert.summary_what}
        </p>

        {/* Bottom row: badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Severity badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: SEVERITY_BG[alert.severity],
                color: severityColor,
              }}
            >
              {SEVERITY_LABELS[alert.severity]}
            </span>

            {/* Source tier */}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#64748b] bg-[#1a2332]">
              {TIER_LABELS[alert.source_tier]}
            </span>
          </div>

          {/* Compound tags */}
          <div className="flex items-center gap-1.5">
            {alert.compounds.slice(0, 3).map((compound) => (
              <span
                key={compound}
                className="px-1.5 py-0.5 bg-[#1a2332] text-[#94a3b8] text-[10px] rounded font-mono"
              >
                {compound}
              </span>
            ))}
            {alert.compounds.length > 3 && (
              <span className="text-[10px] text-[#64748b]">
                +{alert.compounds.length - 3}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
