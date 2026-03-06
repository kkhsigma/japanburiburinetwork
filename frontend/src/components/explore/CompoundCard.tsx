"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Compound, LegalStatus, RiskLevel } from "@/types";

interface CompoundCardProps {
  compound: Compound;
}

const STATUS_CONFIG: Record<LegalStatus, { label: string; color: string; bg: string }> = {
  unknown: { label: "Unknown", color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" },
  under_review: { label: "Under Review", color: "#d4a72d", bg: "rgba(212, 167, 45, 0.12)" },
  pending: { label: "Pending", color: "#d4a72d", bg: "rgba(212, 167, 45, 0.12)" },
  reported: { label: "Reported", color: "#d4a72d", bg: "rgba(212, 167, 45, 0.12)" },
  official_confirmed: { label: "Confirmed", color: "#1a9a8a", bg: "rgba(26, 154, 138, 0.12)" },
  promulgated: { label: "Promulgated", color: "#b91c1c", bg: "rgba(185, 28, 28, 0.12)" },
  effective: { label: "Effective", color: "#1a9a8a", bg: "rgba(26, 154, 138, 0.12)" },
  recalled: { label: "Recalled", color: "#b91c1c", bg: "rgba(185, 28, 28, 0.12)" },
};

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; dotColor: string }> = {
  safe: { label: "Legal", color: "#22c55e", dotColor: "#22c55e" },
  low: { label: "Low Risk", color: "#4ade80", dotColor: "#4ade80" },
  medium: { label: "Caution", color: "#d4a72d", dotColor: "#d4a72d" },
  high: { label: "High Risk", color: "#f97316", dotColor: "#f97316" },
  illegal: { label: "Illegal", color: "#b91c1c", dotColor: "#b91c1c" },
};

export function CompoundCard({ compound }: CompoundCardProps) {
  const status = STATUS_CONFIG[compound.legal_status_japan];
  const risk = RISK_CONFIG[compound.risk_level];

  return (
    <Link href={`/explore/compounds/${compound.id}`}>
      <motion.div
        className="rounded-lg border border-[#1e293b] bg-[#111827] p-4 cursor-pointer"
        whileHover={{
          y: -2,
          borderColor: "rgba(30, 41, 59, 0.8)",
          transition: { duration: 0.2 },
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-[#e2e8f0]">{compound.name}</h3>
            {compound.aliases.length > 0 && (
              <p className="text-[11px] text-[#64748b] mt-0.5 font-mono">
                {compound.aliases.slice(0, 2).join(" / ")}
              </p>
            )}
          </div>
          {/* Risk indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: risk.dotColor,
                boxShadow: `0 0 6px ${risk.dotColor}40`,
              }}
            />
            <span className="text-xs font-medium" style={{ color: risk.color }}>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#94a3b8] line-clamp-2 mb-3">
          {compound.effects_summary}
        </p>

        {/* Footer */}
        <p className="text-[11px] text-[#64748b] font-mono">
          Updated {format(new Date(compound.legal_status_updated_at), "MMM d, yyyy")}
        </p>
      </motion.div>
    </Link>
  );
}
