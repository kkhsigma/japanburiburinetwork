"use client";

const CATEGORIES = [
  { label: "CBD Products", value: 42, color: "#22c55e" },
  { label: "Medical Cannabis", value: 28, color: "#14b8a6" },
  { label: "Synthetic Cannabinoids", value: 15, color: "#a855f7" },
  { label: "Hemp Materials", value: 10, color: "#06b6d4" },
  { label: "Research Chemicals", value: 5, color: "#f59e0b" },
];

export function MarketCategoryChart() {
  const max = Math.max(...CATEGORIES.map((c) => c.value));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">Market Category Breakdown</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-5">Japan market share by category (%)</p>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">{cat.label}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: cat.color }}>
                {cat.value}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(cat.value / max) * 100}%`,
                  backgroundColor: cat.color,
                  boxShadow: `0 0 8px ${cat.color}30`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
