"use client";

const EVENTS = [
  { year: "1951", title: "覚醒剤取締法制定", category: "法律", color: "#ef4444" },
  { year: "1953", title: "麻薬取締法改正（LSD追加）", category: "規制", color: "#f97316" },
  { year: "1990", title: "MDMA規制開始", category: "規制", color: "#f59e0b" },
  { year: "2007", title: "サルビア・マジックマッシュルーム指定薬物化", category: "指定", color: "#a855f7" },
  { year: "2019", title: "エスケタミン国内承認検討開始", category: "医療", color: "#0ea5e9" },
  { year: "2024", title: "サイケデリクス治療国際動向調査", category: "研究", color: "#14b8a6" },
  { year: "2026", title: "厚労省WG設置・慎重検討開始", category: "政策", color: "#22c55e" },
];

export function JapanPolicyTimeline() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full">
      <h3 className="text-sm font-bold text-white mb-1">日本の政策タイムライン</h3>
      <p className="text-[10px] font-mono text-gray-500 mb-4">主要な規制変更</p>

      <div className="flex flex-col gap-3">
        {EVENTS.map((e) => (
          <div key={e.year} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: e.color }} />
              <div className="w-px h-full bg-white/[0.06]" />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-gray-300">{e.year}</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: e.color, backgroundColor: `${e.color}15` }}>
                  {e.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{e.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
