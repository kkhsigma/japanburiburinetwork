"use client";

import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { Compound, LegalStatus, RiskLevel } from "@/types";

interface EntityCardProps {
  compound: Compound;
  isWatched?: boolean;
  notificationEnabled?: boolean;
  onToggleWatch?: () => void;
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

const RISK_CONFIG: Record<RiskLevel, { label: string; dotColor: string }> = {
  safe: { label: "Legal", dotColor: "#22c55e" },
  low: { label: "Low Risk", dotColor: "#4ade80" },
  medium: { label: "Caution", dotColor: "#d4a72d" },
  high: { label: "High Risk", dotColor: "#f97316" },
  illegal: { label: "Illegal", dotColor: "#b91c1c" },
};

export function EntityCard({
  compound,
  isWatched = false,
  notificationEnabled = false,
  onToggleWatch,
}: EntityCardProps) {
  const status = STATUS_CONFIG[compound.legal_status_japan];
  const risk = RISK_CONFIG[compound.risk_level];

  return (
    <motion.div
      className="rounded-lg border border-[#1e293b] bg-[#111827] p-4"
      whileHover={{
        y: -2,
        borderColor: "rgba(30, 41, 59, 0.8)",
        transition: { duration: 0.2 },
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-[#e2e8f0]">
            {compound.name}
          </h3>
          {compound.aliases.length > 0 && (
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {compound.aliases[0]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-[#1a2332] text-[#64748b]">
            compound
          </span>
          {/* Notification toggle */}
          {isWatched && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWatch?.();
              }}
              className="p-1 rounded hover:bg-[#1a2332] transition-colors"
            >
              {notificationEnabled ? (
                <Bell size={14} className="text-[#1a9a8a]" />
              ) : (
                <BellOff size={14} className="text-[#64748b]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status + Risk */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          {status.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: risk.dotColor,
              boxShadow: `0 0 4px ${risk.dotColor}40`,
            }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: risk.dotColor }}
          >
            {risk.label}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-[#94a3b8] line-clamp-2">
        {compound.effects_summary}
      </p>
    </motion.div>
  );
}
