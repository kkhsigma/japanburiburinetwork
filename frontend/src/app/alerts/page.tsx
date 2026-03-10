"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertsStore } from "@/stores/alertsStore";
import { mockAlerts } from "@/lib/mock-data";
import { AlertFilterBar } from "@/components/alerts/AlertFilterBar";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertCardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function AlertsPage() {
  const { filters, setFilters, resetFilters } = useAlertsStore();
  const { data, isLoading, isError, refetch } = useAlerts(filters);

  const allAlerts = data?.data ?? mockAlerts;

  // Client-side filtering (fallback when backend is unavailable)
  const filtered = useMemo(() => {
    let result = allAlerts;
    if (filters.severity) {
      result = result.filter((a) => a.severity === filters.severity);
    }
    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters.compound) {
      const search = filters.compound.toLowerCase();
      result = result.filter((a) =>
        a.compounds.some((c) => c.toLowerCase().includes(search))
      );
    }
    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    return result;
  }, [allAlerts, filters]);

  // Pagination
  const limit = filters.limit ?? 20;
  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="min-h-screen bg-[#06090f] text-[#e2e8f0]">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#06090f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/universe"
              className="flex items-center justify-center rounded-md p-1.5 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e293b] transition-colors"
              aria-label="Back to universe"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-base font-bold tracking-tight">
              アラートフィード
            </h1>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Filter bar */}
        <div className="mb-6">
          <AlertFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Results count */}
        <p className="mb-4 text-xs text-[#64748b]">
          {filtered.length} alert{filtered.length !== 1 ? "s" : ""} found
          {filters.severity || filters.category || filters.compound
            ? " (filtered)"
            : ""}
        </p>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <AlertCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={28} className="text-[#64748b] mb-3" />
            <p className="text-sm text-[#94a3b8] mb-1">アラートの読み込みに失敗しました</p>
            <p className="text-xs text-[#64748b] mb-3">Could not load alerts. Showing cached data.</p>
            <button
              onClick={() => refetch()}
              className="rounded-md px-4 py-2 text-xs text-[#1a9a8a] hover:bg-[#1e293b] transition-colors"
            >
              再読み込み / Retry
            </button>
          </div>
        )}

        {/* Alert list with stagger animation */}
        {!isLoading && paginated.length > 0 && (
          <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
          >
            {paginated.map((alert) => (
              <motion.div
                key={alert.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <AlertCard alert={alert} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[#64748b]">No alerts match your filters.</p>
            <button
              onClick={resetFilters}
              className="mt-3 rounded-md px-4 py-2 text-xs text-[#3b82f6] hover:bg-[#1e293b] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={currentPage}
              total={totalPages}
              hasMore={currentPage < totalPages}
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        )}
      </main>
    </div>
  );
}
