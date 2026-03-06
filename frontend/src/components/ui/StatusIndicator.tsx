"use client";

import { RiskLevel } from "@/types";

interface StatusIndicatorProps {
  riskLevel: RiskLevel;
  showLabel?: boolean;
  className?: string;
}

const config: Record<RiskLevel, { color: string; label: string }> = {
  safe: { color: "bg-green-500", label: "Legal" },
  low: { color: "bg-green-400", label: "Low Risk" },
  medium: { color: "bg-yellow-500", label: "Caution" },
  high: { color: "bg-orange-500", label: "High Risk" },
  illegal: { color: "bg-red-500", label: "Illegal" },
};

export function StatusIndicator({ riskLevel, showLabel = true, className = "" }: StatusIndicatorProps) {
  const { color, label } = config[riskLevel];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse-slow`} />
      {showLabel && <span className="text-xs font-medium text-gray-300">{label}</span>}
    </span>
  );
}
