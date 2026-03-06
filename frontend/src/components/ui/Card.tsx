"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { AlertSeverity } from "@/types";

type CardVariant = "default" | "elevated" | "interactive" | "danger" | "warning";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Legacy prop — maps severity to left-border color */
  severity?: AlertSeverity;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-surface-elevated border border-border",
  elevated:
    "bg-surface-overlay border border-border shadow-elevated",
  interactive:
    "bg-surface-elevated border border-border cursor-pointer",
  danger:
    "bg-surface-elevated border border-critical-800 border-l-4 border-l-critical",
  warning:
    "bg-surface-elevated border border-signal-800 border-l-4 border-l-signal",
};

const severityBorderColors: Record<AlertSeverity, string> = {
  critical: "border-l-4 border-l-critical",
  high: "border-l-4 border-l-orange-500",
  medium: "border-l-4 border-l-signal",
  low: "border-l-4 border-l-sky-500",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", severity, className = "", children, ...props }, ref) => {
    const isInteractive = variant === "interactive";
    const severityClass = severity ? severityBorderColors[severity] : "";

    if (isInteractive) {
      return (
        <motion.div
          ref={ref}
          className={`rounded-xl shadow-card ${variantStyles[variant]} ${severityClass} ${className}`}
          whileHover={{
            y: -2,
            borderColor: "rgba(45, 58, 80, 1)",
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          {...(props as Record<string, unknown>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={`rounded-xl shadow-card ${variantStyles[variant]} ${severityClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
