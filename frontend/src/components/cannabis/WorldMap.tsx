"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Status = "legal" | "medical" | "decriminalized" | "restricted" | "illegal";

type Substance = "CBD" | "THC" | "CBN" | "CBG" | "HHC" | "THCP" | "Delta-8 THC";

const SUBSTANCES: { id: Substance; label: string; color: string }[] = [
  { id: "CBD",         label: "CBD",         color: "#22c55e" },
  { id: "THC",         label: "THC",         color: "#ef4444" },
  { id: "CBN",         label: "CBN",         color: "#f59e0b" },
  { id: "CBG",         label: "CBG",         color: "#14b8a6" },
  { id: "HHC",         label: "HHC",         color: "#a855f7" },
  { id: "THCP",        label: "THCP",        color: "#dc2626" },
  { id: "Delta-8 THC", label: "Δ8-THC",      color: "#f97316" },
];

const STATUS_CONFIG: Record<Status, { color: string; labelJa: string }> = {
  legal:          { color: "#22c55e", labelJa: "合法" },
  medical:        { color: "#14b8a6", labelJa: "医療用のみ" },
  decriminalized: { color: "#f59e0b", labelJa: "非犯罪化" },
  restricted:     { color: "#f97316", labelJa: "制限付き" },
  illegal:        { color: "#ef4444", labelJa: "違法" },
};

interface CountryData {
  nameJa: string;
  code: string;
  x: number;
  y: number;
  substances: Record<Substance, { status: Status; note: string }>;
}

const COUNTRIES: CountryData[] = [
  {
    nameJa: "カナダ", code: "CA", x: 206, y: 105,
    substances: {
      "CBD":         { status: "legal",          note: "完全合法。規制なし" },
      "THC":         { status: "legal",          note: "2018年より娯楽・医療用ともに合法" },
      "CBN":         { status: "legal",          note: "規制なし。合法" },
      "CBG":         { status: "legal",          note: "規制なし。合法" },
      "HHC":         { status: "legal",          note: "合成カンナビノイドとして合法" },
      "THCP":        { status: "restricted",     note: "新規物質として審査中" },
      "Delta-8 THC": { status: "legal",          note: "THCと同様に合法" },
    },
  },
  {
    nameJa: "アメリカ", code: "US", x: 228, y: 148,
    substances: {
      "CBD":         { status: "legal",          note: "ヘンプ由来CBD（THC<0.3%）は連邦法で合法" },
      "THC":         { status: "decriminalized", note: "州ごとに異なる。連邦法ではスケジュールI" },
      "CBN":         { status: "legal",          note: "ヘンプ由来は合法。州により異なる" },
      "CBG":         { status: "legal",          note: "ヘンプ由来は連邦法で合法" },
      "HHC":         { status: "decriminalized", note: "法的グレーゾーン。州により異なる" },
      "THCP":        { status: "restricted",     note: "連邦法で未分類。一部州で規制" },
      "Delta-8 THC": { status: "decriminalized", note: "連邦法では曖昧。多くの州で規制" },
    },
  },
  {
    nameJa: "メキシコ", code: "MX", x: 212, y: 192,
    substances: {
      "CBD":         { status: "legal",          note: "THC<1%のCBD製品は合法" },
      "THC":         { status: "decriminalized", note: "最高裁判決により非犯罪化" },
      "CBN":         { status: "decriminalized", note: "明確な規制なし" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "合成カンナビノイドは禁止" },
      "THCP":        { status: "illegal",        note: "規制薬物に該当" },
      "Delta-8 THC": { status: "illegal",        note: "THC類似体として禁止" },
    },
  },
  {
    nameJa: "ウルグアイ", code: "UY", x: 342, y: 340,
    substances: {
      "CBD":         { status: "legal",          note: "完全合法" },
      "THC":         { status: "legal",          note: "世界初の完全合法化国" },
      "CBN":         { status: "legal",          note: "規制なし" },
      "CBG":         { status: "legal",          note: "規制なし" },
      "HHC":         { status: "legal",          note: "規制対象外" },
      "THCP":        { status: "restricted",     note: "未分類。審査中" },
      "Delta-8 THC": { status: "legal",          note: "THCと同様に合法" },
    },
  },
  {
    nameJa: "ブラジル", code: "BR", x: 350, y: 295,
    substances: {
      "CBD":         { status: "medical",        note: "医療用輸入が許可。処方箋必要" },
      "THC":         { status: "illegal",        note: "違法。医療用輸入のみ限定的に許可" },
      "CBN":         { status: "illegal",        note: "規制薬物に該当" },
      "CBG":         { status: "restricted",     note: "医療用のみ限定的に許可" },
      "HHC":         { status: "illegal",        note: "合成カンナビノイドは禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "THC類似体として禁止" },
    },
  },
  {
    nameJa: "ドイツ", code: "DE", x: 525, y: 112,
    substances: {
      "CBD":         { status: "legal",          note: "EU規制に基づき合法" },
      "THC":         { status: "legal",          note: "2024年4月に合法化" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "restricted",     note: "新精神活性物質法により制限" },
      "THCP":        { status: "illegal",        note: "新精神活性物質法により禁止" },
      "Delta-8 THC": { status: "restricted",     note: "法的地位が不明確" },
    },
  },
  {
    nameJa: "オランダ", code: "NL", x: 512, y: 112,
    substances: {
      "CBD":         { status: "legal",          note: "EU基準で合法" },
      "THC":         { status: "decriminalized", note: "コーヒーショップ容認政策" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "2023年に禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "THC類似体として禁止" },
    },
  },
  {
    nameJa: "イギリス", code: "GB", x: 496, y: 105,
    substances: {
      "CBD":         { status: "legal",          note: "THC<0.2%のCBD製品は合法" },
      "THC":         { status: "medical",        note: "2018年より医療用のみ許可" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "精神活性物質法により禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "規制薬物に該当" },
    },
  },
  {
    nameJa: "フランス", code: "FR", x: 506, y: 128,
    substances: {
      "CBD":         { status: "legal",          note: "THC<0.3%のCBD製品は合法" },
      "THC":         { status: "illegal",        note: "厳格に違法。医療試験中" },
      "CBN":         { status: "restricted",     note: "法的地位が不明確" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "2023年に禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "THC類似体として禁止" },
    },
  },
  {
    nameJa: "イタリア", code: "IT", x: 530, y: 138,
    substances: {
      "CBD":         { status: "legal",          note: "THC<0.2%で合法" },
      "THC":         { status: "medical",        note: "医療用大麻が利用可能" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "スイス", code: "CH", x: 520, y: 125,
    substances: {
      "CBD":         { status: "legal",          note: "THC<1%のCBD製品は合法" },
      "THC":         { status: "medical",        note: "医療用許可。パイロット実施中" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "restricted",     note: "審査中" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "restricted",     note: "法的地位が不明確" },
    },
  },
  {
    nameJa: "イスラエル", code: "IL", x: 597, y: 170,
    substances: {
      "CBD":         { status: "legal",          note: "合法。広く販売" },
      "THC":         { status: "medical",        note: "先進的な医療用プログラム" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "タイ", code: "TH", x: 778, y: 212,
    substances: {
      "CBD":         { status: "legal",          note: "合法。広く流通" },
      "THC":         { status: "restricted",     note: "2022年合法化後、再規制の動き" },
      "CBN":         { status: "restricted",     note: "規制状況が流動的" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "韓国", code: "KR", x: 852, y: 148,
    substances: {
      "CBD":         { status: "medical",        note: "医療用のみ。処方箋必要" },
      "THC":         { status: "illegal",        note: "厳格に禁止" },
      "CBN":         { status: "illegal",        note: "禁止" },
      "CBG":         { status: "restricted",     note: "法的地位が不明確" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "日本", code: "JP", x: 878, y: 148,
    substances: {
      "CBD":         { status: "legal",          note: "茎・種子由来で合法。輸入届出が必要" },
      "THC":         { status: "illegal",        note: "大麻取締法により禁止。使用罪新設" },
      "CBN":         { status: "restricted",     note: "グレーゾーン。規制強化の可能性" },
      "CBG":         { status: "legal",          note: "THCを含まなければ規制対象外" },
      "HHC":         { status: "illegal",        note: "2023年に指定薬物に追加" },
      "THCP":        { status: "illegal",        note: "指定薬物として禁止" },
      "Delta-8 THC": { status: "illegal",        note: "大麻取締法の規制対象" },
    },
  },
  {
    nameJa: "中国", code: "CN", x: 795, y: 155,
    substances: {
      "CBD":         { status: "restricted",     note: "雲南省での産業用栽培のみ。国内販売は制限" },
      "THC":         { status: "illegal",        note: "厳格に禁止" },
      "CBN":         { status: "illegal",        note: "禁止" },
      "CBG":         { status: "restricted",     note: "産業用のみ限定的に許可" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "フィリピン", code: "PH", x: 835, y: 215,
    substances: {
      "CBD":         { status: "illegal",        note: "全面的に禁止" },
      "THC":         { status: "illegal",        note: "厳格に禁止。重罰" },
      "CBN":         { status: "illegal",        note: "禁止" },
      "CBG":         { status: "illegal",        note: "禁止" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "オーストラリア", code: "AU", x: 870, y: 330,
    substances: {
      "CBD":         { status: "medical",        note: "2021年より薬局で処方箋なし購入可能" },
      "THC":         { status: "medical",        note: "医療用許可。ACTでは個人使用合法" },
      "CBN":         { status: "medical",        note: "医療用のみ" },
      "CBG":         { status: "medical",        note: "医療用のみ" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
  {
    nameJa: "南アフリカ", code: "ZA", x: 570, y: 340,
    substances: {
      "CBD":         { status: "legal",          note: "THC<0.001%で合法" },
      "THC":         { status: "legal",          note: "2018年より私的使用が合法" },
      "CBN":         { status: "legal",          note: "規制対象外" },
      "CBG":         { status: "legal",          note: "規制対象外" },
      "HHC":         { status: "restricted",     note: "未分類" },
      "THCP":        { status: "restricted",     note: "未分類" },
      "Delta-8 THC": { status: "restricted",     note: "法的地位が不明確" },
    },
  },
  {
    nameJa: "インド", code: "IN", x: 714, y: 200,
    substances: {
      "CBD":         { status: "legal",          note: "ヘンプ由来CBDは合法" },
      "THC":         { status: "restricted",     note: "バングは合法。大麻は州により異なる" },
      "CBN":         { status: "restricted",     note: "法的地位が不明確" },
      "CBG":         { status: "legal",          note: "ヘンプ由来は合法" },
      "HHC":         { status: "illegal",        note: "禁止" },
      "THCP":        { status: "illegal",        note: "禁止" },
      "Delta-8 THC": { status: "illegal",        note: "禁止" },
    },
  },
];

const CONTINENTS = [
  "M 130,48 L 165,38 195,52 210,45 245,48 262,58 270,72 265,88 275,98 268,108 255,118 248,128 252,148 245,162 238,172 232,182 218,188 206,198 198,208 186,212 178,208 172,192 162,172 148,158 142,148 128,128 118,108 112,88 118,68 130,48",
  "M 270,228 L 292,218 308,228 322,235 338,242 348,258 358,278 362,298 355,318 348,338 340,352 328,368 318,378 305,385 292,372 288,358 282,338 272,318 268,298 262,268 265,248 270,228",
  "M 472,48 L 488,42 505,48 525,52 548,55 565,62 572,72 568,82 558,92 555,98 548,108 535,112 528,118 535,128 528,138 518,142 508,148 498,148 488,142 478,138 472,128 468,112 465,98 462,82 465,68 468,58 472,48",
  "M 468,162 L 488,155 508,158 528,162 548,165 568,168 582,178 592,198 595,218 592,238 588,258 582,278 575,298 568,318 558,338 545,348 532,352 518,348 505,338 498,328 492,308 488,288 478,268 472,248 465,228 462,208 458,188 462,172 468,162",
  "M 572,42 L 598,38 625,42 658,48 692,52 725,58 758,55 788,52 815,58 842,62 868,55 885,62 892,72 888,82 878,98 872,108 882,118 892,128 888,138 878,148 865,155 848,158 832,162 815,168 798,172 778,178 758,185 738,192 718,198 698,205 678,198 658,188 642,178 628,168 615,158 605,148 595,138 585,125 578,108 575,92 572,72 572,42",
  "M 828,298 L 852,292 878,295 902,302 918,312 925,328 922,345 912,358 898,365 878,368 858,362 842,352 832,338 828,322 825,308 828,298",
];

function Graticule() {
  const lines = [];
  for (let lat = -60; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * 500;
    lines.push(<line key={`lat-${lat}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 1000;
    lines.push(<line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
  }
  return <g>{lines}</g>;
}

function CountryMarker({
  country,
  status,
  isHovered,
  onHover,
  onLeave,
}: {
  country: CountryData;
  status: Status;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const r = isHovered ? 7 : 4.5;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <circle cx={country.x} cy={country.y} r={r + 4} fill="none" stroke={cfg.color} strokeWidth="0.5" opacity={isHovered ? 0.6 : 0} />

      <circle cx={country.x} cy={country.y} r={r} fill="none" stroke={cfg.color} strokeWidth="0.8" opacity="0.3">
        <animate attributeName="r" from={String(r)} to={String(r + 8)} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
      </circle>

      <circle cx={country.x} cy={country.y} r={r} fill={cfg.color} opacity={isHovered ? 1 : 0.85} />
      <circle cx={country.x} cy={country.y - r * 0.25} r={r * 0.35} fill="rgba(255,255,255,0.3)" />
    </g>
  );
}

function Tooltip({ country, substance }: { country: CountryData; substance: Substance }) {
  const info = country.substances[substance];
  const cfg = STATUS_CONFIG[info.status];
  const tooltipW = 230;
  const tooltipH = 62;
  const flipX = country.x > 800;
  const flipY = country.y < 80;
  const tx = flipX ? country.x - tooltipW - 12 : country.x + 12;
  const ty = flipY ? country.y + 12 : country.y - tooltipH - 8;

  return (
    <foreignObject x={tx} y={ty} width={tooltipW} height={tooltipH + 10}>
      <div
        style={{
          background: "rgba(2,8,16,0.95)",
          border: `1px solid ${cfg.color}30`,
          borderRadius: "8px",
          padding: "8px 10px",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
          <span style={{ color: "#e5e7eb", fontSize: "12px", fontWeight: 600 }}>{country.nameJa}</span>
          <span style={{ color: "#6b7280", fontSize: "10px", fontFamily: "monospace" }}>{substance}</span>
          <span
            style={{
              fontSize: "9px", fontFamily: "monospace", fontWeight: 600,
              color: cfg.color, background: `${cfg.color}18`,
              padding: "1px 5px", borderRadius: "4px", marginLeft: "auto",
            }}
          >
            {cfg.labelJa}
          </span>
        </div>
        <p style={{ color: "#9ca3af", fontSize: "10px", margin: 0, lineHeight: 1.4 }}>
          {info.note}
        </p>
      </div>
    </foreignObject>
  );
}

export function WorldMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Substance>("CBD");

  const hoveredCountry = COUNTRIES.find((c) => c.code === hovered);

  // Count statuses for the selected substance
  const statusCounts: Record<Status, number> = { legal: 0, medical: 0, decriminalized: 0, restricted: 0, illegal: 0 };
  for (const c of COUNTRIES) {
    statusCounts[c.substances[selected].status]++;
  }

  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60 mb-2">
            グローバル概況
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            世界カンナビノイド規制マップ
          </h2>
          <p className="text-[12px] text-gray-500 mt-2">
            物質を選択して{COUNTRIES.length}カ国の規制状況を比較 — ホバーで詳細表示
          </p>
        </motion.div>

        {/* Substance filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUBSTANCES.map((s) => {
            const isActive = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 border"
                style={{
                  color: isActive ? "#fff" : s.color,
                  backgroundColor: isActive ? `${s.color}20` : "transparent",
                  borderColor: isActive ? `${s.color}40` : "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color, boxShadow: isActive ? `0 0 8px ${s.color}60` : "none" }}
                />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Status legend with counts */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-6">
          {(Object.entries(STATUS_CONFIG) as [Status, { color: string; labelJa: string }][]).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-[10px] font-mono text-gray-400">{cfg.labelJa}</span>
              <span className="text-[9px] font-mono text-gray-600">({statusCounts[status]})</span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="relative w-full" style={{ paddingBottom: "50%" }}>
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full"
              style={{ background: "linear-gradient(180deg, #020810 0%, #041018 50%, #020810 100%)" }}
            >
              <Graticule />

              {CONTINENTS.map((d, i) => (
                <path key={i} d={d} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeLinejoin="round" />
              ))}

              {COUNTRIES.map((c) => {
                const status = c.substances[selected].status;
                return (
                  <line
                    key={`line-${c.code}`}
                    x1={c.x} y1={c.y} x2={c.x} y2={250}
                    stroke={STATUS_CONFIG[status].color}
                    strokeWidth="0.3" opacity="0.12"
                  />
                );
              })}

              {COUNTRIES.map((c) => {
                const status = c.substances[selected].status;
                return (
                  <CountryMarker
                    key={c.code}
                    country={c}
                    status={status}
                    isHovered={hovered === c.code}
                    onHover={() => setHovered(c.code)}
                    onLeave={() => setHovered(null)}
                  />
                );
              })}

              {hoveredCountry && <Tooltip country={hoveredCountry} substance={selected} />}
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
