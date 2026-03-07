"use client";

import { DiffView } from "@/components/ui/DiffView";
import { SourceTierBadge } from "@/components/ui/SourceTierBadge";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockAlerts } from "@/lib/mock-data";
import { useAlert } from "@/hooks/useAlerts";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

const statusToLegalStatus = {
  pending: "pending" as const,
  verified: "reported" as const,
  official_confirmed: "official_confirmed" as const,
};

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const alertQuery = useAlert(id);
  const alert = alertQuery.data?.data ?? mockAlerts.find((a) => a.id === id);

  if (alertQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#06090f] px-4 py-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-[#06090f] px-4 py-12 text-center">
        <p className="text-gray-400">Alert not found.</p>
        <Link href="/universe" className="text-[#1a9a8a] text-sm mt-2 inline-block">
          Back to universe
        </Link>
      </div>
    );
  }

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
        {/* Primary source link */}
        {alert.primary_source_url && (
          <a
            href={alert.primary_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 mb-4 bg-[#1a9a8a]/10 border border-[#1a9a8a]/30 rounded-lg text-sm text-[#1a9a8a] hover:bg-[#1a9a8a]/20 transition-colors"
          >
            <ExternalLink size={14} />
            View Primary Source
          </a>
        )}

        {/* Title & meta */}
        <Card severity={alert.severity} className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SourceTierBadge tier={alert.source_tier} />
            <ConfidenceLabel level={alert.confidence_level} />
            <Badge status={statusToLegalStatus[alert.status]} />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">{alert.title}</h1>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Published: {format(new Date(alert.published_at), "MMM d, yyyy")}
            </span>
            {alert.effective_at && (
              <span className="flex items-center gap-1 text-alert-yellow">
                <AlertTriangle size={12} />
                Effective: {format(new Date(alert.effective_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </Card>

        {/* Summary block */}
        <div className="space-y-4 mb-6">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-[#1a9a8a] uppercase tracking-wider mb-2">
              What Changed
            </h3>
            <p className="text-sm text-gray-300">{alert.summary_what}</p>
          </Card>
          {alert.summary_why && (
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-alert-yellow uppercase tracking-wider mb-2">
                Why It Matters
              </h3>
              <p className="text-sm text-gray-300">{alert.summary_why}</p>
            </Card>
          )}
          {alert.summary_who && (
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-alert-blue uppercase tracking-wider mb-2">
                Who Is Affected
              </h3>
              <p className="text-sm text-gray-300">{alert.summary_who}</p>
            </Card>
          )}
        </div>

        {/* Semantic Diff */}
        {alert.diff_before && alert.diff_after && alert.diff_type && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Regulatory Diff</h2>
            <DiffView
              before={alert.diff_before}
              after={alert.diff_after}
              diffType={alert.diff_type}
            />
          </section>
        )}

        {/* Affected compounds & product forms */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Compounds
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {alert.compounds.map((c) => (
                <span key={c} className="px-2 py-0.5 bg-navy-600 text-gray-300 text-xs rounded font-medium">
                  {c}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Product Forms
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {alert.product_forms.map((p) => (
                <span key={p} className="px-2 py-0.5 bg-navy-600 text-gray-300 text-xs rounded font-medium capitalize">
                  {p}
                </span>
              ))}
              {alert.product_forms.length === 0 && (
                <span className="text-xs text-gray-500">All categories</span>
              )}
            </div>
          </Card>
        </div>

        {/* Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Importance Score</span>
            <span className={`text-lg font-bold font-mono ${
              alert.importance_score >= 80 ? "text-alert-red" :
              alert.importance_score >= 50 ? "text-alert-yellow" :
              "text-gray-400"
            }`}>
              {alert.importance_score}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
