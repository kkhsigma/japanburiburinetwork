"use client";

import { useEffect, useState } from "react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isPast,
} from "date-fns";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
  className?: string;
}

export function CountdownTimer({
  targetDate,
  label,
  className = "",
}: CountdownTimerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isPast(targetDate)) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock size={14} className="text-critical" />
        <span className="text-sm text-critical font-medium">Effective</span>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
    );
  }

  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;

  const isUrgent = days < 7;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1.5">
        <Clock
          size={14}
          className={isUrgent ? "text-critical" : "text-signal"}
        />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {/* Days */}
        <span
          className={`text-2xl font-mono font-bold tracking-tight ${
            isUrgent ? "text-critical" : "text-text-primary"
          }`}
        >
          {days}
        </span>
        <span className="text-xs text-text-muted mr-2">days</span>

        {/* Hours */}
        <span
          className={`text-lg font-mono font-bold tracking-tight ${
            isUrgent ? "text-critical" : "text-text-primary"
          }`}
        >
          {hours}
        </span>
        <span className="text-xs text-text-muted mr-2">hrs</span>

        {/* Minutes */}
        <span
          className={`text-lg font-mono font-bold tracking-tight ${
            isUrgent ? "text-critical" : "text-text-primary"
          }`}
        >
          {minutes}
        </span>
        <span className="text-xs text-text-muted">min</span>
      </div>
    </div>
  );
}
