"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { mockCompounds } from "@/lib/mock-data";
import type { RiskLevel, LegalStatus } from "@/types";

const riskConfig: Record<RiskLevel, { label: string; style: string; sort: number }> = {
  illegal: { label: "違法", style: "bg-red-100 text-red-700 border-red-200", sort: 0 },
  high: { label: "高リスク", style: "bg-orange-100 text-orange-700 border-orange-200", sort: 1 },
  medium: { label: "要注意", style: "bg-amber-100 text-amber-700 border-amber-200", sort: 2 },
  low: { label: "低リスク", style: "bg-sky-100 text-sky-700 border-sky-200", sort: 3 },
  safe: { label: "合法", style: "bg-emerald-100 text-emerald-700 border-emerald-200", sort: 4 },
};

const statusConfig: Record<LegalStatus, { label: string; dot: string }> = {
  effective: { label: "施行済", dot: "bg-red-500" },
  promulgated: { label: "公布済（施行予定）", dot: "bg-orange-500" },
  official_confirmed: { label: "公式確認", dot: "bg-emerald-500" },
  under_review: { label: "審査中", dot: "bg-amber-500" },
  pending: { label: "保留", dot: "bg-yellow-500" },
  reported: { label: "報告済", dot: "bg-violet-500" },
  unknown: { label: "未確認", dot: "bg-gray-400" },
  recalled: { label: "リコール", dot: "bg-rose-600" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// Sort by risk: illegal first
const sorted = [...mockCompounds].sort(
  (a, b) => riskConfig[a.risk_level].sort - riskConfig[b.risk_level].sort
);

export function SubstanceDirectory() {
  return (
    <section className="px-4 pt-10 pb-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900">規制物質ディレクトリ</h2>
          <p className="mt-1 text-sm text-gray-500">
            各物質の法的ステータス・規制日・リスクレベルを一覧で確認
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  物質名
                </th>
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  種別
                </th>
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  リスク
                </th>
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  法的ステータス
                </th>
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  最終更新
                </th>
                <th className="py-3.5 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  説明
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((compound, i) => {
                const risk = riskConfig[compound.risk_level];
                const status = statusConfig[compound.legal_status_japan];
                const isIllegal = compound.risk_level === "illegal";

                return (
                  <motion.tr
                    key={compound.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.03 }}
                    className={`group hover:bg-gray-50/80 transition-colors ${isIllegal ? "bg-red-50/30" : ""}`}
                  >
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/explore/compounds/${compound.id}`}
                        className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors"
                      >
                        {compound.name}
                      </Link>
                      <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">
                        {compound.aliases[0]}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        compound.natural_or_synthetic === "natural"
                          ? "bg-green-50 text-green-700"
                          : "bg-violet-50 text-violet-700"
                      }`}>
                        {compound.natural_or_synthetic === "natural" ? "天然" : "合成"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${risk.style}`}
                      >
                        {risk.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                        <span className="text-xs text-gray-700 font-medium">{status.label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 hidden md:table-cell">
                      <span className="text-xs text-gray-500 font-mono">
                        {formatDate(compound.legal_status_updated_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 hidden lg:table-cell max-w-xs">
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {compound.effects_summary}
                      </p>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-3 text-xs text-gray-400">
          物質名をクリックすると詳細な規制情報・変更履歴を確認できます
        </p>
      </div>
    </section>
  );
}
