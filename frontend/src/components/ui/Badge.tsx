"use client";

import { LegalStatus } from "@/types";

interface BadgeProps {
  status: LegalStatus;
  className?: string;
}

const statusConfig: Record<LegalStatus, { label: string; color: string }> = {
  unknown: { label: "UNKNOWN", color: "bg-gray-600 text-gray-200" },
  under_review: { label: "UNDER REVIEW", color: "bg-orange-900/60 text-orange-300" },
  pending: { label: "PENDING", color: "bg-purple-900/60 text-purple-300" },
  reported: { label: "REPORTED", color: "bg-blue-900/60 text-blue-300" },
  official_confirmed: { label: "CONFIRMED", color: "bg-cyan-900/60 text-cyan-300" },
  promulgated: { label: "PROMULGATED", color: "bg-teal-900/60 text-teal-300" },
  effective: { label: "EFFECTIVE", color: "bg-green-900/60 text-green-300" },
  recalled: { label: "RECALLED", color: "bg-red-900/60 text-red-300" },
};

export function Badge({ status, className = "" }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider
        ${config.color}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
