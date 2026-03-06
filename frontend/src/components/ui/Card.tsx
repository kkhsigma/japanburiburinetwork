"use client";

import { HTMLAttributes, forwardRef } from "react";
import { AlertSeverity } from "@/types";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  severity?: AlertSeverity;
  hoverable?: boolean;
}

const severityBorderColors: Record<AlertSeverity, string> = {
  critical: "border-l-alert-red",
  high: "border-l-alert-orange",
  medium: "border-l-alert-yellow",
  low: "border-l-alert-blue",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ severity, hoverable = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-navy-700 rounded-xl border border-navy-600 shadow-card
          ${severity ? `border-l-4 ${severityBorderColors[severity]}` : ""}
          ${hoverable ? "hover:shadow-card-hover hover:border-navy-500 transition-all duration-200 cursor-pointer" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
