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
  1: "border-emerald-500/20 hover:border-emerald-500/35",
  2: "border-cyan-500/20 hover:border-cyan-500/35",
  3: "border-violet-500/20 hover:border-violet-500/35",
  4: "border-amber-500/20 hover:border-amber-500/35",
  5: "border-red-500/20 hover:border-red-500/35",
};

const tierAccent: Record<SourceTier, string> = {
  1: "text-emerald-400",
  2: "text-cyan-400",
  3: "text-violet-400",
  4: "text-amber-400",
  5: "text-red-400",
};

const statusDot: Record<MonitoredSource["status"], string> = {
  active: "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]",
  delayed: "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]",
  error: "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]",
};

export function MonitoredSources() {
  return (
    <section id="sources" className="pt-8 pb-12">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold font-mono tracking-widest uppercase text-gray-400">監視ソース</span>
          <span className="text-[9px] font-mono text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
            {monitoredSources.length}件
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {monitoredSources.map((source, i) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.1 + i * 0.04 }}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                bg-white/[0.02] backdrop-blur-sm border
                ${tierStyle[source.tier]}
                hover:bg-white/[0.05] transition-all duration-200
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[source.status]}`} />
              <span className="text-[12px] font-medium text-gray-300 flex-1">{source.name}</span>
              <span className={`text-[9px] font-mono tracking-wider font-semibold ${tierAccent[source.tier]}`}>
                {tierLabel[source.tier]}
              </span>
              <span className="text-[9px] font-mono text-gray-600">{source.lastChecked}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
