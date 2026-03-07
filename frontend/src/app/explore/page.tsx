"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CompoundCard } from "@/components/explore/CompoundCard";
import { CompoundCardSkeleton } from "@/components/ui/Skeleton";
import { mockCompounds } from "@/lib/mock-data";
import { useCompounds } from "@/hooks/useCompounds";
import { Search, X, ArrowLeft } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const compoundsQuery = useCompounds();
  const compoundsData = compoundsQuery.data?.data ?? mockCompounds;
  const isLoading = compoundsQuery.isLoading;

  const filtered = searchQuery
    ? compoundsData.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.aliases.some((a) =>
            a.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : compoundsData;

  return (
    <div className="min-h-screen bg-[#06090f] relative">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#1a9a8a]/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Minimal header */}
      <header className="sticky top-0 z-40 bg-[#06090f]/80 backdrop-blur-xl border-b border-[#1e293b]/50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-14 gap-4">
            <Link
              href="/universe"
              className="flex items-center gap-2 text-[#64748b] hover:text-[#1a9a8a] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-medium hidden sm:inline">ユニバース</span>
            </Link>
            <div className="h-4 w-px bg-[#1e293b]" />
            <span className="text-sm font-medium text-[#e2e8f0]">
              探索
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Search bar */}
        <div className="relative mb-8">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="成分名またはエイリアスで検索..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#0c1220] border border-[#1e293b] text-sm text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#1a9a8a]/50 focus:border-[#1a9a8a]/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#64748b]">
            {filtered.length}件の成分
            {searchQuery && `（「${searchQuery}」で検索）`}
          </p>
        </div>

        {/* Compound grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompoundCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((compound) => (
              <motion.div key={compound.id} variants={itemVariants}>
                <CompoundCard compound={compound} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#64748b] text-sm">
              成分が見つかりません{searchQuery ? `（「${searchQuery}」）` : ""}。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
