"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { CompoundStateTransition } from "@/types";

interface StatusChangeTimelineProps {
  transitions: CompoundStateTransition[];
  className?: string;
}

export function StatusChangeTimeline({ transitions, className = "" }: StatusChangeTimelineProps) {
  if (transitions.length === 0) {
    return (
      <p className="text-sm text-gray-500">No status changes recorded.</p>
    );
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {transitions.map((transition, index) => (
        <div key={transition.id} className="relative flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-accent-green border-2 border-navy-700 z-10" />
            {index < transitions.length - 1 && (
              <div className="w-0.5 flex-1 bg-navy-600" />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge status={transition.previous_state} />
              <span className="text-gray-500 text-xs">→</span>
              <Badge status={transition.new_state} />
            </div>
            <p className="text-xs text-gray-400">
              {format(new Date(transition.changed_at), "MMM d, yyyy")}
            </p>
            {transition.notes && (
              <p className="text-xs text-gray-500 mt-1">{transition.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
