"use client";

import { motion } from "framer-motion";
import { monitoredSources, type MonitoredSource } from "@/data/dashboard-mock";
import type { SourceTier } from "@/types";

const tierLabel: Record<SourceTier, string> = {
  1: "公式",
  2: "準公式",
  3: "報道",
  4: "市場",
  5: "未検証",
};

const tierStyle: Record<SourceTier, string> = {
  1: "border-emerald-400/30 bg-emerald-500/5",
  2: "border-cyan-400/30 bg-cyan-500/5",
  3: "border-violet-400/30 bg-violet-500/5",
  4: "border-amber-400/30 bg-amber-500/5",
  5: "border-red-400/30 bg-red-500/5",
};

const statusDot: Record<MonitoredSource["status"], string> = {
  active: "bg-emerald-500",
  delayed: "bg-amber-500",
  error: "bg-red-500",
};

export function MonitoredSources() {
  return (
    <section id="sources" className="pt-8 pb-12">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="section-label font-mono">監視ソース</span>
          <span className="text-[9px] font-mono text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">
            {monitoredSources.length}件
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {monitoredSources.map((source, i) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.04 }}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                bg-white/60 backdrop-blur-sm border
                ${tierStyle[source.tier]}
                hover:bg-white hover:shadow-sm transition-all duration-200
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[source.status]}`} />
              <span className="text-[12px] font-medium text-gray-800 flex-1">{source.name}</span>
              <span className="text-[9px] font-mono text-gray-400 tracking-wider">
                {tierLabel[source.tier]}
              </span>
              <span className="text-[9px] font-mono text-gray-300">{source.lastChecked}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
