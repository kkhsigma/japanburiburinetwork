"use client";

import { motion } from "framer-motion";
import { kpiData } from "@/data/dashboard-mock";

const accentColors: Record<string, string> = {
  critical: "text-red-400",
  accent: "text-teal-400",
  signal: "text-amber-400",
  info: "text-sky-400",
};

const accentGlow: Record<string, string> = {
  critical: "shadow-[0_0_8px_rgba(239,68,68,0.3)]",
  accent: "shadow-[0_0_8px_rgba(45,212,191,0.3)]",
  signal: "shadow-[0_0_8px_rgba(245,158,11,0.3)]",
  info: "shadow-[0_0_8px_rgba(56,189,248,0.3)]",
};

const accentDot: Record<string, string> = {
  critical: "bg-red-400",
  accent: "bg-teal-400",
  signal: "bg-amber-400",
  info: "bg-sky-400",
};

export function StatusBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative z-20 max-w-5xl mx-auto px-4"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            {/* Glow dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full ${accentDot[kpi.accent]} ${accentGlow[kpi.accent]} animate-pulse`}
            />

            {/* KPI content */}
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-bold font-mono tabular-nums ${accentColors[kpi.accent]}`}>
                {kpi.value}
              </span>
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                {kpi.label}
              </span>
            </div>

            {/* Divider — not on last item */}
            {i < kpiData.length - 1 && (
              <span className="w-px h-4 bg-white/[0.06] ml-1" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Subtle scan line effect */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <span className="text-[8px] font-mono text-gray-600 tracking-widest">
          ライブ監視中
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>
    </motion.div>
  );
}
