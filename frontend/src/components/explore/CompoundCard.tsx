"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Compound, LegalStatus, RiskLevel } from "@/types";
import { TrackButton } from "@/components/tracking/TrackButton";

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

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; glow: string; gradient: string }> = {
  safe:    { label: "Legal",     color: "#22c55e", glow: "rgba(34, 197, 94, 0.3)",   gradient: "radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.03) 50%, transparent 70%)" },
  low:     { label: "Low Risk",  color: "#4ade80", glow: "rgba(74, 222, 128, 0.25)", gradient: "radial-gradient(ellipse at 30% 20%, rgba(74,222,128,0.12) 0%, rgba(74,222,128,0.03) 50%, transparent 70%)" },
  medium:  { label: "Caution",   color: "#d4a72d", glow: "rgba(212, 167, 45, 0.3)",  gradient: "radial-gradient(ellipse at 30% 20%, rgba(212,167,45,0.15) 0%, rgba(212,167,45,0.03) 50%, transparent 70%)" },
  high:    { label: "High Risk", color: "#f97316", glow: "rgba(249, 115, 22, 0.3)",  gradient: "radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.03) 50%, transparent 70%)" },
  illegal: { label: "Illegal",   color: "#ef4444", glow: "rgba(239, 68, 68, 0.35)",  gradient: "radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 50%, transparent 70%)" },
};

export function CompoundCard({ compound }: CompoundCardProps) {
  const statusKey = compound.legal_status_japan?.toLowerCase() as LegalStatus;
  const riskKey = compound.risk_level?.toLowerCase() as RiskLevel;
  const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.unknown;
  const risk = RISK_CONFIG[riskKey] ?? RISK_CONFIG.medium;

  return (
    <Link href={`/explore/compounds/${compound.id}`}>
      <motion.div
        className="relative rounded-xl overflow-hidden cursor-pointer group"
        style={{
          border: `1.5px solid ${risk.color}30`,
          boxShadow: `0 0 20px ${risk.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
        whileHover={{
          y: -3,
          scale: 1.01,
          boxShadow: `0 0 30px ${risk.glow}, 0 0 60px ${risk.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition: { duration: 0.25 },
        }}
      >
        {/* Planet-like radial gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `${risk.gradient}, radial-gradient(ellipse at 70% 80%, rgba(6,9,15,0.9) 0%, #0a0f1a 100%)`,
          }}
        />

        {/* Cyber scan-line overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
          }}
        />

        {/* Orbital arc decoration */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.07] pointer-events-none"
          style={{
            border: `1px solid ${risk.color}`,
          }}
        />
        <div
          className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full opacity-[0.04] pointer-events-none"
          style={{
            border: `1px solid ${risk.color}`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-[#e2e8f0] tracking-tight group-hover:text-white transition-colors">
                {compound.name}
              </h3>
              {compound.aliases.length > 0 && (
                <p className="text-[10px] text-[#64748b] mt-1 font-mono tracking-wide">
                  {compound.aliases.slice(0, 2).join(" · ")}
                </p>
              )}
            </div>
            {/* Risk orb indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <span
                  className="block w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: risk.color,
                    boxShadow: `0 0 8px ${risk.color}80, 0 0 16px ${risk.color}40`,
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: risk.color,
                    opacity: 0.2,
                  }}
                />
              </div>
              <span className="text-[11px] font-semibold font-mono tracking-wide" style={{ color: risk.color }}>
                {risk.label}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest"
              style={{
                backgroundColor: status.bg,
                color: status.color,
                border: `1px solid ${status.color}20`,
              }}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </span>
          </div>

          {/* Summary */}
          <p className="text-xs text-[#8b95a8] line-clamp-2 mb-4 leading-relaxed">
            {compound.effects_summary}
          </p>

          {/* Footer with cyber divider */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: `1px solid ${risk.color}15` }}
          >
            <p className="text-[10px] text-[#4a5568] font-mono tracking-wide">
              UPD {format(new Date(compound.legal_status_updated_at), "MMM d, yyyy")}
            </p>
            <TrackButton compound={{ id: compound.id, name: compound.name }} size="sm" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
