"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CompoundCard } from "@/components/explore/CompoundCard";
import { CompoundCardSkeleton } from "@/components/ui/Skeleton";
import { mockCompounds } from "@/lib/mock-data";
import { useCompounds } from "@/hooks/useCompounds";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import HybridSearch from "@/components/search/HybridSearch";
import { useSearchStore } from "@/stores/searchStore";

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
  const [localFilter] = useState("");

  const compoundsQuery = useCompounds();
  const compoundsData = compoundsQuery.data?.data ?? mockCompounds;
  const isLoading = compoundsQuery.isLoading;
  const isError = compoundsQuery.isError;

  // Read search state to determine if hybrid search is active
  const searchQuery = useSearchStore((s) => s.query);
  const searchResults = useSearchStore((s) => s.results);
  const isSearchActive = searchQuery.length >= 2 && searchResults !== null;

  const filtered = localFilter
    ? compoundsData.filter(
        (c) =>
          c.name.toLowerCase().includes(localFilter.toLowerCase()) ||
          c.aliases.some((a) =>
            a.toLowerCase().includes(localFilter.toLowerCase())
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
        {/* Hybrid Search */}
        <div className="mb-8">
          <HybridSearch />
        </div>

        {/* Compound grid — hidden when search results are showing */}
        {!isSearchActive && (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#64748b]">
                {filtered.length}件の成分
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

            {!isLoading && isError && (
              <div className="flex flex-col items-center py-16 text-center">
                <AlertTriangle size={24} className="text-[#64748b] mb-3" />
                <p className="text-[#94a3b8] text-sm mb-1">成分の読み込みに失敗しました</p>
                <p className="text-[#64748b] text-xs mb-3">Could not load compounds. Showing cached data.</p>
                <button
                  onClick={() => compoundsQuery.refetch()}
                  className="rounded-md px-4 py-2 text-xs text-[#1a9a8a] hover:bg-[#1e293b] transition-colors"
                >
                  再読み込み / Retry
                </button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#64748b] text-sm">
                  成分が見つかりません。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
