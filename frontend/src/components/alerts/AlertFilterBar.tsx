"use client";

import type { AlertFilters, AlertSeverity, AlertCategory } from '@/types';

interface AlertFilterBarProps {
  filters: AlertFilters;
  onFilterChange: (filters: Partial<AlertFilters>) => void;
  onReset: () => void;
}

const severityOptions: { value: AlertSeverity; label: string; color: string; activeColor: string }[] = [
  { value: 'critical', label: 'CRITICAL', color: 'border-red-500/30 text-red-400/60', activeColor: 'bg-red-900/30 border-red-500/60 text-red-400' },
  { value: 'high', label: 'HIGH', color: 'border-amber-500/30 text-amber-400/60', activeColor: 'bg-amber-900/30 border-amber-500/60 text-amber-400' },
  { value: 'medium', label: 'MEDIUM', color: 'border-sky-500/30 text-sky-400/60', activeColor: 'bg-sky-900/30 border-sky-500/60 text-sky-400' },
  { value: 'low', label: 'LOW', color: 'border-emerald-500/30 text-emerald-400/60', activeColor: 'bg-emerald-900/30 border-emerald-500/60 text-emerald-400' },
];

const categoryOptions: { value: AlertCategory; label: string }[] = [
  { value: 'regulation', label: '規制' },
  { value: 'designated_substance', label: '指定薬物' },
  { value: 'threshold', label: '閾値' },
  { value: 'enforcement', label: '執行' },
  { value: 'market', label: '市場' },
];

export function AlertFilterBar({ filters, onFilterChange, onReset }: AlertFilterBarProps) {
  const hasActiveFilters = !!(filters.severity || filters.category);

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
      {/* Severity chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        {severityOptions.map((opt) => {
          const isActive = filters.severity === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() =>
                onFilterChange({ severity: isActive ? undefined : opt.value })
              }
              className={`
                px-2.5 py-0.5 rounded-full border text-[11px] font-mono
                tracking-wide uppercase transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
                ${isActive ? opt.activeColor : opt.color}
                ${!isActive ? 'hover:opacity-80' : ''}
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border shrink-0" />

      {/* Category chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        {categoryOptions.map((opt) => {
          const isActive = filters.category === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() =>
                onFilterChange({ category: isActive ? undefined : opt.value })
              }
              className={`
                px-2.5 py-0.5 rounded-full border text-[11px] font-mono
                tracking-wide transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
                ${
                  isActive
                    ? 'bg-accent/20 border-accent/40 text-accent-300'
                    : 'border-border text-text-muted hover:border-border-hover hover:text-text-secondary'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <>
          <div className="w-px h-4 bg-border shrink-0" />
          <button
            onClick={onReset}
            className="
              px-2.5 py-0.5 rounded-full border border-border
              text-[11px] font-mono text-text-muted
              hover:border-border-hover hover:text-text-secondary
              transition-colors duration-150 shrink-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
            "
          >
            リセット
          </button>
        </>
      )}
    </div>
  );
}
