"use client";

import { motion } from "framer-motion";
import { latestAlerts, type DashboardAlert } from "@/data/dashboard-mock";
import type { AlertSeverity } from "@/types";

const severityConfig: Record<AlertSeverity, { label: string; border: string; dot: string; badge: string }> = {
  critical: {
    label: "CRITICAL",
    border: "border-l-red-500/80",
    dot: "bg-red-500",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
  },
  high: {
    label: "HIGH",
    border: "border-l-orange-500/80",
    dot: "bg-orange-500",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  },
  medium: {
    label: "MEDIUM",
    border: "border-l-amber-500/80",
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  low: {
    label: "LOW",
    border: "border-l-gray-600",
    dot: "bg-gray-500",
    badge: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  },
};

function AlertRow({ alert, index }: { alert: DashboardAlert; index: number }) {
  const config = severityConfig[alert.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
      className={`
        group rounded-lg border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm
        border-l-[3px] ${config.border}
        hover:bg-white/[0.05] hover:border-white/[0.1]
        transition-all duration-200
      `}
    >
      <div className="px-4 py-3">
        {/* Top row: severity + date + source */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider border ${config.badge}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">{alert.date}</span>
          <span className="text-[10px] text-gray-600">·</span>
          <span className="text-[10px] text-gray-500">{alert.source}</span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-gray-200 leading-snug group-hover:text-teal-400 transition-colors">
          {alert.title}
        </h3>

        {/* Summary */}
        <p className="mt-1 text-[11px] text-gray-500 leading-relaxed line-clamp-2">
          {alert.summary}
        </p>

        {/* Footer: substance + action */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-mono text-gray-500">
            対象: <span className="text-gray-300 font-semibold">{alert.substance}</span>
          </span>
          <a
            href={`/alerts/${alert.id}`}
            className="text-[10px] font-medium text-teal-500 hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            詳細 →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function LatestAlerts() {
  return (
    <section id="alerts" className="px-4 pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold font-mono tracking-widest uppercase text-gray-400">インシデントフィード</span>
            <span className="text-[9px] font-mono text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              {latestAlerts.length}件
            </span>
          </div>
          <a
            href="/alerts"
            className="text-[11px] text-gray-500 hover:text-teal-400 transition-colors"
          >
            すべて見る →
          </a>
        </div>
        <div className="flex flex-col gap-2">
          {latestAlerts.map((alert, i) => (
            <AlertRow key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
