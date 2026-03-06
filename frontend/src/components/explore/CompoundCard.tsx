"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Compound } from "@/types";
import { format } from "date-fns";

interface CompoundCardProps {
  compound: Compound;
}

export function CompoundCard({ compound }: CompoundCardProps) {
  return (
    <Link href={`/explore/compounds/${compound.id}`}>
      <Card hoverable className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{compound.name}</h3>
          <StatusIndicator riskLevel={compound.risk_level} />
        </div>
        <Badge status={compound.legal_status_japan} className="mb-3" />
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
          {compound.effects_summary}
        </p>
        <p className="text-2xs text-gray-500">
          Updated: {format(new Date(compound.legal_status_updated_at), "MMM d, yyyy")}
        </p>
      </Card>
    </Link>
  );
}
