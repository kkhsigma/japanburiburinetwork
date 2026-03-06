"use client";

import { LegalStatus } from "@/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgePropsWithVariant {
  variant?: BadgeVariant;
  status?: never;
  children: React.ReactNode;
  className?: string;
}

interface BadgePropsWithStatus {
  variant?: never;
  status: LegalStatus;
  children?: never;
  className?: string;
}

type BadgeProps = BadgePropsWithVariant | BadgePropsWithStatus;

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-accent/10 text-accent-300 border-accent/20",
  success:
    "bg-emerald-900/20 text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-900/20 text-amber-400 border-amber-500/20",
  danger:
    "bg-red-900/20 text-red-400 border-red-500/20",
  info:
    "bg-sky-900/20 text-sky-400 border-sky-500/20",
  muted:
    "bg-navy-700/50 text-text-muted border-border",
};

const statusConfig: Record<LegalStatus, { label: string; variant: BadgeVariant }> = {
  unknown: { label: "UNKNOWN", variant: "muted" },
  under_review: { label: "UNDER REVIEW", variant: "warning" },
  pending: { label: "PENDING", variant: "info" },
  reported: { label: "REPORTED", variant: "info" },
  official_confirmed: { label: "CONFIRMED", variant: "default" },
  promulgated: { label: "PROMULGATED", variant: "default" },
  effective: { label: "EFFECTIVE", variant: "success" },
  recalled: { label: "RECALLED", variant: "danger" },
};

export function Badge(props: BadgeProps) {
  const { className = "" } = props;

  let resolvedVariant: BadgeVariant;
  let content: React.ReactNode;

  if ("status" in props && props.status != null) {
    const config = statusConfig[props.status];
    resolvedVariant = config.variant;
    content = config.label;
  } else {
    resolvedVariant = (props as BadgePropsWithVariant).variant ?? "default";
    content = (props as BadgePropsWithVariant).children;
  }

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-2xs font-medium tracking-wide uppercase
        border
        ${variantStyles[resolvedVariant]}
        ${className}
      `}
    >
      {content}
    </span>
  );
}
