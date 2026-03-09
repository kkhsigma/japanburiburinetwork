"use client";

const EVENTS = [
  { year: "2026", month: "Mar", title: "Use crime penalties enacted", category: "enforcement", color: "#ef4444" },
  { year: "2026", month: "Mar", title: "HHCH, THCB designated as narcotics", category: "designation", color: "#f59e0b" },
  { year: "2025", month: "Dec", title: "Cannabis Control Act amendment enforced", category: "regulation", color: "#14b8a6" },
  { year: "2025", month: "Jun", title: "THC residual limit set at 0.001%", category: "threshold", color: "#06b6d4" },
  { year: "2024", month: "Dec", title: "HHC, HHCP designated substances", category: "designation", color: "#f59e0b" },
  { year: "2024", month: "Jun", title: "CBD import manual updated by NCD", category: "regulation", color: "#14b8a6" },
  { year: "2023", month: "Dec", title: "Cannabis Control Act amendment passed Diet", category: "regulation", color: "#14b8a6" },
];

export function JapanPolicyTimeline() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">Japan Regulation Timeline</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-4">Key policy milestones</p>

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
        <div className="flex flex-col gap-3">
          {EVENTS.map((e, i) => (
            <div key={i} className="flex items-start gap-3 relative">
              <div
                className="w-[15px] h-[15px] rounded-full flex-shrink-0 mt-0.5 border-2"
                style={{ borderColor: e.color, backgroundColor: `${e.color}20` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-gray-500">{e.year} {e.month}</span>
                  <span
                    className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ color: e.color, backgroundColor: `${e.color}15` }}
                  >
                    {e.category}
                  </span>
                </div>
                <p className="text-[12px] text-gray-300 leading-snug">{e.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
