"use client";

import { DiffType } from "@/types";

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
    <div className={`rounded-lg overflow-hidden border border-navy-600 ${className}`}>
      <div className="px-3 py-1.5 bg-navy-600 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-300">Semantic Diff</span>
        <span className="text-2xs text-gray-400 bg-navy-700 px-2 py-0.5 rounded">
          {diffTypeLabels[diffType]}
        </span>
      </div>
      <div className="divide-y divide-navy-600">
        {before && (
          <div className="flex">
            <div className="w-8 flex-shrink-0 bg-red-900/30 flex items-center justify-center text-red-400 text-xs font-mono">
              -
            </div>
            <div className="flex-1 px-3 py-2 bg-red-900/10 text-red-300 text-sm font-mono">
              {before}
            </div>
          </div>
        )}
        {after && (
          <div className="flex">
            <div className="w-8 flex-shrink-0 bg-green-900/30 flex items-center justify-center text-green-400 text-xs font-mono">
              +
            </div>
            <div className="flex-1 px-3 py-2 bg-green-900/10 text-green-300 text-sm font-mono">
              {after}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
