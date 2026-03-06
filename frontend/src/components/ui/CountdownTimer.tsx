"use client";

import { useEffect, useState } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes, isPast } from "date-fns";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
  className?: string;
}

export function CountdownTimer({ targetDate, label, className = "" }: CountdownTimerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (isPast(targetDate)) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock size={14} className="text-alert-red" />
        <span className="text-sm text-alert-red font-medium">Effective</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    );
  }

  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;

  const isUrgent = days < 7;

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Clock size={14} className={isUrgent ? "text-alert-red" : "text-alert-yellow"} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-mono font-bold ${isUrgent ? "text-alert-red" : "text-white"}`}>
          {days}
        </span>
        <span className="text-xs text-gray-400 mr-2">days</span>
        <span className={`text-lg font-mono font-bold ${isUrgent ? "text-alert-red" : "text-white"}`}>
          {hours}
        </span>
        <span className="text-xs text-gray-400 mr-2">hrs</span>
        <span className={`text-lg font-mono font-bold ${isUrgent ? "text-alert-red" : "text-white"}`}>
          {minutes}
        </span>
        <span className="text-xs text-gray-400">min</span>
      </div>
    </div>
  );
}
