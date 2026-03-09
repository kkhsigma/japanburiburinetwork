"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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

// Pixel-grid continent map: each entry is [row, colStart, colEnd]
// Grid: 100 cols × 50 rows on 1000×500 viewBox (stride=10, rect=8)
type Run = [number, number, number];

const LAND_RUNS: Run[] = [
  // ── Greenland ──
  [3, 39, 42], [4, 39, 43], [5, 40, 43], [6, 40, 42],

  // ── North America ──
  // Alaska
  [5, 3, 6], [6, 3, 7], [7, 4, 6],
  // Canada
  [5, 14, 16], [5, 19, 25],
  [6, 13, 16], [6, 18, 27],
  [7, 13, 28],
  [8, 14, 28],
  [9, 15, 27],
  [10, 15, 27],
  // USA
  [11, 16, 27],
  [12, 16, 27],
  [13, 17, 27],
  [14, 17, 26],
  [15, 18, 26],
  [16, 19, 25],
  // Mexico & Central America
  [17, 19, 24],
  [18, 20, 23],
  [19, 20, 23],
  [20, 20, 22],
  [21, 21, 22],

  // ── Caribbean ──
  [18, 26, 27], [19, 27, 28], [19, 29, 29],

  // ── South America ──
  [22, 27, 31],
  [23, 26, 33],
  [24, 26, 35],
  [25, 27, 36],
  [26, 27, 36],
  [27, 28, 36],
  [28, 28, 36],
  [29, 29, 36],
  [30, 29, 35],
  [31, 30, 35],
  [32, 30, 35],
  [33, 30, 34],
  [34, 31, 34],
  [35, 31, 33],
  [36, 31, 33],
  [37, 32, 33],
  [38, 32, 33],

  // ── Europe ──
  // Scandinavia / Iceland
  [3, 46, 47],
  [4, 48, 50], [4, 53, 55],
  [5, 47, 50], [5, 53, 56],
  [6, 47, 51], [6, 53, 56],
  // British Isles
  [7, 48, 49],
  [8, 48, 49],
  // Mainland
  [7, 51, 56],
  [8, 50, 57],
  [9, 49, 56],
  [10, 49, 56],
  [11, 49, 55],
  [12, 49, 54],
  [13, 49, 53],
  [14, 49, 53],
  [15, 49, 51],

  // ── Africa ──
  [16, 48, 56],
  [17, 47, 57],
  [18, 47, 58],
  [19, 47, 59],
  [20, 47, 59],
  [21, 47, 59],
  [22, 48, 59],
  [23, 48, 59],
  [24, 49, 59],
  [25, 49, 58],
  [26, 50, 58],
  [27, 50, 58],
  [28, 51, 57],
  [29, 51, 57],
  [30, 52, 57],
  [31, 53, 57],
  [32, 53, 57],
  [33, 54, 56],
  [34, 54, 56],

  // ── Middle East ──
  [14, 55, 60],
  [15, 55, 62],
  [16, 57, 63],
  [17, 58, 63],

  // ── Asia (mainland) ──
  [3, 58, 62], [3, 68, 72],
  [4, 57, 64], [4, 66, 75],
  [5, 57, 76], [5, 78, 80],
  [6, 57, 81],
  [7, 57, 82],
  [8, 58, 84],
  [9, 58, 86],
  [10, 59, 87],
  [11, 60, 87],
  [12, 60, 86],
  [13, 61, 85],
  [14, 62, 84],
  [15, 63, 82],
  [16, 64, 81],
  [17, 66, 80],
  [18, 68, 80],
  [19, 70, 79],
  [20, 72, 79],
  [21, 74, 79],
  // Japan
  [13, 87, 88],
  [14, 87, 89],
  [15, 87, 88],
  // SE Asia & Indonesian archipelago
  [22, 76, 79], [22, 82, 84],
  [23, 77, 78], [23, 82, 86],
  [24, 83, 87],

  // ── Australia ──
  [29, 83, 91],
  [30, 82, 92],
  [31, 82, 93],
  [32, 83, 93],
  [33, 83, 92],
  [34, 84, 92],
  [35, 85, 91],
  [36, 86, 90],
  [37, 87, 89],

  // ── New Zealand ──
  [36, 93, 94],
  [37, 93, 94],
  [38, 93, 93],
];

const CELL = 10;
const RECT_SIZE = 8;

function LandGrid() {
  return (
    <g>
      {LAND_RUNS.map(([row, c0, c1], i) => (
        <rect
          key={i}
          x={c0 * CELL + 1}
          y={row * CELL + 1}
          width={(c1 - c0 + 1) * CELL - 2}
          height={RECT_SIZE}
          rx={1}
          fill="rgba(255,255,255,0.035)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      ))}
    </g>
  );
}

function Graticule() {
  const lines = [];
  for (let lat = -60; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * 500;
    lines.push(<line key={`lat-${lat}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />);
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 1000;
    lines.push(<line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />);
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

const DEFAULT_VB = { x: 0, y: 0, w: 1000, h: 500 };
const MIN_ZOOM = 0.5; // viewBox can be half the default (2x zoom in)
const MAX_ZOOM = 1;   // 1 = default (no zoom)

export function WorldMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Substance>("CBD");
  const [vb, setVb] = useState(DEFAULT_VB);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; vbStart: typeof DEFAULT_VB } | null>(null);

  const zoom = vb.w / DEFAULT_VB.w; // 1 = default, 0.5 = 2x zoom

  const clampVb = useCallback((nx: number, ny: number, nw: number) => {
    const w = Math.max(DEFAULT_VB.w * MIN_ZOOM, Math.min(DEFAULT_VB.w * MAX_ZOOM, nw));
    const h = w / 2;
    const x = Math.max(0, Math.min(DEFAULT_VB.w - w, nx));
    const y = Math.max(0, Math.min(DEFAULT_VB.h - h, ny));
    return { x, y, w, h };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Mouse position as fraction of SVG element
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    setVb((prev) => {
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const nw = prev.w * factor;
      const nh = nw / 2;
      // Zoom toward mouse position
      const nx = prev.x + (prev.w - nw) * mx;
      const ny = prev.y + (prev.h - nh) * my;
      return clampVb(nx, ny, nw);
    });
  }, [clampVb]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (zoom >= MAX_ZOOM) return; // no pan when fully zoomed out
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, vbStart: { ...vb } };
  }, [vb, zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag?.active) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * drag.vbStart.w;
    const dy = ((e.clientY - drag.startY) / rect.height) * drag.vbStart.h;
    setVb(clampVb(drag.vbStart.x - dx, drag.vbStart.y - dy, drag.vbStart.w));
  }, [clampVb]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setVb((prev) => {
      const nw = prev.w * factor;
      const nh = nw / 2;
      const nx = prev.x + (prev.w - nw) / 2;
      const ny = prev.y + (prev.h - nh) / 2;
      return clampVb(nx, ny, nw);
    });
  }, [clampVb]);

  const resetZoom = useCallback(() => setVb(DEFAULT_VB), []);

  const hoveredCountry = COUNTRIES.find((c) => c.code === hovered);

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
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden relative"
        >
          <div className="relative w-full" style={{ paddingBottom: "50%" }}>
            <svg
              ref={svgRef}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
              className="absolute inset-0 w-full h-full"
              style={{
                background: "linear-gradient(180deg, #020810 0%, #041018 50%, #020810 100%)",
                cursor: zoom < MAX_ZOOM ? "grab" : "default",
                touchAction: "none",
              }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <Graticule />
              <LandGrid />

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

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <button
              onClick={() => zoomBy(0.75)}
              disabled={zoom <= MIN_ZOOM}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-[#020810]/80 backdrop-blur-sm text-gray-400 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => zoomBy(1.33)}
              disabled={zoom >= MAX_ZOOM}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-[#020810]/80 backdrop-blur-sm text-gray-400 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={resetZoom}
              disabled={zoom >= MAX_ZOOM}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-[#020810]/80 backdrop-blur-sm text-gray-400 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Zoom indicator */}
          {zoom < MAX_ZOOM && (
            <div className="absolute bottom-3 right-3 text-[9px] font-mono text-gray-500 bg-[#020810]/80 backdrop-blur-sm px-2 py-1 rounded-md border border-white/[0.06]">
              {Math.round((1 / zoom) * 100)}%
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
