"use client";

import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { AlertCard } from "@/components/alerts/AlertCard";
import { StatusChangeTimeline } from "@/components/watchlist/StatusChangeTimeline";
import { useCompound } from "@/hooks/useCompounds";
import { ArrowLeft, ExternalLink, ShieldAlert, FileText, Info } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { TrackButton } from "@/components/tracking/TrackButton";
import { useWatchlistSync } from "@/hooks/useWatchlistSync";
import { motion } from "framer-motion";
import type { CompoundSource } from "@/types";

const RISK_EXPLANATIONS: Record<string, { reason: string; detail: string }> = {
  SAFE: {
    reason: "Legal and regulated",
    detail:
      "This substance is legal in Japan under current regulations. Products must comply with THC residual limits and import requirements.",
  },
  LOW: {
    reason: "Legal with minor caveats",
    detail:
      "This substance is legal but less common in regulated products. Subject to the same compliance framework as other legal cannabinoids.",
  },
  MEDIUM: {
    reason: "Uncertain regulatory status",
    detail:
      "This substance has an unclear or evolving regulatory status. It may be subject to future restrictions. Monitor closely.",
  },
  HIGH: {
    reason: "Under active regulatory review",
    detail:
      "This substance is under review by Japanese authorities for potential designation as a controlled substance. High risk of becoming illegal.",
  },
  ILLEGAL: {
    reason: "Designated substance or narcotic",
    detail:
      "This substance is illegal in Japan. Possession, sale, import, and use are criminal offenses under the Cannabis Control Act or Designated Substances regulations.",
  },
};

const TIER_LABELS: Record<string, string> = {
  "1": "Tier 1 — Official Government",
  "2": "Tier 2 — Government Agency",
  "3": "Tier 3 — Verified News",
  "4": "Tier 4 — Industry Source",
  "5": "Tier 5 — Unverified",
};

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    SAFE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    LOW: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    ILLEGAL: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[level] || colors.MEDIUM}`}
    >
      {level}
    </span>
  );
}

function SourceCard({ source }: { source: CompoundSource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#1e293b]/50 hover:border-[#1a9a8a]/40 transition-colors group"
    >
      <FileText size={16} className="text-gray-500 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-200 group-hover:text-[#1a9a8a] transition-colors truncate">
          {source.name}
        </p>
        <p className="text-2xs text-gray-500 mt-0.5">
          {TIER_LABELS[source.tier] || `Tier ${source.tier}`} · {source.source_type.replace(/_/g, " ")}
        </p>
      </div>
      <ExternalLink size={14} className="text-gray-600 group-hover:text-[#1a9a8a] shrink-0 mt-0.5" />
    </a>
  );
}

export default function CompoundDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  useWatchlistSync();
  const { data: result, isLoading } = useCompound(id);

  const compound = result?.data;
  const timeline = result?.timeline ?? [];
  const relatedAlerts = result?.related_alerts ?? [];
  const sources = result?.sources ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a9a8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  const riskKey = compound.risk_level?.toUpperCase() || "MEDIUM";
  const riskInfo = RISK_EXPLANATIONS[riskKey] || RISK_EXPLANATIONS.MEDIUM;

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

      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        {/* Compound header */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{compound.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {compound.aliases?.join(" / ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TrackButton compound={{ id: compound.id, name: compound.name }} size="md" />
              <StatusIndicator riskLevel={compound.risk_level} />
            </div>
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

          {compound.legal_status_updated_at && (
            <p className="text-2xs text-gray-500 mt-4">
              Last updated: {format(new Date(compound.legal_status_updated_at), "MMM d, yyyy")}
            </p>
          )}
        </Card>

        {/* Risk Assessment */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-gray-400" />
            Risk Assessment
          </h2>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <RiskBadge level={riskKey} />
              <span className="text-sm font-medium text-gray-200">{riskInfo.reason}</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {riskInfo.detail}
            </p>

            {compound.notes && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#0d1117] border border-[#1e293b]/50">
                <Info size={14} className="text-[#1a9a8a] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">{compound.notes}</p>
              </div>
            )}

            {/* Evidence from alerts */}
            {relatedAlerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#1e293b]/50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Supporting Evidence ({relatedAlerts.length} alert{relatedAlerts.length !== 1 ? "s" : ""})
                </p>
                <div className="space-y-2">
                  {relatedAlerts.slice(0, 5).map((alert) => (
                    <Link
                      key={alert.id}
                      href={`/alerts/${alert.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] border border-[#1e293b]/50 hover:border-[#1a9a8a]/40 transition-colors group"
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          alert.severity === "critical"
                            ? "bg-red-500"
                            : alert.severity === "high"
                            ? "bg-orange-500"
                            : alert.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-200 group-hover:text-[#1a9a8a] transition-colors">
                          {alert.title}
                        </p>
                        <p className="text-2xs text-gray-500 mt-0.5">
                          {alert.severity} · {alert.status.replace(/_/g, " ")} ·{" "}
                          {alert.published_at
                            ? format(new Date(alert.published_at), "MMM d, yyyy")
                            : "Date unknown"}
                        </p>
                        {alert.summary_what && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {alert.summary_what}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.section>

        {/* Sources */}
        {sources.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              Official Sources ({sources.length})
            </h2>
            <div className="space-y-2">
              {sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </motion.section>
        )}

        {/* State timeline */}
        {timeline.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-semibold text-white mb-3">Status Timeline</h2>
            <Card className="p-4">
              <StatusChangeTimeline transitions={timeline} />
            </Card>
          </motion.section>
        )}

        {/* Related alerts (full cards) */}
        {relatedAlerts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-sm font-semibold text-white mb-3">
              Related Alerts ({relatedAlerts.length})
            </h2>
            <div className="space-y-3">
              {relatedAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
