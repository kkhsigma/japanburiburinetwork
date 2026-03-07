"use client";

import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { AlertCard } from "@/components/alerts/AlertCard";
import { StatusChangeTimeline } from "@/components/watchlist/StatusChangeTimeline";
import { mockCompounds, mockAlerts } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { CompoundStateTransition } from "@/types";

// Mock timeline data
const mockTimelines: Record<string, CompoundStateTransition[]> = {
  "2": [
    {
      id: "t1",
      compound_id: "2",
      previous_state: "unknown",
      new_state: "under_review",
      changed_at: "2026-02-15T09:00:00Z",
      trigger_alert_id: "3",
      notes: "MHLW committee reviewing CBN for potential designation",
    },
  ],
  "8": [
    {
      id: "t2",
      compound_id: "8",
      previous_state: "unknown",
      new_state: "reported",
      changed_at: "2025-12-01T00:00:00Z",
      trigger_alert_id: null,
      notes: "Industry reports of regulatory interest",
    },
    {
      id: "t3",
      compound_id: "8",
      previous_state: "reported",
      new_state: "official_confirmed",
      changed_at: "2026-02-01T00:00:00Z",
      trigger_alert_id: null,
      notes: "MHLW confirmed inclusion in designation list",
    },
    {
      id: "t4",
      compound_id: "8",
      previous_state: "official_confirmed",
      new_state: "promulgated",
      changed_at: "2026-03-04T00:00:00Z",
      trigger_alert_id: "1",
      notes: "Officially designated, effective April 1, 2026",
    },
  ],
};

export default function CompoundDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const compound = mockCompounds.find((c) => c.id === id);

  if (!compound) {
    return (
      <div className="min-h-screen bg-[#06090f] px-4 py-12 text-center">
        <p className="text-gray-400">Compound not found.</p>
        <Link href="/explore" className="text-[#1a9a8a] text-sm mt-2 inline-block">
          Back to explore
        </Link>
      </div>
    );
  }

  const relatedAlerts = mockAlerts.filter((a) =>
    a.compounds.some((c) => c.toLowerCase() === compound.name.toLowerCase())
  );

  const timeline = mockTimelines[compound.id] || [];

  return (
    <div className="min-h-screen bg-[#06090f]">
      <header className="sticky top-0 z-40 bg-[#06090f]/80 backdrop-blur-xl border-b border-[#1e293b]/50">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-14 gap-4">
            <Link
              href="/explore"
              className="flex items-center gap-2 text-[#64748b] hover:text-[#1a9a8a] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-medium">探索に戻る</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* Compound header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{compound.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {compound.aliases.join(" / ")}
              </p>
            </div>
            <StatusIndicator riskLevel={compound.risk_level} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Badge status={compound.legal_status_japan} />
            {compound.chemical_family && (
              <span className="text-xs text-gray-400">{compound.chemical_family}</span>
            )}
            {compound.natural_or_synthetic && (
              <span className="text-2xs px-2 py-0.5 bg-navy-600 text-gray-300 rounded capitalize">
                {compound.natural_or_synthetic}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-300">{compound.effects_summary}</p>

          <p className="text-2xs text-gray-500 mt-4">
            Last updated: {format(new Date(compound.legal_status_updated_at), "MMM d, yyyy")}
          </p>
        </Card>

        {/* State timeline */}
        {timeline.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Status Timeline</h2>
            <Card className="p-4">
              <StatusChangeTimeline transitions={timeline} />
            </Card>
          </section>
        )}

        {/* Related alerts */}
        {relatedAlerts.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white mb-3">
              Related Alerts ({relatedAlerts.length})
            </h2>
            <div className="space-y-3">
              {relatedAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
