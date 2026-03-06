"use client";

import { DiffType } from "@/types";
import { Minus, Plus } from "lucide-react";

interface DiffViewProps {
  before: string;
  after: string;
  diffType: DiffType;
  className?: string;
}

const diffTypeLabels: Record<DiffType, string> = {
  threshold: "Threshold Change",
  status: "Status Change",
  scope: "Scope Change",
  date: "Date Change",
};

export function DiffView({ before, after, diffType, className = "" }: DiffViewProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden border border-border ${className}`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-surface-overlay flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          Semantic Diff
        </span>
        <span className="text-2xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border">
          {diffTypeLabels[diffType]}
        </span>
      </div>

      {/* Diff lines */}
      <div className="divide-y divide-border">
        {before && (
          <div className="flex">
            <div className="w-8 flex-shrink-0 bg-red-900/15 flex items-center justify-center">
              <Minus size={12} className="text-red-400" />
            </div>
            <div className="flex-1 px-3 py-2 bg-red-900/5 text-red-300 text-sm font-mono">
              {before}
            </div>
          </div>
        )}
        {after && (
          <div className="flex">
            <div className="w-8 flex-shrink-0 bg-emerald-900/15 flex items-center justify-center">
              <Plus size={12} className="text-emerald-400" />
            </div>
            <div className="flex-1 px-3 py-2 bg-emerald-900/5 text-emerald-300 text-sm font-mono">
              {after}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
