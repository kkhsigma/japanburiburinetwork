"use client";

import { RiskLevel } from "@/types";

interface StatusIndicatorProps {
  riskLevel: RiskLevel;
  showLabel?: boolean;
  className?: string;
}

const config: Record<RiskLevel, { color: string; ringColor: string; label: string }> = {
  safe: {
    color: "bg-emerald-500",
    ringColor: "ring-emerald-500/20",
    label: "Legal",
  },
  low: {
    color: "bg-emerald-400",
    ringColor: "ring-emerald-400/20",
    label: "Low Risk",
  },
  medium: {
    color: "bg-signal",
    ringColor: "ring-signal/20",
    label: "Caution",
  },
  high: {
    color: "bg-orange-500",
    ringColor: "ring-orange-500/20",
    label: "High Risk",
  },
  illegal: {
    color: "bg-critical",
    ringColor: "ring-critical/20",
    label: "Illegal",
  },
};

export function StatusIndicator({
  riskLevel,
  showLabel = true,
  className = "",
}: StatusIndicatorProps) {
  const key = (riskLevel?.toLowerCase() || 'low') as RiskLevel;
  const { color, ringColor, label } = config[key] || config.low;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`w-2.5 h-2.5 rounded-full ${color} ring-4 ${ringColor} animate-pulse-slow`}
      />
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      )}
    </span>
  );
}
