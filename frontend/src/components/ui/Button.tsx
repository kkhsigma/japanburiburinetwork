"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-400 active:bg-accent-700",
  secondary:
    "bg-transparent text-text-primary border border-border hover:border-border-hover hover:bg-surface-overlay active:bg-surface-elevated",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:bg-surface-overlay",
  danger:
    "bg-critical text-white hover:bg-critical-400 active:bg-critical-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-lg gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium
          transition-colors duration-150 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        whileHover={disabled ? undefined : { scale: 1.015 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.12 }}
        disabled={disabled}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
