"use client";

import { SourceTier } from "@/types";

interface SourceTierBadgeProps {
  tier: SourceTier;
  className?: string;
}

const tierConfig: Record<SourceTier, { label: string; color: string }> = {
  1: {
    label: "Tier 1 - Official Gov",
    color: "bg-emerald-900/15 text-emerald-400 border-emerald-500/20",
  },
  2: {
    label: "Tier 2 - Quasi-official",
    color: "bg-cyan-900/15 text-cyan-400 border-cyan-500/20",
  },
  3: {
    label: "Tier 3 - News",
    color: "bg-violet-900/15 text-violet-400 border-violet-500/20",
  },
  4: {
    label: "Tier 4 - Industry",
    color: "bg-amber-900/15 text-amber-400 border-amber-500/20",
  },
  5: {
    label: "Tier 5 - Community",
    color: "bg-red-900/15 text-red-400 border-red-500/20",
  },
};

export function SourceTierBadge({ tier, className = "" }: SourceTierBadgeProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-2xs font-medium tracking-wide
        border ${config.color}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
