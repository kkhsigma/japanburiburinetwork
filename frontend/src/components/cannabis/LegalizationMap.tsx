"use client";


const REGIONS = [
  { name: "Canada", status: "Legal", color: "#22c55e" },
  { name: "USA", status: "Mixed", color: "#f59e0b" },
  { name: "Japan", status: "Illegal", color: "#ef4444" },
  { name: "Germany", status: "Medical", color: "#14b8a6" },
  { name: "Thailand", status: "Restricted", color: "#f97316" },
  { name: "Netherlands", status: "Tolerated", color: "#22d3ee" },
  { name: "Uruguay", status: "Legal", color: "#22c55e" },
  { name: "Australia", status: "Medical", color: "#14b8a6" },
  { name: "UK", status: "Medical", color: "#14b8a6" },
  { name: "South Korea", status: "Illegal", color: "#ef4444" },
];

export function LegalizationMap() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">Global Legalization Status</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-4">10 key jurisdictions</p>

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
          { label: "Legal", color: "#22c55e" },
          { label: "Medical", color: "#14b8a6" },
          { label: "Mixed", color: "#f59e0b" },
          { label: "Illegal", color: "#ef4444" },
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
