"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { SourceTierBadge } from "@/components/ui/SourceTierBadge";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Alert } from "@/types";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Link href={`/alerts/${alert.id}`}>
      <Card severity={alert.severity} hoverable className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1">
            {alert.title}
          </h3>
          <span className="text-2xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {format(new Date(alert.published_at), "MMM d")}
          </span>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {alert.summary_what}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {alert.compounds.slice(0, 4).map((compound) => (
            <span
              key={compound}
              className="px-1.5 py-0.5 bg-navy-600 text-gray-300 text-2xs rounded font-medium"
            >
              {compound}
            </span>
          ))}
          {alert.compounds.length > 4 && (
            <span className="text-2xs text-gray-500">+{alert.compounds.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SourceTierBadge tier={alert.source_tier} />
            <ConfidenceLabel level={alert.confidence_level} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
