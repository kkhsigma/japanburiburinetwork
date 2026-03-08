"use client";

import { motion } from "framer-motion";
import { latestAlerts, type DashboardAlert } from "@/data/dashboard-mock";
import type { AlertSeverity } from "@/types";

const severityConfig: Record<AlertSeverity, { label: string; border: string; badge: string }> = {
  critical: {
    label: "CRITICAL",
    border: "border-l-red-500",
    badge: "bg-red-50 text-red-600 border-red-200",
  },
  high: {
    label: "HIGH",
    border: "border-l-orange-500",
    badge: "bg-orange-50 text-orange-600 border-orange-200",
  },
  medium: {
    label: "MEDIUM",
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
  },
  low: {
    label: "LOW",
    border: "border-l-sky-500",
    badge: "bg-sky-50 text-sky-600 border-sky-200",
  },
};

function AlertRow({ alert, index }: { alert: DashboardAlert; index: number }) {
  const config = severityConfig[alert.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.3 + index * 0.06 }}
      className={`
        group bg-white border border-gray-200 rounded-xl p-4 sm:p-5
        border-l-[3px] ${config.border}
        hover:border-gray-300 hover:shadow-md transition-all duration-200
        shadow-sm
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium border ${config.badge}`}
            >
              {config.label}
            </span>
            <span className="text-2xs text-gray-400 font-mono">{alert.date}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-teal-700 transition-colors">
            {alert.title}
          </h3>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
            {alert.summary}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-2xs text-gray-400">
              出典: <span className="text-gray-600">{alert.source}</span>
            </span>
            <span className="text-2xs text-gray-400">
              物質: <span className="text-gray-600">{alert.substance}</span>
            </span>
          </div>
        </div>
        <a
          href={`/alerts/${alert.id}`}
          className="flex-shrink-0 px-3 py-1.5 rounded-md text-2xs font-medium text-teal-600 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
        >
          詳細を見る
        </a>
      </div>
    </motion.div>
  );
}

export function LatestAlerts() {
  return (
    <section id="alerts" className="px-4 pt-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">最新アラート</h2>
          <a
            href="/alerts"
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
          >
            すべて見る →
          </a>
        </motion.div>
        <div className="flex flex-col gap-3">
          {latestAlerts.map((alert, i) => (
            <AlertRow key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
