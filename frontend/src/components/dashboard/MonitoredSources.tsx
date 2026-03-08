"use client";

import { motion } from "framer-motion";
import { monitoredSources, type MonitoredSource } from "@/data/dashboard-mock";
import type { SourceTier } from "@/types";

const tierStyles: Record<SourceTier, string> = {
  1: "border-emerald-200 bg-emerald-50/40",
  2: "border-cyan-200 bg-cyan-50/40",
  3: "border-violet-200 bg-violet-50/40",
  4: "border-amber-200 bg-amber-50/40",
  5: "border-red-200 bg-red-50/40",
};

const statusDot: Record<MonitoredSource["status"], string> = {
  active: "bg-emerald-500",
  delayed: "bg-amber-500",
  error: "bg-red-500",
};

export function MonitoredSources() {
  return (
    <section id="sources" className="px-4 pt-12 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">監視ソース</h2>
        </motion.div>
        <div className="flex flex-wrap gap-2.5">
          {monitoredSources.map((source, i) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
              className={`
                inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg
                bg-white border ${tierStyles[source.tier]}
                hover:shadow-sm transition-all duration-200 shadow-sm
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${statusDot[source.status]}`} />
              <span className="text-xs font-medium text-gray-800">{source.name}</span>
              <span className="text-2xs text-gray-400 font-mono">T{source.tier}</span>
              <span className="text-2xs text-gray-400">{source.lastChecked}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
