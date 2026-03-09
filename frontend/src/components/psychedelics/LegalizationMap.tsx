"use client";

const REGIONS = [
  { name: "オーストラリア", status: "医療承認", color: "#22c55e" },
  { name: "アメリカ（一部州）", status: "非犯罪化", color: "#f59e0b" },
  { name: "カナダ", status: "特別アクセス", color: "#14b8a6" },
  { name: "日本", status: "違法", color: "#ef4444" },
  { name: "ブラジル", status: "アヤワスカ合法", color: "#22c55e" },
  { name: "オランダ", status: "トリュフ合法", color: "#22c55e" },
  { name: "ジャマイカ", status: "シロシビン合法", color: "#22c55e" },
  { name: "ポルトガル", status: "非犯罪化", color: "#f59e0b" },
  { name: "スイス", status: "研究許可", color: "#14b8a6" },
  { name: "韓国", status: "違法", color: "#ef4444" },
];

export function LegalizationMap() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">各国の規制状況</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-4">主要10カ国</p>

      <div className="grid grid-cols-2 gap-2">
        {REGIONS.map((r) => (
          <div key={r.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-gray-300 block truncate">{r.name}</span>
            </div>
            <span className="text-[9px] font-mono font-medium" style={{ color: r.color }}>{r.status}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
        {[
          { label: "合法/承認", color: "#22c55e" },
          { label: "特別アクセス", color: "#14b8a6" },
          { label: "非犯罪化", color: "#f59e0b" },
          { label: "違法", color: "#ef4444" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] font-mono text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
