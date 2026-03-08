"use client";

import { motion } from "framer-motion";
import { trackedSubstances, type TrackedSubstance } from "@/data/dashboard-mock";
import type { RiskLevel, LegalStatus } from "@/types";

const riskConfig: Record<RiskLevel, { label: string; style: string }> = {
  safe: { label: "安全", style: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  low: { label: "低リスク", style: "bg-sky-50 text-sky-600 border-sky-200" },
  medium: { label: "中リスク", style: "bg-amber-50 text-amber-600 border-amber-200" },
  high: { label: "高リスク", style: "bg-orange-50 text-orange-600 border-orange-200" },
  illegal: { label: "違法", style: "bg-red-50 text-red-600 border-red-200" },
};

const statusLabels: Record<LegalStatus, string> = {
  unknown: "不明",
  under_review: "審議中",
  pending: "保留",
  reported: "報告済",
  official_confirmed: "確認済",
  promulgated: "告示済",
  effective: "施行中",
  recalled: "撤回",
};

function SubstanceCard({ substance, index }: { substance: TrackedSubstance; index: number }) {
  const risk = riskConfig[substance.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 + index * 0.05 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 tracking-wide">{substance.name}</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium border ${risk.style}`}>
          {risk.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xs text-gray-400">法的ステータス:</span>
        <span className="text-2xs font-medium text-gray-600">
          {statusLabels[substance.legalStatus]}
        </span>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mb-3">{substance.note}</p>

      <div className="flex items-center justify-between">
        <span className="text-2xs text-gray-400 font-mono">{substance.lastUpdate}</span>
        <a
          href={`/explore/compounds/${substance.id}`}
          className="text-2xs text-teal-600 hover:text-teal-700 transition-colors"
        >
          詳細 →
        </a>
      </div>
    </motion.div>
  );
}

export function TrackedSubstances() {
  return (
    <section id="substances" className="px-4 pt-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">追跡物質</h2>
          <a
            href="/explore"
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
          >
            すべて見る →
          </a>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {trackedSubstances.map((substance, i) => (
            <SubstanceCard key={substance.id} substance={substance} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
