"use client";

import { AlertCard } from "@/components/alerts/AlertCard";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { SearchBar } from "@/components/ui/SearchBar";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockAlerts, mockWatchlistHighlights } from "@/lib/mock-data";
import { useCriticalAlerts, useUpcomingDates } from "@/hooks/useAlerts";
import { useWatchlistHighlights } from "@/hooks/useWatchlist";
import { AlertTriangle, Calendar, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export function HomePage() {
  // React Query hooks — fall back to mock data while backend is unavailable
  const criticalQuery = useCriticalAlerts();
  const upcomingQuery = useUpcomingDates();
  const highlightsQuery = useWatchlistHighlights();

  const criticalAlerts = criticalQuery.data?.data
    ?? mockAlerts.filter((a) => a.severity === "critical" || a.severity === "high").slice(0, 3);

  const upcomingAlerts = upcomingQuery.data?.data
    ?? mockAlerts.filter((a) => a.effective_at && new Date(a.effective_at) > new Date()).slice(0, 3);

  const watchlistHighlights = highlightsQuery.data?.data ?? mockWatchlistHighlights;

  const isLoading = criticalQuery.isLoading || upcomingQuery.isLoading || highlightsQuery.isLoading;

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto space-y-8">
      {/* JBN Radar Hero */}
      <section>
        <Card className="p-6 bg-gradient-to-br from-navy-700 to-navy-800 border-accent-green/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-accent-green" />
            <h2 className="text-lg font-bold text-white">JBN Radar</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              {isLoading ? <Skeleton className="h-9 w-12 mx-auto" /> : (
                <p className="text-3xl font-bold text-alert-red font-mono">
                  {criticalAlerts.filter((a) => a.severity === "critical").length}
                </p>
              )}
              <p className="text-2xs text-gray-400 mt-1">Critical Alerts</p>
            </div>
            <div className="text-center">
              {isLoading ? <Skeleton className="h-9 w-12 mx-auto" /> : (
                <p className="text-3xl font-bold text-alert-yellow font-mono">
                  {upcomingAlerts.length}
                </p>
              )}
              <p className="text-2xs text-gray-400 mt-1">Upcoming Deadlines</p>
            </div>
            <div className="text-center">
              {isLoading ? <Skeleton className="h-9 w-12 mx-auto" /> : (
                <p className="text-3xl font-bold text-accent-green font-mono">
                  {watchlistHighlights.length}
                </p>
              )}
              <p className="text-2xs text-gray-400 mt-1">Watchlist Changes</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Search */}
      <SearchBar />

      {/* Critical Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-alert-red" />
            <h2 className="text-sm font-semibold text-white">Critical Alerts</h2>
          </div>
          <Link href="/alerts" className="text-xs text-accent-green hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-1 lg:grid-cols-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="w-72 md:w-auto flex-shrink-0">
                <AlertCard alert={alert} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Dates */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-alert-yellow" />
          <h2 className="text-sm font-semibold text-white">Upcoming Dates</h2>
        </div>
        <div className="space-y-3">
          {upcomingAlerts.map((alert) => (
            <Link key={alert.id} href={`/alerts/${alert.id}`}>
              <Card hoverable className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white mb-2">{alert.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {alert.compounds.slice(0, 3).map((c) => (
                        <span key={c} className="px-1.5 py-0.5 bg-navy-600 text-gray-300 text-2xs rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <CountdownTimer
                    targetDate={new Date(alert.effective_at!)}
                    label={alert.title}
                    className="text-right ml-4"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Watchlist Highlights */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-accent-green" />
            <h2 className="text-sm font-semibold text-white">Watchlist Highlights</h2>
          </div>
          <Link href="/watchlist" className="text-xs text-accent-green hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {watchlistHighlights.map((highlight, i) => (
            <Card key={i} hoverable className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{highlight.entity_name}</span>
                <span className="text-xs text-accent-green">{highlight.change}</span>
              </div>
              <span className="text-2xs text-gray-500">
                {format(new Date(highlight.changed_at), "MMM d")}
              </span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
