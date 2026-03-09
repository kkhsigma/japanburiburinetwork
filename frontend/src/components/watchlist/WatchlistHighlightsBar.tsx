"use client";

import { format } from "date-fns";
import type { WatchlistHighlight } from "@/types";

interface WatchlistHighlightsBarProps {
  highlights: WatchlistHighlight[];
}

export function WatchlistHighlightsBar({ highlights }: WatchlistHighlightsBarProps) {
  if (highlights.length === 0) return null;

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {highlights.map((highlight, index) => (
        <div
          key={`${highlight.entity_name}-${index}`}
          className="flex-shrink-0 snap-start w-64 rounded-lg border border-[#1e293b] bg-[#111827] p-4"
        >
          <p className="text-sm font-bold text-[#1a9a8a] truncate">
            {highlight.entity_name}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
            {highlight.change}
          </p>
          <p className="text-[11px] text-[#64748b] mt-2">
            {format(new Date(highlight.changed_at), "yyyy/MM/dd")}
          </p>
        </div>
      ))}
    </div>
  );
}
