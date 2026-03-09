"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LegalStatus = "legal" | "gray" | "illegal" | "designated" | "medical";
type Filter = LegalStatus | "all";

const FILTERS: { value: Filter; label: string; color: string }[] = [
  { value: "all",        label: "すべて",       color: "#94a3b8" },
  { value: "legal",      label: "合法",         color: "#22c55e" },
  { value: "medical",    label: "条件付き許可", color: "#0ea5e9" },
  { value: "gray",       label: "グレーゾーン", color: "#f59e0b" },
  { value: "designated", label: "指定薬物",     color: "#a855f7" },
  { value: "illegal",    label: "違法",         color: "#ef4444" },
];

interface Substance {
  name: string;
  nameJa: string;
  status: LegalStatus;
  statusLabel: string;
  description: string;
  color: string;
}

const SUBSTANCES: Substance[] = [
  {
    name: "シロシビン",
    nameJa: "Psilocybin（マジックマッシュルーム）",
    status: "illegal",
    statusLabel: "違法",
    color: "#a855f7",
    description: "麻薬及び向精神薬取締法により規制。所持・使用・譲渡が禁止。海外では臨床試験が進行中。",
  },
  {
    name: "LSD",
    nameJa: "リゼルグ酸ジエチルアミド",
    status: "illegal",
    statusLabel: "違法",
    color: "#ef4444",
    description: "麻薬取締法により厳格に禁止。微量でも強力な精神活性作用。マイクロドーシング研究が注目。",
  },
  {
    name: "MDMA",
    nameJa: "メチレンジオキシメタンフェタミン",
    status: "illegal",
    statusLabel: "違法",
    color: "#ec4899",
    description: "麻薬取締法により禁止。米国FDAがPTSD治療として画期的治療薬指定。2024年承認審査。",
  },
  {
    name: "DMT",
    nameJa: "ジメチルトリプタミン",
    status: "illegal",
    statusLabel: "違法",
    color: "#f97316",
    description: "麻薬取締法により規制。アヤワスカの主成分。短時間の強力な精神活性作用。",
  },
  {
    name: "ケタミン",
    nameJa: "Ketamine",
    status: "medical",
    statusLabel: "条件付き許可",
    color: "#0ea5e9",
    description: "麻酔薬として医療使用が許可。治療抵抗性うつ病への適応が世界的に拡大。",
  },
  {
    name: "メスカリン",
    nameJa: "Mescaline（ペヨーテ）",
    status: "illegal",
    statusLabel: "違法",
    color: "#f59e0b",
    description: "麻薬取締法により規制。サボテン由来の天然サイケデリクス。先住民族の宗教使用は一部例外。",
  },
  {
    name: "2C-B",
    nameJa: "4-ブロモ-2,5-ジメトキシフェネチルアミン",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#d946ef",
    description: "指定薬物として規制。フェネチルアミン系合成サイケデリクス。",
  },
  {
    name: "イボガイン",
    nameJa: "Ibogaine",
    status: "gray",
    statusLabel: "グレーゾーン",
    color: "#eab308",
    description: "日本では明確な規制なし。依存症治療への応用研究が進行中。一部の国で治療的使用。",
  },
  {
    name: "5-MeO-DMT",
    nameJa: "5-メトキシ-N,N-ジメチルトリプタミン",
    status: "illegal",
    statusLabel: "違法",
    color: "#fb923c",
    description: "麻薬取締法により規制。ヒキガエル由来。極めて強力な短時間作用。",
  },
  {
    name: "サルビア",
    nameJa: "Salvia divinorum",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#c084fc",
    description: "2007年に指定薬物に追加。κ-オピオイド受容体作動薬。強力な解離作用。",
  },
  {
    name: "エスケタミン",
    nameJa: "Esketamine（スプラバト）",
    status: "medical",
    statusLabel: "条件付き許可",
    color: "#14b8a6",
    description: "2019年FDA承認。治療抵抗性うつ病への鼻腔スプレー。日本でも承認。",
  },
  {
    name: "PCP",
    nameJa: "フェンシクリジン",
    status: "illegal",
    statusLabel: "違法",
    color: "#dc2626",
    description: "麻薬取締法により厳格に禁止。強力な解離性麻酔薬。医療用途なし。",
  },
  {
    name: "4-AcO-DMT",
    nameJa: "4-アセトキシ-DMT",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#e879f9",
    description: "指定薬物として規制。シロシビンのプロドラッグ。研究用途のみ。",
  },
  {
    name: "MAPS治療",
    nameJa: "サイケデリクス支援療法",
    status: "gray",
    statusLabel: "グレーゾーン",
    color: "#22d3ee",
    description: "日本では未承認だが研究段階。米国・欧州でMDMA/シロシビン治療の臨床試験が進行。",
  },
];

function Card({ substance, index }: { substance: Substance; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: substance.color, boxShadow: `0 0 12px ${substance.color}40` }}
        />
        <h3 className="text-lg font-bold font-mono text-white tracking-tight">{substance.name}</h3>
      </div>
      <p className="text-[10px] text-gray-500 mb-2">{substance.nameJa}</p>
      <p className="text-[12px] text-gray-400 leading-relaxed mb-4">{substance.description}</p>
      <span className="text-[11px] font-mono font-medium tracking-wide" style={{ color: substance.color }}>
        {substance.statusLabel} →
      </span>
    </motion.div>
  );
}

export function PsychedelicLegalStatus() {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? SUBSTANCES : SUBSTANCES.filter((s) => s.status === filter);

  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
            規制ステータス
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            日本国内サイケデリクス規制一覧
          </h2>
          <p className="text-[12px] text-gray-500 mt-2">
            麻薬取締法・指定薬物制度に基づく最新の法的ステータス（{SUBSTANCES.length}物質）
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            const count = f.value === "all" ? SUBSTANCES.length : SUBSTANCES.filter((s) => s.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-mono font-medium transition-all duration-200 border"
                style={{
                  color: isActive ? "#fff" : f.color,
                  backgroundColor: isActive ? `${f.color}20` : "transparent",
                  borderColor: isActive ? `${f.color}40` : "rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color, boxShadow: isActive ? `0 0 8px ${f.color}60` : "none" }} />
                {f.label}
                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: isActive ? `${f.color}30` : "rgba(255,255,255,0.04)", color: isActive ? f.color : "#6b7280" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <Card key={s.name} substance={s} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="mt-8 text-center py-12 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <p className="text-gray-500 text-[13px] font-mono">
                該当する物質はありません
              </p>
              <p className="text-gray-600 text-[11px] mt-2">
                別のフィルターをお試しください
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-6 px-4 py-3 rounded-lg border border-white/[0.04] bg-white/[0.01]"
        >
          <p className="text-[10px] font-mono text-gray-600 leading-relaxed">
            ※ 本情報は2026年3月時点の法令に基づく参考情報です。規制物質は随時追加・変更される可能性があります。最新の規制情報は厚生労働省の公式発表をご確認ください。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
