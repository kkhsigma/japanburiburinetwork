"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  X,
  Scale,
  AlertTriangle,
  Check,
  Leaf,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  ShoppingBag,
  Zap,
  ChevronUp,
  BarChart3,
  GripVertical,
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

// ─── Substance Data ──────────────────────────────────────

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

function StatusBadge({ status, color, size = "sm" }: { status: string; color: string; size?: "sm" | "md" }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span className={`inline-flex rounded-lg font-medium border ${sizeClass} ${colorMap[color] || colorMap.gray}`}>
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
    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium border ${getStyle(status)}`}>
      {status}
    </span>
  );
}

// ─── Category Icon ───────────────────────────────────────

function CategoryIcon({ category, size = 14 }: { category: "cannabis" | "psychedelics"; size?: number }) {
  if (category === "cannabis") {
    return (
      <div className="p-1.5 rounded-lg bg-emerald-500/10">
        <Leaf size={size} className="text-emerald-400" />
      </div>
    );
  }
  return (
    <div className="p-1.5 rounded-lg bg-purple-500/10">
      <Sparkles size={size} className="text-purple-400" />
    </div>
  );
}

// ─── Substance Card Component ────────────────────────────

function SubstanceCard({
  substance,
  isSelected,
  onToggle,
}: {
  substance: Substance;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-4 rounded-xl border transition-all duration-300
        ${isSelected
          ? "bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          : "bg-gray-900/40 border-gray-800/50 hover:border-gray-700/50"
        }
      `}
    >
      {/* Glow effect when selected */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"
        />
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-medium text-gray-100">{substance.name}</h3>
          <p className="text-[11px] text-gray-500">{substance.nameJa}</p>
        </div>
        <StatusBadge status={substance.status} color={substance.statusColor} />
      </div>

      {/* Description */}
      <p className="relative text-[12px] text-gray-400 leading-relaxed mb-3 line-clamp-2">
        {substance.description}
      </p>

      {/* Effects */}
      <div className="relative flex flex-wrap gap-1.5 mb-4">
        {substance.effects.slice(0, 3).map((effect) => (
          <span
            key={effect}
            className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800/50 text-gray-400"
          >
            {effect}
          </span>
        ))}
      </div>

      {/* Add/Remove Button */}
      <button
        onClick={onToggle}
        className={`
          relative w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
          ${isSelected
            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
            : "bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-800 hover:text-gray-200"
          }
        `}
      >
        {isSelected ? (
          <>
            <Check size={14} />
            比較リストに追加済み
          </>
        ) : (
          <>
            <Plus size={14} />
            比較リストに追加
          </>
        )}
      </button>
    </motion.div>
  );
}

// ─── Draggable Column Header ─────────────────────────────

function DraggableColumnHeader({
  substance,
  index,
  onRemove,
}: {
  substance: Substance;
  index: number;
  onRemove: (id: string) => void;
}) {
  return (
    <Reorder.Item
      value={substance}
      id={substance.id}
      className="relative cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: index * 0.1,
      }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 10px 40px rgba(6, 182, 212, 0.2), 0 0 0 1px rgba(6, 182, 212, 0.3)",
        zIndex: 50,
      }}
    >
      <motion.div
        className="p-5 text-center bg-gradient-to-b from-gray-900/60 to-transparent border-r border-gray-800/50 last:border-r-0 group select-none"
        whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.03)" }}
      >
        {/* Drag indicator icon - visual only */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-gray-600" />
        </div>

        {/* Remove Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(substance.id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-gray-800/50 hover:bg-red-500/20 text-gray-500 hover:text-red-400 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={14} />
        </motion.button>

        {/* Content */}
        <div className="flex items-center justify-center gap-2 mb-2 mt-4">
          <CategoryIcon category={substance.category} size={16} />
          <h3 className="text-lg font-semibold text-gray-100">{substance.name}</h3>
        </div>
        <p className="text-[11px] text-gray-500">{substance.nameJa}</p>

        {/* Drag indicator line */}
        <motion.div
          className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </motion.div>
    </Reorder.Item>
  );
}

// ─── Comparison Chart Component ──────────────────────────

function ComparisonChart({
  substances,
  onClose,
  onRemove,
  onReorder,
}: {
  substances: Substance[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onReorder: (newOrder: Substance[]) => void;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 12,
        delay: i * 0.05,
      },
    }),
  };

  const comparisonRows = [
    {
      label: "概要",
      icon: <FlaskConical size={14} />,
      render: (s: Substance) => (
        <p className="text-sm text-gray-300 leading-relaxed">{s.description}</p>
      ),
    },
    {
      label: "規制状況",
      icon: <ShieldCheck size={14} />,
      render: (s: Substance) => (
        <StatusBadge status={s.status} color={s.statusColor} size="md" />
      ),
    },
    {
      label: "市場状態",
      icon: <ShoppingBag size={14} />,
      render: (s: Substance) => <MarketBadge status={s.marketStatus} />,
    },
    {
      label: "由来",
      icon: <Leaf size={14} />,
      render: (s: Substance) => (
        <span className="text-sm text-gray-300">{s.origin}</span>
      ),
    },
    {
      label: "主な効果",
      icon: <Zap size={14} />,
      render: (s: Substance) => (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {s.effects.map((effect) => (
            <span
              key={effect}
              className="px-2 py-1 rounded-full text-[10px] bg-gray-800/60 text-gray-300 border border-gray-700/30"
            >
              {effect}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "カテゴリー",
      icon: <BarChart3 size={14} />,
      render: (s: Substance) => (
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
            ${s.category === "cannabis"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
            }
          `}
        >
          {s.category === "cannabis" ? (
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
      ),
    },
  ];

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="relative mt-16 mb-8"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20"
          >
            <Scale size={24} className="text-cyan-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-medium text-gray-100">比較結果</h2>
            <p className="text-sm text-gray-500">
              {substances.length}件の成分を比較中
              <span className="text-gray-600 ml-2">• ドラッグして並べ替え</span>
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
        >
          <ChevronUp size={16} />
          閉じる
        </motion.button>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-gray-800/50 overflow-hidden bg-gradient-to-b from-gray-900/40 to-gray-900/20 backdrop-blur-sm"
        style={{
          boxShadow: "0 0 60px rgba(6, 182, 212, 0.05), 0 0 120px rgba(6, 182, 212, 0.02)",
        }}
      >
        {/* Header Row - Draggable Substance Names */}
        <Reorder.Group
          axis="x"
          values={substances}
          onReorder={onReorder}
          className="grid border-b border-gray-800/50"
          style={{ gridTemplateColumns: `repeat(${substances.length}, 1fr)` }}
        >
          <AnimatePresence mode="popLayout">
            {substances.map((substance, index) => (
              <DraggableColumnHeader
                key={substance.id}
                substance={substance}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Data Rows */}
        <AnimatePresence>
          {comparisonRows.map((row, rowIndex) => (
            <motion.div
              key={row.label}
              variants={rowVariants}
              className="border-b border-gray-800/30 last:border-b-0"
            >
              {/* Row Label */}
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-900/30 border-b border-gray-800/20">
                <span className="text-gray-500">{row.icon}</span>
                <span className="text-xs font-medium text-gray-400 tracking-wide">{row.label}</span>
              </div>
              {/* Row Data */}
              <motion.div
                className="grid divide-x divide-gray-800/30"
                style={{ gridTemplateColumns: `repeat(${substances.length}, 1fr)` }}
                layout
              >
                <AnimatePresence mode="popLayout">
                  {substances.map((substance, cellIndex) => (
                    <motion.div
                      key={substance.id}
                      custom={rowIndex * substances.length + cellIndex}
                      variants={cellVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="p-5 flex items-center justify-center min-h-[80px]"
                    >
                      {row.render(substance)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Glowing border effect */}
      <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function ComparisonPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [orderedSubstances, setOrderedSubstances] = useState<Substance[]>([]);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const selectedSubstances = useMemo(
    () => substances.filter((s) => selectedIds.includes(s.id)),
    [selectedIds]
  );

  const cannabisSubstances = substances.filter((s) => s.category === "cannabis");
  const psychedelicsSubstances = substances.filter((s) => s.category === "psychedelics");

  const toggleSubstance = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
      setOrderedSubstances(orderedSubstances.filter((s) => s.id !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
      const newSubstance = substances.find((s) => s.id === id);
      if (newSubstance) {
        setOrderedSubstances([...orderedSubstances, newSubstance]);
      }
    }
  };

  const removeSubstance = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
    setOrderedSubstances(orderedSubstances.filter((s) => s.id !== id));
    if (selectedIds.length <= 2) {
      setShowComparison(false);
    }
  };

  const clearAll = () => {
    setSelectedIds([]);
    setOrderedSubstances([]);
    setShowComparison(false);
  };

  const handleCompare = () => {
    // Initialize ordered substances if not already set
    if (orderedSubstances.length === 0 || orderedSubstances.length !== selectedIds.length) {
      setOrderedSubstances(selectedSubstances);
    }
    setShowComparison(true);
    // Scroll to comparison after a brief delay for animation
    setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  const handleReorder = (newOrder: Substance[]) => {
    setOrderedSubstances(newOrder);
    // Also update selectedIds to match the new order
    setSelectedIds(newOrder.map((s) => s.id));
  };

  // Use orderedSubstances for display when available, otherwise use selectedSubstances
  const displaySubstances = orderedSubstances.length > 0 ? orderedSubstances : selectedSubstances;

  return (
    <div className="min-h-screen bg-[#030303] relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-500/[0.02] rounded-full blur-[100px]" />
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[150px]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#030303]/80 backdrop-blur-xl border-b border-[#1e1e1e]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/universe"
                className="flex items-center gap-2 text-[#64748b] hover:text-[#1a9a8a] transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-medium hidden sm:inline">ユニバース</span>
              </Link>
              <div className="h-4 w-px bg-[#1e1e1e]" />
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-[#e2e8f0]">成分比較</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.div
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50"
              style={{
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(6, 182, 212, 0.1)",
              }}
            >
              {/* Selected Items */}
              <div className="flex items-center gap-2">
                {selectedSubstances.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.05 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700/50"
                  >
                    <span className="text-sm text-gray-200">{s.name}</span>
                    <button
                      onClick={() => removeSubstance(s.id)}
                      className="p-0.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-700/50" />

              {/* Actions */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">
                  {selectedIds.length}/4
                </span>
                <button
                  onClick={clearAll}
                  className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                >
                  クリア
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompare}
                  disabled={selectedIds.length < 2}
                  className={`
                    px-5 py-2 rounded-xl text-sm font-medium transition-all
                    ${selectedIds.length >= 2
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  比較する
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 pb-32">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-medium text-gray-100 mb-2">成分比較ツール</h1>
          <p className="text-sm text-gray-500">
            比較したい成分を選択してください（最大4つまで）
          </p>
        </motion.div>

        {/* Cannabis Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Leaf size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-100">カンナビノイド</h2>
              <p className="text-xs text-gray-500">大麻由来成分</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cannabisSubstances.map((substance) => (
              <SubstanceCard
                key={substance.id}
                substance={substance}
                isSelected={selectedIds.includes(substance.id)}
                onToggle={() => toggleSubstance(substance.id)}
              />
            ))}
          </div>
        </section>

        {/* Psychedelics Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-100">サイケデリクス</h2>
              <p className="text-xs text-gray-500">幻覚・意識変容物質</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {psychedelicsSubstances.map((substance) => (
              <SubstanceCard
                key={substance.id}
                substance={substance}
                isSelected={selectedIds.includes(substance.id)}
                onToggle={() => toggleSubstance(substance.id)}
              />
            ))}
          </div>
        </section>

        {/* Comparison Chart Section */}
        <div ref={comparisonRef}>
          <AnimatePresence>
            {showComparison && displaySubstances.length >= 2 && (
              <ComparisonChart
                substances={displaySubstances}
                onClose={handleCloseComparison}
                onRemove={removeSubstance}
                onReorder={handleReorder}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gray-900/30 border border-gray-800/30"
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
