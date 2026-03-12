"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Calendar,
  Shield,
  ChevronRight,
  Activity,
  Eye,
  FileText
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

type SubstanceStatus =
  | "stable"
  | "monitoring"
  | "caution"
  | "high-risk"
  | "under-review"
  | "standards-discussion"
  | "recent-update";

interface Substance {
  name: string;
  nameJa: string;
  status: SubstanceStatus;
  statusLabel: string;
  note: string;
}

interface MetricCard {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  accent: string;
}

interface IntelligenceBriefProps {
  theme?: "dark" | "light";
}

// ─── Theme Helper ────────────────────────────────────────

function useThemeStyles(theme: "dark" | "light") {
  const isDark = theme === "dark";

  return {
    isDark,
    // Backgrounds
    cardBg: isDark
      ? "bg-gradient-to-br from-gray-900/80 to-gray-900/40"
      : "bg-gradient-to-br from-white/90 to-gray-50/90",
    cardBgSolid: isDark
      ? "bg-gradient-to-br from-gray-900/90 to-gray-950/90"
      : "bg-gradient-to-br from-white to-gray-50",
    cardBgSubtle: isDark
      ? "bg-gradient-to-br from-gray-900/60 to-gray-950/60"
      : "bg-gradient-to-br from-white/80 to-gray-100/80",
    substanceBg: isDark
      ? "bg-gray-900/40 hover:bg-gray-900/60"
      : "bg-white/60 hover:bg-white/80",
    footerBg: isDark ? "bg-gray-950/30" : "bg-gray-100/50",
    iconBg: isDark ? "bg-gray-800/30" : "bg-gray-100/80",
    dateBadgeBg: isDark ? "bg-gray-800/50" : "bg-gray-100",

    // Borders
    cardBorder: isDark
      ? "border-gray-800/50 hover:border-gray-700/50"
      : "border-gray-200/80 hover:border-gray-300/80",
    cardBorderStatic: isDark ? "border-gray-800/60" : "border-gray-200",
    cardBorderSubtle: isDark ? "border-gray-800/40" : "border-gray-200/60",
    substanceBorder: isDark
      ? "border-gray-800/40 hover:border-gray-700/50"
      : "border-gray-200/60 hover:border-gray-300/80",
    footerBorder: isDark ? "border-gray-800/30" : "border-gray-200/50",
    headerBorder: isDark ? "border-gray-800/40" : "border-gray-200/60",

    // Text colors
    textPrimary: isDark ? "text-gray-100" : "text-gray-900",
    textSecondary: isDark ? "text-gray-200" : "text-gray-800",
    textTertiary: isDark ? "text-gray-300" : "text-gray-700",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",
    textSubtle: isDark ? "text-gray-500" : "text-gray-400",
    textFaint: isDark ? "text-gray-600" : "text-gray-400",

    // Label colors
    labelColor: isDark ? "text-gray-500" : "text-gray-500",
    sectionLabel: isDark ? "text-gray-400" : "text-gray-500",

    // Accent line
    accentLine: isDark ? "via-gray-700" : "via-gray-300",
  };
}

// ─── Status Badge Component ──────────────────────────────

function StatusBadge({
  status,
  label,
  theme
}: {
  status: SubstanceStatus;
  label: string;
  theme: "dark" | "light";
}) {
  const isDark = theme === "dark";

  const styles: Record<SubstanceStatus, { bg: string; text: string; glow: string }> = {
    "stable": {
      bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
      text: isDark ? "text-emerald-400" : "text-emerald-600",
      glow: "shadow-emerald-500/20"
    },
    "monitoring": {
      bg: isDark ? "bg-blue-500/10" : "bg-blue-50",
      text: isDark ? "text-blue-400" : "text-blue-600",
      glow: "shadow-blue-500/20"
    },
    "caution": {
      bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
      text: isDark ? "text-amber-400" : "text-amber-600",
      glow: "shadow-amber-500/20"
    },
    "high-risk": {
      bg: isDark ? "bg-red-500/10" : "bg-red-50",
      text: isDark ? "text-red-400" : "text-red-600",
      glow: "shadow-red-500/20"
    },
    "under-review": {
      bg: isDark ? "bg-purple-500/10" : "bg-purple-50",
      text: isDark ? "text-purple-400" : "text-purple-600",
      glow: "shadow-purple-500/20"
    },
    "standards-discussion": {
      bg: isDark ? "bg-cyan-500/10" : "bg-cyan-50",
      text: isDark ? "text-cyan-400" : "text-cyan-600",
      glow: "shadow-cyan-500/20"
    },
    "recent-update": {
      bg: isDark ? "bg-orange-500/10" : "bg-orange-50",
      text: isDark ? "text-orange-400" : "text-orange-600",
      glow: "shadow-orange-500/20"
    },
  };

  const style = styles[status];

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide
        ${style.bg} ${style.text} ${isDark ? `shadow-sm ${style.glow}` : ""}
      `}
    >
      {label}
    </span>
  );
}

// ─── Metric Card Component ───────────────────────────────

function MetricCardComponent({
  metric,
  index,
  theme
}: {
  metric: MetricCard;
  index: number;
  theme: "dark" | "light";
}) {
  const styles = useThemeStyles(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={`
          relative overflow-hidden rounded-lg p-4
          ${styles.cardBg}
          border ${styles.cardBorder}
          transition-all duration-300
          hover:shadow-lg hover:shadow-black/10
        `}
      >
        {/* Subtle top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(90deg, transparent, ${metric.accent}40, transparent)` }}
        />

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={`text-[10px] uppercase tracking-[0.15em] ${styles.labelColor} font-medium`}>
              {metric.label}
            </p>
            <p
              className="text-2xl font-light tracking-tight"
              style={{ color: metric.accent }}
            >
              {metric.value}
            </p>
            <p className={`text-[11px] ${styles.textMuted} leading-relaxed`}>
              {metric.subtext}
            </p>
          </div>
          <div
            className={`p-2 rounded-lg ${styles.iconBg}`}
            style={{ color: metric.accent }}
          >
            {metric.icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Substance Card Component ────────────────────────────

function SubstanceCard({
  substance,
  index,
  theme
}: {
  substance: Substance;
  index: number;
  theme: "dark" | "light";
}) {
  const styles = useThemeStyles(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
      className="group"
    >
      <div
        className={`
          relative p-3 rounded-lg
          ${styles.substanceBg}
          border ${styles.substanceBorder}
          transition-all duration-200 cursor-default
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${styles.textSecondary}`}>
              {substance.name}
            </span>
            <span className={`text-[10px] ${styles.textSubtle}`}>
              {substance.nameJa}
            </span>
          </div>
          <StatusBadge status={substance.status} label={substance.statusLabel} theme={theme} />
        </div>
        <p className={`text-[11px] ${styles.textSubtle} leading-relaxed`}>
          {substance.note}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────

export function IntelligenceBrief({ theme = "dark" }: IntelligenceBriefProps) {
  const styles = useThemeStyles(theme);

  // Mock data - would come from API in production
  const metrics: MetricCard[] = [
    {
      label: "規制温度",
      value: "中程度",
      subtext: "過去30日で2件の動向を検知",
      icon: <Activity size={18} />,
      accent: "#f59e0b",
    },
    {
      label: "重要変化",
      value: "3件",
      subtext: "今週の要確認アラート",
      icon: <AlertTriangle size={18} />,
      accent: "#ef4444",
    },
    {
      label: "要注意成分",
      value: "THCP",
      subtext: "審議会での議論が活発化",
      icon: <Eye size={18} />,
      accent: "#a855f7",
    },
    {
      label: "次の注目日程",
      value: "3/18",
      subtext: "厚労省・検討会開催予定",
      icon: <Calendar size={18} />,
      accent: "#3b82f6",
    },
  ];

  const substances: Substance[] = [
    {
      name: "CBD",
      nameJa: "カンナビジオール",
      status: "stable",
      statusLabel: "安定",
      note: "現行基準で流通可。大きな変更議論なし",
    },
    {
      name: "CBN",
      nameJa: "カンナビノール",
      status: "monitoring",
      statusLabel: "監視中",
      note: "THC由来性の確認議論あり。製造工程に注意",
    },
    {
      name: "CBG",
      nameJa: "カンナビゲロール",
      status: "stable",
      statusLabel: "安定",
      note: "規制対象外として認識。変化なし",
    },
    {
      name: "CBC",
      nameJa: "カンナビクロメン",
      status: "stable",
      statusLabel: "安定",
      note: "市場流通あり。規制議論は低調",
    },
    {
      name: "HHC系",
      nameJa: "ヘキサヒドロカンナビノール",
      status: "high-risk",
      statusLabel: "リスク高",
      note: "指定薬物。製造・販売・所持禁止",
    },
    {
      name: "HHCH",
      nameJa: "ヘキサヒドロカンナビヘキソール",
      status: "high-risk",
      statusLabel: "リスク高",
      note: "2024年指定。取扱い不可",
    },
    {
      name: "THCB",
      nameJa: "テトラヒドロカンナビブトール",
      status: "caution",
      statusLabel: "注意",
      note: "審議動向あり。指定検討の可能性",
    },
    {
      name: "THCP",
      nameJa: "テトラヒドロカンナビホロール",
      status: "under-review",
      statusLabel: "審議中",
      note: "活発な議論中。近日中の動きに要注意",
    },
  ];

  return (
    <section className="relative">
      {/* Section Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield size={16} className="text-blue-400" />
            <h2 className={`text-xs uppercase tracking-[0.2em] ${styles.sectionLabel} font-medium`}>
              Intelligence Overview
            </h2>
          </div>
          <p className={`text-[11px] ${styles.textFaint}`}>
            日本カンナビノイド市場の規制動向サマリー
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {metrics.map((metric, i) => (
            <MetricCardComponent key={metric.label} metric={metric} index={i} theme={theme} />
          ))}
        </div>

        {/* Two Column Layout: Brief + Status Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Intelligence Brief Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div
              className={`
                relative h-full rounded-xl overflow-hidden
                ${styles.cardBgSolid}
                border ${styles.cardBorderStatic}
              `}
            >
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50" />

              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={14} className="text-blue-400" />
                  <h3 className={`text-xs uppercase tracking-[0.15em] ${styles.sectionLabel} font-medium`}>
                    今週のインテリジェンスブリーフ
                  </h3>
                </div>

                {/* Date Badge */}
                <div className={`inline-flex items-center px-2 py-1 rounded ${styles.dateBadgeBg} text-[10px] ${styles.textSubtle} mb-4`}>
                  2026年3月第2週
                </div>

                {/* Main Headline */}
                <h4 className={`text-lg font-medium ${styles.textPrimary} leading-snug mb-4`}>
                  THCP規制議論が加速
                  <br />
                  <span className={`${styles.textMuted} font-normal`}>
                    厚労省検討会で複数委員が指定を支持
                  </span>
                </h4>

                {/* Key Points */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-amber-500/80 font-medium mb-1">
                      重要ポイント
                    </p>
                    <p className={`text-[13px] ${styles.textTertiary} leading-relaxed`}>
                      3月8日の薬事・食品衛生審議会にてTHCPの薬理作用に関する報告があり、複数の委員から規制指定の検討を求める意見が出された。
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-blue-500/80 font-medium mb-1">
                      なぜ重要か
                    </p>
                    <p className={`text-[13px] ${styles.textTertiary} leading-relaxed`}>
                      THCPは現在流通している製品に含まれるケースがあり、指定された場合の市場影響は大きい。在庫管理・製品構成の見直しが必要になる可能性。
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-purple-500/80 font-medium mb-1">
                      次のウォッチポイント
                    </p>
                    <p className={`text-[13px] ${styles.textTertiary} leading-relaxed`}>
                      3月18日の検討会続報、およびパブリックコメント募集開始のタイミングに注目。
                    </p>
                  </div>
                </div>

                {/* CTA Link */}
                <button className="group flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                  <span>詳細レポートを読む</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Cannabinoid Status Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div
              className={`
                relative rounded-xl overflow-hidden
                ${styles.cardBgSubtle}
                border ${styles.cardBorderSubtle}
              `}
            >
              {/* Header */}
              <div className={`px-5 py-4 border-b ${styles.headerBorder}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <h3 className={`text-xs uppercase tracking-[0.15em] ${styles.sectionLabel} font-medium`}>
                      主要カンナビノイド規制状況
                    </h3>
                  </div>
                  <span className={`text-[10px] ${styles.textFaint}`}>
                    最終更新: 2026/03/12
                  </span>
                </div>
              </div>

              {/* Substance Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {substances.map((substance, i) => (
                    <SubstanceCard key={substance.name} substance={substance} index={i} theme={theme} />
                  ))}
                </div>
              </div>

              {/* Footer Note */}
              <div className={`px-5 py-3 border-t ${styles.footerBorder} ${styles.footerBg}`}>
                <p className={`text-[10px] ${styles.textFaint} leading-relaxed`}>
                  ※ 上記は監視・分析結果に基づく参考情報であり、法的助言ではありません。正確な法規制については関係省庁の公式情報をご確認ください。
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Accent Line */}
        <div className="mt-12 flex justify-center">
          <div className={`w-24 h-[1px] bg-gradient-to-r from-transparent ${styles.accentLine} to-transparent`} />
        </div>
      </div>
    </section>
  );
}
