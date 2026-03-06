"use client";

import { SourceTier } from "@/types";

interface SourceTierBadgeProps {
  tier: SourceTier;
  className?: string;
}

const tierConfig: Record<SourceTier, { label: string; color: string }> = {
  1: { label: "Tier 1 - Official Gov", color: "bg-emerald-900/60 text-emerald-300 border-emerald-600" },
  2: { label: "Tier 2 - Quasi-official", color: "bg-cyan-900/60 text-cyan-300 border-cyan-600" },
  3: { label: "Tier 3 - News", color: "bg-violet-900/60 text-violet-300 border-violet-600" },
  4: { label: "Tier 4 - Industry", color: "bg-amber-900/60 text-amber-300 border-amber-600" },
  5: { label: "Tier 5 - Community", color: "bg-red-900/60 text-red-300 border-red-600" },
};

export function SourceTierBadge({ tier, className = "" }: SourceTierBadgeProps) {
  const config = tierConfig[tier];
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-medium
        border ${config.color}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
