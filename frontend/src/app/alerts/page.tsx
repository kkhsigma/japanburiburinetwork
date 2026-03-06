"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertCardSkeleton } from "@/components/ui/Skeleton";
import { mockAlerts } from "@/lib/mock-data";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertSeverity } from "@/types";

const FILTERS: { label: string; value: AlertSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function AlertsPage() {
  const [activeFilter, setActiveFilter] = useState<AlertSeverity | "all">("all");

  const alertsQuery = useAlerts(activeFilter === "all" ? {} : { severity: activeFilter });

  // Use API data when available, fall back to mock data
  const allAlerts = alertsQuery.data?.data ?? mockAlerts;
  const filtered =
    activeFilter === "all"
      ? allAlerts
      : allAlerts.filter((a) => a.severity === activeFilter);
  const isLoading = alertsQuery.isLoading;

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-1">Regulatory Alerts</h1>
        <p className="text-xs text-gray-400 mb-6">Difference Detection Radar</p>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                ${activeFilter === filter.value
                  ? "bg-accent-green text-white"
                  : "bg-navy-700 text-gray-400 hover:bg-navy-600"
                }
              `}
            >
              {filter.label}
              {filter.value !== "all" && (
                <span className="ml-1 opacity-60">
                  ({allAlerts.filter((a) => a.severity === filter.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <AlertCardSkeleton key={i} />)
          ) : (
            <>
              {filtered.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-12">No alerts matching this filter.</p>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
