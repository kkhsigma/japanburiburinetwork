"use client";

import { DiffView } from "@/components/ui/DiffView";
import { SourceTierBadge } from "@/components/ui/SourceTierBadge";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrackButton } from "@/components/tracking/TrackButton";
import { mockAlerts, mockCompounds } from "@/lib/mock-data";
import { useAlert } from "@/hooks/useAlerts";
import { useWatchlistSync } from "@/hooks/useWatchlistSync";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";

const statusToLegalStatus = {
  pending: "pending" as const,
  verified: "reported" as const,
  official_confirmed: "official_confirmed" as const,
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#06090f]">
      <header className="sticky top-0 z-40 bg-[#06090f]/80 backdrop-blur-xl border-b border-[#1e293b]/50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 flex items-center h-14 gap-4">
          <Skeleton className="h-5 w-24" />
        </div>
      </header>
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-4">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-4">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-14 rounded" />
              <Skeleton className="h-6 w-14 rounded" />
              <Skeleton className="h-6 w-14 rounded" />
            </div>
          </div>
          <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlertDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  useWatchlistSync();

  const alertQuery = useAlert(id);
  const alert = alertQuery.data?.data ?? mockAlerts.find((a) => a.id === id);

  if (alertQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (alertQuery.isError) {
    return (
      <div className="min-h-screen bg-[#06090f] flex flex-col items-center justify-center px-4">
        <AlertTriangle size={32} className="text-[#64748b] mb-4" />
        <p className="text-[#94a3b8] text-sm mb-1">アラートの読み込みに失敗しました</p>
        <p className="text-[#64748b] text-xs mb-4">Failed to load alert. Please try again.</p>
        <Link
          href="/alerts"
          className="text-[#1a9a8a] hover:text-[#22b8a6] text-sm font-medium transition-colors"
        >
          &larr; アラートフィードに戻る
        </Link>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-[#06090f] flex flex-col items-center justify-center px-4">
        <AlertTriangle size={32} className="text-[#64748b] mb-4" />
        <p className="text-[#94a3b8] text-sm mb-1">アラートが見つかりません</p>
        <p className="text-[#64748b] text-xs mb-4">Alert not found.</p>
        <Link
          href="/alerts"
          className="text-[#1a9a8a] hover:text-[#22b8a6] text-sm font-medium transition-colors"
        >
          &larr; アラートフィードに戻る
        </Link>
      </div>
    );
  }

  // Match compounds in this alert to known compounds for TrackButton
  const matchedCompounds = alert.compounds
    .map((name) => {
      const found = mockCompounds.find(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() ||
          c.aliases.some((a) => a.toLowerCase() === name.toLowerCase())
      );
      return found ? { id: found.id, name: found.name, displayName: name } : null;
    })
    .filter(Boolean) as { id: string; name: string; displayName: string }[];

  return (
    <div className="min-h-screen bg-[#06090f]">
      <header className="sticky top-0 z-40 bg-[#06090f]/80 backdrop-blur-xl border-b border-[#1e293b]/50">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-14 gap-4">
            <Link
              href="/alerts"
              className="flex items-center gap-2 text-[#64748b] hover:text-[#1a9a8a] transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-medium">アラートフィード</span>
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

        {/* Affected compounds with TrackButtons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Compounds ({alert.compounds.length})
            </h3>
            <div className="space-y-2">
              {alert.compounds.map((compoundName) => {
                const matched = matchedCompounds.find(
                  (m) => m.displayName === compoundName || m.name === compoundName
                );
                return (
                  <div
                    key={compoundName}
                    className="flex items-center justify-between"
                  >
                    {matched ? (
                      <Link
                        href={`/explore/compounds/${matched.id}`}
                        className="text-sm text-gray-300 hover:text-[#1a9a8a] transition-colors font-medium"
                      >
                        {compoundName}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-300 font-medium">
                        {compoundName}
                      </span>
                    )}
                    {matched && (
                      <TrackButton
                        compound={{ id: matched.id, name: matched.name }}
                        size="sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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

        {/* Agencies */}
        {alert.agencies && alert.agencies.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Agencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {alert.agencies.map((agency) => (
                <span key={agency} className="px-2 py-0.5 bg-navy-600 text-gray-300 text-xs rounded font-medium">
                  {agency}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Score */}
        <Card className="p-4 mb-6">
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

        {/* Footer meta */}
        <div className="text-center pt-2 pb-8">
          <p className="text-[11px] text-[#475569] font-mono">
            Alert ID: {alert.id} · Created: {format(new Date(alert.created_at), "yyyy/MM/dd HH:mm")}
          </p>
        </div>
      </div>
    </div>
  );
}
