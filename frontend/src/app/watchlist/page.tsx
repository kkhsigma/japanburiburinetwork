"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { EntityCard } from "@/components/watchlist/EntityCard";
import { mockCompounds, mockWatchlist, mockWatchlistHighlights } from "@/lib/mock-data";
import { useWatchlist, useWatchlistHighlights, useAddToWatchlist } from "@/hooks/useWatchlist";
import { useCompounds } from "@/hooks/useCompounds";
import { Eye, Plus, TrendingUp, X, Search } from "lucide-react";
import { format } from "date-fns";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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

export default function WatchlistPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const watchlistQuery = useWatchlist();
  const highlightsQuery = useWatchlistHighlights();
  const compoundsQuery = useCompounds();
  const addMutation = useAddToWatchlist();

  const watchlistData = watchlistQuery.data?.data ?? mockWatchlist;
  const highlightsData = highlightsQuery.data?.data ?? mockWatchlistHighlights;
  const compoundsData = compoundsQuery.data?.data ?? mockCompounds;

  const watchedCompounds = watchlistData
    .filter((w) => w.entity_type === "compound")
    .map((w) => {
      const compound = compoundsData.find((c) => c.id === w.entity_id);
      return { watchEntry: w, compound };
    })
    .filter((w) => w.compound);

  const unwatchedCompounds = compoundsData.filter(
    (c) =>
      !watchlistData.some(
        (w) => w.entity_id === c.id && w.entity_type === "compound"
      )
  );

  const filteredUnwatched = searchQuery
    ? unwatchedCompounds.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.aliases.some((a) =>
            a.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : unwatchedCompounds;

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Eye size={20} className="text-[#1a9a8a]" />
              <h1 className="text-2xl font-bold text-[#e2e8f0]">ウォッチリスト</h1>
            </div>
            <p className="text-sm text-[#64748b]">
              コンプライアンス監視
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1a9a8a]/10 border border-[#1a9a8a]/30 text-[#1a9a8a] hover:bg-[#1a9a8a]/20 transition-colors"
          >
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            {showAddForm ? "閉じる" : "ウォッチリストに追加"}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border border-[#1e293b] bg-[#0c1220] p-5 overflow-hidden"
          >
            <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">
              成分をウォッチリストに追加
            </h3>
            <div className="relative mb-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="追加する成分を検索..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm bg-[#111827] border border-[#1e293b] text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#1a9a8a]/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {filteredUnwatched.map((compound) => (
                <button
                  key={compound.id}
                  className="p-3 rounded-lg bg-[#111827] border border-[#1e293b] text-left hover:border-[#1a9a8a]/30 transition-colors"
                  onClick={() => {
                    addMutation.mutate({
                      entity_type: "compound",
                      entity_id: compound.id,
                      entity_name: compound.name,
                      notification_enabled: true,
                    });
                  }}
                >
                  <p className="text-sm font-medium text-[#e2e8f0]">
                    {compound.name}
                  </p>
                  {compound.aliases[0] && (
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {compound.aliases[0]}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Changes */}
        {highlightsData.length > 0 && (
          <div className="mb-6 rounded-xl border border-[#1e293b] bg-[#0c1220] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#1e293b]">
              <TrendingUp size={16} className="text-[#1a9a8a]" />
              <h2 className="text-sm font-semibold text-[#e2e8f0]">
                最近の変更
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {highlightsData.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#1e293b] bg-[#111827]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#e2e8f0]">
                      {h.entity_name}
                    </span>
                    <span className="text-xs text-[#1a9a8a] font-medium">
                      {h.change}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748b] font-mono">
                    {format(new Date(h.changed_at), "MMM d")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watched entities */}
        <div className="rounded-xl border border-[#1e293b] bg-[#0c1220] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#1e293b]">
            <Eye size={16} className="text-[#64748b]" />
            <h2 className="text-sm font-semibold text-[#e2e8f0]">
              監視中 ({watchedCompounds.length})
            </h2>
          </div>
          <div className="p-4">
            {watchedCompounds.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {watchedCompounds.map(({ watchEntry, compound }) => (
                  <motion.div key={watchEntry.id} variants={itemVariants}>
                    <EntityCard
                      compound={compound!}
                      isWatched
                      notificationEnabled={watchEntry.notification_enabled}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#64748b] text-sm">
                  ウォッチリストにはまだ成分がありません。
                </p>
                <p className="text-xs text-[#64748b]/70 mt-1">
                  成分を追加して規制変更を追跡しましょう。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
