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

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; glow: string; gradient: string }> = {
  safe:    { label: "Legal",     color: "#22c55e", glow: "rgba(34, 197, 94, 0.25)",   gradient: "radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.02) 50%, transparent 70%)" },
  low:     { label: "Low Risk",  color: "#4ade80", glow: "rgba(74, 222, 128, 0.2)",   gradient: "radial-gradient(ellipse at 30% 20%, rgba(74,222,128,0.10) 0%, rgba(74,222,128,0.02) 50%, transparent 70%)" },
  medium:  { label: "Caution",   color: "#d4a72d", glow: "rgba(212, 167, 45, 0.25)",  gradient: "radial-gradient(ellipse at 30% 20%, rgba(212,167,45,0.12) 0%, rgba(212,167,45,0.02) 50%, transparent 70%)" },
  high:    { label: "High Risk", color: "#f97316", glow: "rgba(249, 115, 22, 0.25)",  gradient: "radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.02) 50%, transparent 70%)" },
  illegal: { label: "Illegal",   color: "#ef4444", glow: "rgba(239, 68, 68, 0.3)",    gradient: "radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.03) 50%, transparent 70%)" },
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
      className="relative rounded-xl overflow-hidden group"
      style={{
        border: `1.5px solid ${risk.color}30`,
        boxShadow: `0 0 18px ${risk.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
      whileHover={{
        y: -3,
        scale: 1.01,
        boxShadow: `0 0 28px ${risk.glow}, 0 0 50px ${risk.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: { duration: 0.25 },
      }}
    >
      {/* Planet gradient bg */}
      <div
        className="absolute inset-0"
        style={{
          background: `${risk.gradient}, radial-gradient(ellipse at 70% 80%, rgba(6,9,15,0.9) 0%, #0a0f1a 100%)`,
        }}
      />

      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />

      {/* Orbital arc */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.06] pointer-events-none"
        style={{ border: `1px solid ${risk.color}` }}
      />

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-[#e2e8f0] tracking-tight group-hover:text-white transition-colors">
              {compound.name}
            </h3>
            {compound.aliases.length > 0 && (
              <p className="text-[10px] text-[#4a5568] mt-1 font-mono tracking-wide">
                {compound.aliases[0]}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest font-mono"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "#4a5568",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              compound
            </span>
            {isWatched && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWatch?.();
                }}
                className="p-1 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                {notificationEnabled ? (
                  <Bell size={14} className="text-[#1a9a8a]" style={{ filter: "drop-shadow(0 0 4px rgba(26,154,138,0.4))" }} />
                ) : (
                  <BellOff size={14} className="text-[#4a5568]" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status + Risk */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
            style={{
              backgroundColor: status.bg,
              color: status.color,
              border: `1px solid ${status.color}20`,
            }}
          >
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <span
                className="block w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: risk.color,
                  boxShadow: `0 0 8px ${risk.color}60`,
                }}
              />
            </div>
            <span
              className="text-[11px] font-semibold font-mono tracking-wide"
              style={{ color: risk.color }}
            >
              {risk.label}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#8b95a8] line-clamp-2 leading-relaxed">
          {compound.effects_summary}
        </p>
      </div>
    </motion.div>
  );
}
