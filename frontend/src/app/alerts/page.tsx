"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertCardSkeleton } from "@/components/ui/Skeleton";
import { mockAlerts } from "@/lib/mock-data";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertSeverity, AlertCategory } from "@/types";
import { AlertTriangle, Filter } from "lucide-react";

const SEVERITY_OPTIONS: { label: string; value: AlertSeverity | "all" }[] = [
  { label: "すべての重要度", value: "all" },
  { label: "緊急", value: "critical" },
  { label: "高", value: "high" },
  { label: "中", value: "medium" },
  { label: "低", value: "low" },
];

const CATEGORY_OPTIONS: { label: string; value: AlertCategory | "all" }[] = [
  { label: "すべてのカテゴリ", value: "all" },
  { label: "規制", value: "regulation" },
  { label: "指定薬物", value: "designated_substance" },
  { label: "閾値", value: "threshold" },
  { label: "取締り", value: "enforcement" },
  { label: "市場", value: "market" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | "all">("all");

  const alertsQuery = useAlerts(
    severityFilter === "all" ? {} : { severity: severityFilter }
  );

  const allAlerts = alertsQuery.data?.data ?? mockAlerts;

  const filtered = allAlerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    return true;
  });

  const isLoading = alertsQuery.isLoading;

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <AlertTriangle size={20} className="text-[#b91c1c]" />
              <h1 className="text-2xl font-bold text-[#e2e8f0]">アラート</h1>
            </div>
            <p className="text-sm text-[#64748b]">
              規制変更差分検出レーダー
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <Filter size={14} />
            <span>{filtered.length}件のアラート</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-[#1e293b] bg-[#0c1220]">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | "all")}
            className="px-3 py-2 rounded-lg text-sm bg-[#111827] border border-[#1e293b] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#1a9a8a]/50 cursor-pointer"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AlertCategory | "all")}
            className="px-3 py-2 rounded-lg text-sm bg-[#111827] border border-[#1e293b] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#1a9a8a]/50 cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {(severityFilter !== "all" || categoryFilter !== "all") && (
            <button
              onClick={() => {
                setSeverityFilter("all");
                setCategoryFilter("all");
              }}
              className="px-3 py-2 rounded-lg text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#111827] transition-colors"
            >
              フィルターをクリア
            </button>
          )}
        </div>

        {/* Alert list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <AlertCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((alert) => (
              <motion.div key={alert.id} variants={itemVariants}>
                <AlertCard alert={alert} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#64748b] text-sm">
                  現在のフィルターに一致するアラートはありません。
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
