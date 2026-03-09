"use client";

const CATEGORIES = [
  { label: "ケタミン治療", pct: 38, color: "#0ea5e9" },
  { label: "シロシビン臨床試験", pct: 26, color: "#a855f7" },
  { label: "MDMA支援療法", pct: 18, color: "#ec4899" },
  { label: "マイクロドーシング", pct: 12, color: "#f59e0b" },
  { label: "その他研究", pct: 6, color: "#6b7280" },
];

export function MarketCategoryChart() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">市場カテゴリ分布</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-4">治療・研究市場のシェア</p>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((c) => (
          <div key={c.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-300">{c.label}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: c.color }}>{c.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
