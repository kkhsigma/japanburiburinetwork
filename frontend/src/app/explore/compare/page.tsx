"use client";

import React, { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Scale,
  AlertTriangle,
  Leaf,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  ShoppingBag,
  Zap,
  Plus,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface Substance {
  id: string;
  name: string;
  nameJa: string;
  category: "cannabis" | "psychedelics";
  status: string;
  statusColor: string;
  description: string;
  effects: string[];
  origin: string;
  marketStatus: string;
}

// ─── Substance Data (same as explore page) ───────────────

const substances: Substance[] = [
  // Cannabis Section
  {
    id: "cbd",
    name: "CBD",
    nameJa: "カンナビジオール",
    category: "cannabis",
    status: "安定",
    statusColor: "emerald",
    description: "非精神活性カンナビノイド。リラックス効果で知られる。",
    effects: ["リラックス", "抗炎症", "抗不安"],
    origin: "大麻草",
    marketStatus: "流通可",
  },
  {
    id: "cbn",
    name: "CBN",
    nameJa: "カンナビノール",
    category: "cannabis",
    status: "監視中",
    statusColor: "blue",
    description: "THC酸化により生成。鎮静効果が研究されている。",
    effects: ["鎮静", "睡眠補助", "抗菌"],
    origin: "THC酸化物",
    marketStatus: "要確認",
  },
  {
    id: "cbg",
    name: "CBG",
    nameJa: "カンナビゲロール",
    category: "cannabis",
    status: "安定",
    statusColor: "emerald",
    description: "カンナビノイドの前駆体。抗菌・抗炎症作用が研究中。",
    effects: ["抗菌", "抗炎症", "神経保護"],
    origin: "大麻草",
    marketStatus: "流通可",
  },
  {
    id: "cbc",
    name: "CBC",
    nameJa: "カンナビクロメン",
    category: "cannabis",
    status: "安定",
    statusColor: "emerald",
    description: "非精神活性。抗炎症・抗うつ効果が研究されている。",
    effects: ["抗炎症", "抗うつ", "鎮痛"],
    origin: "大麻草",
    marketStatus: "流通可",
  },
  {
    id: "thcv",
    name: "THCV",
    nameJa: "テトラヒドロカンナビバリン",
    category: "cannabis",
    status: "注意",
    statusColor: "amber",
    description: "THC類似構造。食欲抑制効果が研究されている。",
    effects: ["食欲抑制", "エネルギー増加", "集中力"],
    origin: "大麻草",
    marketStatus: "要確認",
  },
  {
    id: "thcp",
    name: "THCP",
    nameJa: "テトラヒドロカンナビホロール",
    category: "cannabis",
    status: "審議中",
    statusColor: "purple",
    description: "THCより強力な結合親和性。規制議論が活発。",
    effects: ["強力な精神活性", "鎮痛", "鎮静"],
    origin: "大麻草",
    marketStatus: "審議中",
  },
  {
    id: "thcb",
    name: "THCB",
    nameJa: "テトラヒドロカンナビブトール",
    category: "cannabis",
    status: "注意",
    statusColor: "amber",
    description: "新規発見のカンナビノイド。研究段階。",
    effects: ["精神活性", "鎮痛", "研究中"],
    origin: "大麻草",
    marketStatus: "要確認",
  },
  {
    id: "hhc",
    name: "HHC",
    nameJa: "ヘキサヒドロカンナビノール",
    category: "cannabis",
    status: "リスク高",
    statusColor: "red",
    description: "水素化THC。2023年より指定薬物。",
    effects: ["精神活性", "リラックス", "多幸感"],
    origin: "合成/半合成",
    marketStatus: "流通不可",
  },

  // Psychedelics Section
  {
    id: "psilocybin",
    name: "シロシビン",
    nameJa: "Psilocybin",
    category: "psychedelics",
    status: "規制",
    statusColor: "red",
    description: "マジックマッシュルームの主成分。医療研究が進行中。",
    effects: ["幻覚", "意識変容", "神秘体験"],
    origin: "キノコ類",
    marketStatus: "流通不可",
  },
  {
    id: "dmt",
    name: "DMT",
    nameJa: "ジメチルトリプタミン",
    category: "psychedelics",
    status: "規制",
    statusColor: "red",
    description: "強力な幻覚物質。アヤワスカの成分。",
    effects: ["強力な幻覚", "意識変容", "時間感覚変化"],
    origin: "植物/合成",
    marketStatus: "流通不可",
  },
  {
    id: "lsd",
    name: "LSD",
    nameJa: "リゼルグ酸ジエチルアミド",
    category: "psychedelics",
    status: "規制",
    statusColor: "red",
    description: "合成幻覚剤。微量で長時間の効果。",
    effects: ["幻覚", "共感覚", "意識拡張"],
    origin: "合成",
    marketStatus: "流通不可",
  },
  {
    id: "mescaline",
    name: "メスカリン",
    nameJa: "Mescaline",
    category: "psychedelics",
    status: "規制",
    statusColor: "red",
    description: "ペヨーテサボテン由来。伝統的儀式使用。",
    effects: ["幻覚", "色彩強調", "内省"],
    origin: "サボテン",
    marketStatus: "流通不可",
  },
  {
    id: "ketamine",
    name: "ケタミン",
    nameJa: "Ketamine",
    category: "psychedelics",
    status: "医療限定",
    statusColor: "blue",
    description: "解離性麻酔薬。うつ病治療で注目。",
    effects: ["解離", "鎮痛", "抗うつ"],
    origin: "合成",
    marketStatus: "医療用",
  },
  {
    id: "mdma",
    name: "MDMA",
    nameJa: "エクスタシー",
    category: "psychedelics",
    status: "規制",
    statusColor: "red",
    description: "共感作用物質。PTSD治療研究が進行。",
    effects: ["多幸感", "共感増加", "エネルギー"],
    origin: "合成",
    marketStatus: "流通不可",
  },
];

// ─── Status Badge Component ──────────────────────────────

function StatusBadge({ status, color }: { status: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${colorMap[color] || colorMap.gray}`}>
      {status}
    </span>
  );
}

// ─── Market Status Badge ─────────────────────────────────

function MarketBadge({ status }: { status: string }) {
  const getStyle = (s: string) => {
    if (s === "流通可") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s === "流通不可") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (s === "医療用") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${getStyle(status)}`}>
      {status}
    </span>
  );
}

// ─── Category Icon ───────────────────────────────────────

function CategoryIcon({ category }: { category: "cannabis" | "psychedelics" }) {
  if (category === "cannabis") {
    return (
      <div className="p-1.5 rounded-lg bg-emerald-500/10">
        <Leaf size={14} className="text-emerald-400" />
      </div>
    );
  }
  return (
    <div className="p-1.5 rounded-lg bg-purple-500/10">
      <Sparkles size={14} className="text-purple-400" />
    </div>
  );
}

// ─── Comparison Row ──────────────────────────────────────

function ComparisonRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-800/50 last:border-b-0">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/30">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <div className="grid divide-x divide-gray-800/50" style={{ gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)` }}>
        {children}
      </div>
    </div>
  );
}

// ─── Inner Content Component ─────────────────────────────

function CompareResultsContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") || "";
  const selectedIds = useMemo(() => idsParam.split(",").filter(Boolean), [idsParam]);

  const selectedSubstances = useMemo(
    () => selectedIds.map((id) => substances.find((s) => s.id === id)).filter(Boolean) as Substance[],
    [selectedIds]
  );

  // If no substances selected, show empty state
  if (selectedSubstances.length === 0) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FlaskConical size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-300 mb-2">比較する成分が選択されていません</h2>
          <p className="text-sm text-gray-500 mb-6">比較ページに戻って成分を選択してください</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 transition-colors"
          >
            <Plus size={16} />
            成分を選択する
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#030303]/80 backdrop-blur-xl border-b border-[#1e1e1e]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/explore"
                className="flex items-center gap-2 text-[#64748b] hover:text-[#1a9a8a] transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-medium hidden sm:inline">成分選択に戻る</span>
              </Link>
              <div className="h-4 w-px bg-[#1e1e1e]" />
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-[#e2e8f0]">比較結果</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {selectedSubstances.length}件の成分を比較中
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-medium text-gray-100 mb-2">成分比較</h1>
          <p className="text-sm text-gray-500">
            選択された成分の規制状況・効果・市場状態を比較
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-800/50 overflow-hidden bg-gray-900/20"
        >
          {/* Header Row - Substance Names */}
          <div
            className="grid border-b border-gray-800/50"
            style={{ gridTemplateColumns: `repeat(${selectedSubstances.length}, 1fr)` }}
          >
            {selectedSubstances.map((substance, index) => (
              <motion.div
                key={substance.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 text-center border-r border-gray-800/50 last:border-r-0 bg-gray-900/40"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CategoryIcon category={substance.category} />
                  <h3 className="text-lg font-medium text-gray-100">{substance.name}</h3>
                </div>
                <p className="text-[11px] text-gray-500">{substance.nameJa}</p>
              </motion.div>
            ))}
          </div>

          {/* Description Row */}
          <ComparisonRow label="概要" icon={<FlaskConical size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4">
                <p className="text-sm text-gray-300 leading-relaxed">{substance.description}</p>
              </div>
            ))}
          </ComparisonRow>

          {/* Status Row */}
          <ComparisonRow label="規制状況" icon={<ShieldCheck size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4 flex items-center justify-center">
                <StatusBadge status={substance.status} color={substance.statusColor} />
              </div>
            ))}
          </ComparisonRow>

          {/* Market Status Row */}
          <ComparisonRow label="市場状態" icon={<ShoppingBag size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4 flex items-center justify-center">
                <MarketBadge status={substance.marketStatus} />
              </div>
            ))}
          </ComparisonRow>

          {/* Origin Row */}
          <ComparisonRow label="由来" icon={<Leaf size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4 text-center">
                <span className="text-sm text-gray-300">{substance.origin}</span>
              </div>
            ))}
          </ComparisonRow>

          {/* Effects Row */}
          <ComparisonRow label="主な効果" icon={<Zap size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {substance.effects.map((effect) => (
                    <span
                      key={effect}
                      className="px-2 py-1 rounded-full text-[10px] bg-gray-800/60 text-gray-300 border border-gray-700/30"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </ComparisonRow>

          {/* Category Row */}
          <ComparisonRow label="カテゴリー" icon={<FlaskConical size={14} />}>
            {selectedSubstances.map((substance) => (
              <div key={substance.id} className="p-4 flex items-center justify-center">
                <span className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                  ${substance.category === "cannabis"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }
                `}>
                  {substance.category === "cannabis" ? (
                    <>
                      <Leaf size={12} />
                      カンナビノイド
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      サイケデリクス
                    </>
                  )}
                </span>
              </div>
            ))}
          </ComparisonRow>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700/50 transition-colors"
          >
            成分を変更する
          </Link>
          <Link
            href="/universe"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
          >
            ユニバースに戻る
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-4 rounded-xl bg-gray-900/30 border border-gray-800/30"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500/60 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              ※ 上記は参考情報であり、法的助言ではありません。
              正確な法規制については関係省庁の公式情報をご確認ください。
              規制状況は随時変更される可能性があります。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Component (with Suspense) ──────────────────────

export default function CompareResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030303] flex items-center justify-center">
          <div className="text-gray-400 text-sm">読み込み中...</div>
        </div>
      }
    >
      <CompareResultsContent />
    </Suspense>
  );
}
