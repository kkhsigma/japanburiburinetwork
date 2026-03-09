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
    name: "CBD",
    nameJa: "カンナビジオール",
    status: "legal",
    statusLabel: "合法",
    color: "#22c55e",
    description: "非精神活性。茎・種子由来のCBD製品は合法。厚労省への輸入届出が必要。",
  },
  {
    name: "THC",
    nameJa: "テトラヒドロカンナビノール",
    status: "illegal",
    statusLabel: "違法",
    color: "#ef4444",
    description: "大麻取締法により所持・使用が禁止。2023年改正で「使用罪」が新設。",
  },
  {
    name: "CBN",
    nameJa: "カンナビノール",
    status: "gray",
    statusLabel: "グレーゾーン",
    color: "#f59e0b",
    description: "THCの酸化分解物。現時点で明確な規制なし。規制強化の可能性あり。",
  },
  {
    name: "CBG",
    nameJa: "カンナビゲロール",
    status: "legal",
    statusLabel: "合法",
    color: "#14b8a6",
    description: "非精神活性の前駆体カンナビノイド。THCを含まなければ規制対象外。",
  },
  {
    name: "CBC",
    nameJa: "カンナビクロメン",
    status: "legal",
    statusLabel: "合法",
    color: "#06b6d4",
    description: "非精神活性カンナビノイド。抗炎症作用の研究が進行中。規制対象外。",
  },
  {
    name: "THCV",
    nameJa: "テトラヒドロカンナビバリン",
    status: "gray",
    statusLabel: "グレーゾーン",
    color: "#eab308",
    description: "THCの類似体だが作用は異なる。法的位置づけが不明確。",
  },
  {
    name: "HHC",
    nameJa: "ヘキサヒドロカンナビノール",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#a855f7",
    description: "2023年に指定薬物に追加。製造・販売・所持・使用が禁止。",
  },
  {
    name: "THCP",
    nameJa: "テトラヒドロカンナビホロール",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#dc2626",
    description: "CB1受容体に対しTHCの33倍の結合親和性。指定薬物として規制。",
  },
  {
    name: "HHCH",
    nameJa: "ヘキサヒドロカンナビヘキソール",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#c084fc",
    description: "2024年に指定薬物に追加。HHCの類似体として規制対象。",
  },
  {
    name: "Delta-8 THC",
    nameJa: "デルタ8 THC",
    status: "illegal",
    statusLabel: "違法",
    color: "#f97316",
    description: "THCの異性体。大麻取締法の規制対象。精神活性作用あり。",
  },
  {
    name: "Delta-10 THC",
    nameJa: "デルタ10 THC",
    status: "illegal",
    statusLabel: "違法",
    color: "#fb923c",
    description: "合成THC異性体。大麻取締法および指定薬物として規制。",
  },
  {
    name: "THCO",
    nameJa: "THCOアセテート",
    status: "designated",
    statusLabel: "指定薬物",
    color: "#ec4899",
    description: "合成THC誘導体。指定薬物として製造・販売・所持が禁止。",
  },
  {
    name: "CBDa",
    nameJa: "カンナビジオール酸",
    status: "legal",
    statusLabel: "合法",
    color: "#34d399",
    description: "CBDの酸性前駆体。非精神活性。THCを含まなければ合法。",
  },
  {
    name: "CBDv",
    nameJa: "カンナビジバリン",
    status: "legal",
    statusLabel: "合法",
    color: "#2dd4bf",
    description: "CBDの類似体。抗てんかん作用の研究が進行中。規制対象外。",
  },
  {
    name: "医療用大麻",
    nameJa: "医療用カンナビノイド製剤",
    status: "medical",
    statusLabel: "条件付き許可",
    color: "#0ea5e9",
    description: "2023年改正法により大麻由来医薬品の使用が解禁。エピディオレックス等が対象。",
  },
  {
    name: "大麻草",
    nameJa: "植物体（花穂・葉）",
    status: "illegal",
    statusLabel: "違法",
    color: "#b91c1c",
    description: "大麻取締法により栽培・所持・譲渡が禁止。免許制の産業用栽培のみ例外。",
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

      <span
        className="text-[11px] font-mono font-medium tracking-wide"
        style={{ color: substance.color }}
      >
        {substance.statusLabel} →
      </span>
    </motion.div>
  );
}

export function CannabinoidLegalStatus() {
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
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60 mb-2">
            規制ステータス
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            日本国内カンナビノイド規制一覧
          </h2>
          <p className="text-[12px] text-gray-500 mt-2">
            2023年大麻取締法改正・指定薬物制度に基づく最新の法的ステータス（{SUBSTANCES.length}物質）
          </p>
        </motion.div>

        {/* Filter buttons */}
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
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: f.color,
                    boxShadow: isActive ? `0 0 8px ${f.color}60` : "none",
                  }}
                />
                {f.label}
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: isActive ? `${f.color}30` : "rgba(255,255,255,0.04)",
                    color: isActive ? f.color : "#6b7280",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <Card key={s.name} substance={s} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-6 px-4 py-3 rounded-lg border border-white/[0.04] bg-white/[0.01]"
        >
          <p className="text-[10px] font-mono text-gray-600 leading-relaxed">
            ※ 本情報は2026年3月時点の法令に基づく参考情報です。指定薬物は随時追加・変更される可能性があります。最新の規制情報は厚生労働省の公式発表をご確認ください。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
