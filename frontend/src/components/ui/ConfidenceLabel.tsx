"use client";

import { ConfidenceLevel } from "@/types";
import { ShieldCheck, Shield, ShieldAlert, ShieldQuestion } from "lucide-react";

interface ConfidenceLabelProps {
  level: ConfidenceLevel;
  className?: string;
}

const config: Record<
  ConfidenceLevel,
  { label: string; color: string; Icon: typeof ShieldCheck }
> = {
  official: {
    label: "Official",
    color: "text-emerald-400",
    Icon: ShieldCheck,
  },
  verified: {
    label: "Verified",
    color: "text-accent-300",
    Icon: Shield,
  },
  unverified: {
    label: "Unverified",
    color: "text-signal-300",
    Icon: ShieldAlert,
  },
  rumor: {
    label: "Rumor",
    color: "text-critical-300",
    Icon: ShieldQuestion,
  },
};

export function ConfidenceLabel({ level, className = "" }: ConfidenceLabelProps) {
  const { label, color, Icon } = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${color} ${className}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}
