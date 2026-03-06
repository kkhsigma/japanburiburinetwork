"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EntityCard } from "@/components/watchlist/EntityCard";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { mockCompounds, mockWatchlist, mockWatchlistHighlights } from "@/lib/mock-data";
import { useWatchlist, useWatchlistHighlights, useAddToWatchlist } from "@/hooks/useWatchlist";
import { useCompounds } from "@/hooks/useCompounds";
import { Plus, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function WatchlistPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // React Query hooks — fall back to mock data while backend is unavailable
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
    (c) => !watchlistData.some((w) => w.entity_id === c.id && w.entity_type === "compound")
  );

  const filteredUnwatched = searchQuery
    ? unwatchedCompounds.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : unwatchedCompounds;

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Watchlist</h1>
            <p className="text-xs text-gray-400">Personal compliance monitoring</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>

        {/* Highlights */}
        {highlightsData.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-accent-green" />
              <h2 className="text-sm font-semibold text-white">Recent Changes</h2>
            </div>
            <div className="space-y-2">
              {highlightsData.map((h, i) => (
                <Card key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{h.entity_name}</span>
                    <span className="text-xs text-accent-green">{h.change}</span>
                  </div>
                  <span className="text-2xs text-gray-500">
                    {format(new Date(h.changed_at), "MMM d")}
                  </span>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Add to watchlist */}
        {showAddForm && (
          <section className="mb-6">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Add to Watchlist</h3>
              <SearchBar
                placeholder="Search compounds to add..."
                onSearch={setSearchQuery}
                className="mb-3"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {filteredUnwatched.map((compound) => (
                  <button
                    key={compound.id}
                    className="p-3 bg-navy-600 rounded-lg text-left hover:bg-navy-500 transition-colors"
                    onClick={() => {
                      addMutation.mutate({
                        entity_type: "compound",
                        entity_id: compound.id,
                        entity_name: compound.name,
                        notification_enabled: true,
                      });
                    }}
                  >
                    <p className="text-sm font-medium text-white">{compound.name}</p>
                    <p className="text-2xs text-gray-400">{compound.aliases[0]}</p>
                  </button>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Watched entities grid */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Watching ({watchedCompounds.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {watchedCompounds.map(({ watchEntry, compound }) => (
              <EntityCard
                key={watchEntry.id}
                compound={compound!}
                isWatched
                notificationEnabled={watchEntry.notification_enabled}
              />
            ))}
          </div>
          {watchedCompounds.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No compounds in your watchlist yet.</p>
              <p className="text-xs text-gray-600 mt-1">
                Add compounds to track regulatory changes.
              </p>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
