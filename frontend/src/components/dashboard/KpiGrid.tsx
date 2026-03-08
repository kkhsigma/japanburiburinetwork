"use client";

import { motion } from "framer-motion";
import { kpiData, type KpiItem } from "@/data/dashboard-mock";

const accentStyles: Record<KpiItem["accent"], { border: string; text: string; bg: string }> = {
  critical: {
    border: "border-red-200",
    text: "text-red-600",
    bg: "bg-red-50/50",
  },
  accent: {
    border: "border-teal-200",
    text: "text-teal-600",
    bg: "bg-teal-50/50",
  },
  signal: {
    border: "border-amber-200",
    text: "text-amber-600",
    bg: "bg-amber-50/50",
  },
  info: {
    border: "border-sky-200",
    text: "text-sky-600",
    bg: "bg-sky-50/50",
  },
};

export function KpiGrid() {
  return (
    <section className="px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiData.map((kpi, i) => {
          const style = accentStyles[kpi.accent];
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
              className={`
                rounded-xl bg-white border ${style.border} ${style.bg}
                p-4 sm:p-5 shadow-sm
              `}
            >
              <p className="text-2xs uppercase tracking-wider text-gray-400 font-medium">
                {kpi.label}
              </p>
              <p className={`mt-2 text-2xl sm:text-3xl font-bold ${style.text} tracking-tight`}>
                {kpi.value}
              </p>
              <p className="mt-1 text-2xs text-gray-400">{kpi.subtext}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
