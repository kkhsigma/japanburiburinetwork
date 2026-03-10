"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { HybridSearchResult, SearchResultItem } from "@/types";

interface SearchResultsProps {
  results: HybridSearchResult;
  collapsed?: boolean;
}

type CategoryKey = "compounds" | "alerts" | "thc_regulations" | "sources" | "government_notices" | "designated_substances";

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; labelJa: string; color: string }> = {
  compounds: { label: "Compounds", labelJa: "成分", color: "#1a9a8a" },
  alerts: { label: "Alerts", labelJa: "アラート", color: "#d4a72d" },
  thc_regulations: { label: "Regulations", labelJa: "規制", color: "#3b82f6" },
  sources: { label: "Sources", labelJa: "ソース", color: "#8b5cf6" },
  government_notices: { label: "Notices", labelJa: "通知", color: "#f97316" },
  designated_substances: { label: "Substances", labelJa: "指定薬物", color: "#ef4444" },
};

const CATEGORY_ORDER: CategoryKey[] = [
  "compounds",
  "alerts",
  "thc_regulations",
  "designated_substances",
  "government_notices",
  "sources",
];

function getResultLink(item: SearchResultItem): string | null {
  switch (item.type) {
    case "compound":
      return `/explore/compounds/${item.id}`;
    case "alert":
      return `/alerts/${item.id}`;
    default:
      return null;
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as const },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

function ResultItem({ item }: { item: SearchResultItem }) {
  const link = getResultLink(item);
  const config = CATEGORY_CONFIG[
    item.type === "compound"
      ? "compounds"
      : item.type === "alert"
      ? "alerts"
      : item.type === "thc_regulation"
      ? "thc_regulations"
      : item.type === "source"
      ? "sources"
      : item.type === "government_notice"
      ? "government_notices"
      : "designated_substances"
  ];

  const content = (
    <motion.div
      variants={itemVariants}
      className="group flex items-start gap-3 px-4 py-3 rounded-lg bg-surface-elevated border border-border hover:border-border-hover transition-colors duration-200"
    >
      {/* Type dot */}
      <span
        className="mt-1.5 w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}40` }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors duration-150">
          {item.title}
        </h4>
        {item.subtitle && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.subtitle}</p>
        )}
        {/* Type-specific metadata */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
              <span
                key={key}
                className="text-2xs text-text-muted bg-navy-700/50 px-1.5 py-0.5 rounded font-mono"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Rank indicator */}
      <span className="text-2xs text-text-muted font-mono shrink-0">#{item.rank}</span>
    </motion.div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}

export function SearchResults({ results, collapsed = false }: SearchResultsProps) {
  const categoriesWithItems = CATEGORY_ORDER.filter(
    (key) => results[key] && results[key].length > 0
  );

  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");

  if (categoriesWithItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <p className="text-text-muted text-sm">
          検索結果が見つかりません。
        </p>
        <p className="text-text-muted text-xs mt-1">
          No results found. Try a different query.
        </p>
      </motion.div>
    );
  }

  const searchModeLabel =
    results.search_mode === "fulltext" ? "Full-text" : "Fuzzy match";

  const displayItems: SearchResultItem[] =
    activeCategory === "all"
      ? categoriesWithItems.flatMap((key) => results[key])
      : results[activeCategory] ?? [];

  const maxDisplay = collapsed ? 3 : displayItems.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {results.total_count}件の結果
          </span>
          <span className="text-2xs text-text-muted bg-navy-700/50 px-1.5 py-0.5 rounded font-mono">
            {searchModeLabel}
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-accent/15 text-accent border border-accent/30"
              : "text-text-muted hover:text-text-secondary border border-transparent"
          }`}
        >
          All ({results.total_count})
        </button>
        {categoriesWithItems.map((key) => {
          const config = CATEGORY_CONFIG[key];
          const count = results[key].length;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                isActive
                  ? "border-opacity-30"
                  : "text-text-muted hover:text-text-secondary border-transparent"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${config.color}15`,
                      color: config.color,
                      borderColor: `${config.color}4D`,
                    }
                  : undefined
              }
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Result items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {displayItems.slice(0, maxDisplay).map((item) => (
            <ResultItem key={`${item.type}-${item.id}`} item={item} />
          ))}
          {collapsed && displayItems.length > maxDisplay && (
            <p className="text-xs text-text-muted text-center py-2">
              + {displayItems.length - maxDisplay} more results
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
