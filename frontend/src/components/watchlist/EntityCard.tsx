"use client";

import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { Bell, BellOff } from "lucide-react";
import { Compound } from "@/types";

interface EntityCardProps {
  compound: Compound;
  isWatched?: boolean;
  notificationEnabled?: boolean;
  onToggleWatch?: () => void;
}

export function EntityCard({ compound, isWatched = false, notificationEnabled = false, onToggleWatch }: EntityCardProps) {
  return (
    <Card hoverable className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white">{compound.name}</h3>
          {compound.aliases.length > 0 && (
            <p className="text-2xs text-gray-500 mt-0.5">{compound.aliases[0]}</p>
          )}
        </div>
        {isWatched && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWatch?.();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {notificationEnabled ? <Bell size={16} className="text-accent-green" /> : <BellOff size={16} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge status={compound.legal_status_japan} />
        <StatusIndicator riskLevel={compound.risk_level} />
      </div>

      <p className="text-xs text-gray-400 line-clamp-2">
        {compound.effects_summary}
      </p>
    </Card>
  );
}
