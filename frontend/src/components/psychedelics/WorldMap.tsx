"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Status = "legal" | "medical" | "decriminalized" | "restricted" | "illegal";

type Substance =
  | "Psilocybin"
  | "LSD"
  | "MDMA"
  | "DMT"
  | "Ketamine"
  | "Mescaline";

const SUBSTANCES: { id: Substance; label: string; color: string }[] = [
  { id: "Psilocybin", label: "シロシビン",   color: "#a855f7" },
  { id: "LSD",        label: "LSD",          color: "#ef4444" },
  { id: "MDMA",       label: "MDMA",         color: "#ec4899" },
  { id: "DMT",        label: "DMT",          color: "#f97316" },
  { id: "Ketamine",   label: "ケタミン",     color: "#0ea5e9" },
  { id: "Mescaline",  label: "メスカリン",   color: "#f59e0b" },
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
      Psilocybin: { status: "medical",        note: "末期患者への医療用免除制度あり。臨床研究拡大中" },
      LSD:        { status: "illegal",         note: "規制薬物法スケジュールIIIに分類。違法" },
      MDMA:       { status: "restricted",      note: "臨床試験で使用許可。PTSD治療研究進行中" },
      DMT:        { status: "illegal",         note: "規制薬物法により禁止。宗教的免除は限定的" },
      Ketamine:   { status: "medical",         note: "医療用麻酔薬として承認済み。適応外処方あり" },
      Mescaline:  { status: "illegal",         note: "規制薬物法により禁止。先住民族の使用は議論中" },
    },
  },
  {
    nameJa: "アメリカ", code: "US", x: 228, y: 148,
    substances: {
      Psilocybin: { status: "decriminalized",  note: "オレゴン州で合法化。コロラド州で非犯罪化。連邦法では違法" },
      LSD:        { status: "illegal",          note: "連邦法スケジュールIに分類。一部都市で非犯罪化" },
      MDMA:       { status: "restricted",       note: "FDA画期的治療薬指定。PTSD臨床試験第III相完了" },
      DMT:        { status: "illegal",          note: "連邦法スケジュールIに分類。アヤワスカ教会に宗教的免除" },
      Ketamine:   { status: "medical",          note: "FDA承認麻酔薬。エスケタミン点鼻薬がうつ病治療に承認" },
      Mescaline:  { status: "restricted",       note: "ネイティブ・アメリカン教会でのペヨーテ使用は合法。それ以外は違法" },
    },
  },
  {
    nameJa: "メキシコ", code: "MX", x: 212, y: 192,
    substances: {
      Psilocybin: { status: "decriminalized",  note: "先住民族の伝統的使用は容認。マサテック族の儀式で使用" },
      LSD:        { status: "illegal",          note: "連邦健康法により禁止" },
      MDMA:       { status: "illegal",          note: "規制薬物として禁止" },
      DMT:        { status: "restricted",       note: "アヤワスカ儀式は先住民族文化として一部容認" },
      Ketamine:   { status: "medical",          note: "医療用麻酔薬として使用可能。処方箋必要" },
      Mescaline:  { status: "legal",            note: "ペヨーテはウイチョル族の宗教的伝統として保護" },
    },
  },
  {
    nameJa: "ブラジル", code: "BR", x: 350, y: 295,
    substances: {
      Psilocybin: { status: "illegal",          note: "規制薬物リストに記載。違法" },
      LSD:        { status: "illegal",          note: "厳格に禁止" },
      MDMA:       { status: "illegal",          note: "禁止薬物に指定" },
      DMT:        { status: "legal",            note: "アヤワスカは宗教的使用として合法。サントダイメ教会等" },
      Ketamine:   { status: "medical",          note: "医療用として承認済み。うつ病治療での研究あり" },
      Mescaline:  { status: "illegal",          note: "規制薬物として禁止" },
    },
  },
  {
    nameJa: "ウルグアイ", code: "UY", x: 342, y: 340,
    substances: {
      Psilocybin: { status: "illegal",          note: "規制薬物に分類。ただし個人使用は起訴されにくい" },
      LSD:        { status: "illegal",          note: "禁止。ただし少量所持の個人使用は非処罰の傾向" },
      MDMA:       { status: "illegal",          note: "禁止薬物に指定" },
      DMT:        { status: "restricted",       note: "アヤワスカ使用について法的グレーゾーン" },
      Ketamine:   { status: "medical",          note: "医療用麻酔薬として使用可能" },
      Mescaline:  { status: "illegal",          note: "規制薬物として禁止" },
    },
  },
  {
    nameJa: "ジャマイカ", code: "JM", x: 288, y: 205,
    substances: {
      Psilocybin: { status: "legal",            note: "シロシビンキノコは規制薬物リストに未記載。事実上合法" },
      LSD:        { status: "illegal",           note: "危険薬物法により禁止" },
      MDMA:       { status: "illegal",           note: "禁止薬物に指定" },
      DMT:        { status: "restricted",        note: "法的地位が不明確。明確な規制なし" },
      Ketamine:   { status: "medical",           note: "医療用として使用可能" },
      Mescaline:  { status: "restricted",        note: "法的地位が不明確" },
    },
  },
  {
    nameJa: "ポルトガル", code: "PT", x: 476, y: 145,
    substances: {
      Psilocybin: { status: "decriminalized",   note: "2001年より全薬物の個人使用を非犯罪化" },
      LSD:        { status: "decriminalized",    note: "個人使用量以下は行政処分のみ。売買は違法" },
      MDMA:       { status: "decriminalized",    note: "個人使用を非犯罪化。治療委員会に紹介される" },
      DMT:        { status: "decriminalized",    note: "個人使用を非犯罪化" },
      Ketamine:   { status: "medical",           note: "医療用として承認。個人使用も非犯罪化" },
      Mescaline:  { status: "decriminalized",    note: "個人使用を非犯罪化" },
    },
  },
  {
    nameJa: "オランダ", code: "NL", x: 512, y: 112,
    substances: {
      Psilocybin: { status: "legal",             note: "シロシビン・トリュフ（魔法トリュフ）はスマートショップで合法販売" },
      LSD:        { status: "illegal",            note: "アヘン法リストIに分類。違法" },
      MDMA:       { status: "illegal",            note: "製造・販売は違法。ただし検査サービスあり" },
      DMT:        { status: "illegal",            note: "アヘン法により禁止" },
      Ketamine:   { status: "medical",            note: "医療用麻酔薬として承認。適応外使用も増加" },
      Mescaline:  { status: "illegal",            note: "アヘン法リストIに分類。サボテン自体は合法" },
    },
  },
  {
    nameJa: "ドイツ", code: "DE", x: 525, y: 112,
    substances: {
      Psilocybin: { status: "illegal",            note: "麻薬法により禁止。ただし規制緩和の議論が進行中" },
      LSD:        { status: "illegal",             note: "麻薬法スケジュールIに分類。違法" },
      MDMA:       { status: "illegal",             note: "麻薬法により禁止。臨床研究は限定的に許可" },
      DMT:        { status: "illegal",             note: "麻薬法により禁止" },
      Ketamine:   { status: "medical",             note: "医療用麻酔薬として広く使用。処方箋で入手可能" },
      Mescaline:  { status: "illegal",             note: "麻薬法により禁止" },
    },
  },
  {
    nameJa: "イギリス", code: "GB", x: 496, y: 105,
    substances: {
      Psilocybin: { status: "illegal",            note: "薬物乱用法クラスAに分類。臨床研究は許可制" },
      LSD:        { status: "illegal",             note: "クラスA薬物。最大で終身刑の可能性" },
      MDMA:       { status: "restricted",          note: "クラスA薬物だが、PTSD治療の臨床試験進行中" },
      DMT:        { status: "illegal",             note: "クラスA薬物として禁止" },
      Ketamine:   { status: "medical",             note: "医療用として承認。クラスB薬物として規制" },
      Mescaline:  { status: "illegal",             note: "クラスA薬物として禁止" },
    },
  },
  {
    nameJa: "スイス", code: "CH", x: 520, y: 125,
    substances: {
      Psilocybin: { status: "restricted",         note: "医師による個別免除で治療使用が可能。研究拡大中" },
      LSD:        { status: "restricted",          note: "医師による個別免除制度あり。サイケデリック療法研究の先進国" },
      MDMA:       { status: "restricted",          note: "医師の個別免除で治療使用可能。MAPS研究に協力" },
      DMT:        { status: "illegal",             note: "規制薬物として禁止" },
      Ketamine:   { status: "medical",             note: "医療用として承認。うつ病治療にも使用" },
      Mescaline:  { status: "illegal",             note: "規制薬物として禁止" },
    },
  },
  {
    nameJa: "フランス", code: "FR", x: 506, y: 128,
    substances: {
      Psilocybin: { status: "illegal",             note: "麻薬として厳格に禁止。キノコの採取も違法" },
      LSD:        { status: "illegal",              note: "麻薬として禁止。重罪" },
      MDMA:       { status: "illegal",              note: "麻薬として禁止" },
      DMT:        { status: "illegal",              note: "麻薬として禁止。アヤワスカも違法" },
      Ketamine:   { status: "medical",              note: "医療用麻酔薬として承認。処方箋必要" },
      Mescaline:  { status: "illegal",              note: "麻薬として禁止。ペヨーテサボテンも規制" },
    },
  },
  {
    nameJa: "オーストラリア", code: "AU", x: 870, y: 330,
    substances: {
      Psilocybin: { status: "medical",             note: "2023年7月よりTGA承認医師による治療抵抗性うつ病への処方が合法" },
      LSD:        { status: "illegal",              note: "スケジュール9（禁止物質）に分類" },
      MDMA:       { status: "medical",              note: "2023年7月よりTGA承認医師によるPTSD治療への処方が合法" },
      DMT:        { status: "illegal",              note: "スケジュール9に分類。違法" },
      Ketamine:   { status: "medical",              note: "医療用麻酔薬として承認。うつ病治療にも使用拡大" },
      Mescaline:  { status: "illegal",              note: "スケジュール9に分類。違法" },
    },
  },
  {
    nameJa: "イスラエル", code: "IL", x: 597, y: 170,
    substances: {
      Psilocybin: { status: "restricted",          note: "臨床研究が進行中。思いやり使用プログラムの議論あり" },
      LSD:        { status: "illegal",              note: "危険薬物条例により禁止" },
      MDMA:       { status: "restricted",           note: "PTSD治療の臨床試験を積極的に実施。MAPS協力研究" },
      DMT:        { status: "illegal",              note: "危険薬物条例により禁止" },
      Ketamine:   { status: "medical",              note: "医療用として承認。精神科治療での使用研究あり" },
      Mescaline:  { status: "illegal",              note: "禁止薬物に指定" },
    },
  },
  {
    nameJa: "日本", code: "JP", x: 878, y: 148,
    substances: {
      Psilocybin: { status: "illegal",              note: "麻薬及び向精神薬取締法により厳格に禁止。所持・使用ともに処罰" },
      LSD:        { status: "illegal",               note: "麻薬取締法により禁止。厳罰" },
      MDMA:       { status: "illegal",               note: "麻薬取締法により禁止。近年取締強化" },
      DMT:        { status: "illegal",               note: "麻薬取締法により禁止" },
      Ketamine:   { status: "medical",               note: "医療用麻酔薬として承認。麻薬指定で厳格に管理" },
      Mescaline:  { status: "illegal",               note: "麻薬取締法により禁止" },
    },
  },
  {
    nameJa: "韓国", code: "KR", x: 852, y: 148,
    substances: {
      Psilocybin: { status: "illegal",               note: "麻薬類管理法により禁止。厳罰" },
      LSD:        { status: "illegal",                note: "麻薬類管理法により禁止" },
      MDMA:       { status: "illegal",                note: "麻薬類管理法により禁止。厳格な取締り" },
      DMT:        { status: "illegal",                note: "麻薬類管理法により禁止" },
      Ketamine:   { status: "medical",                note: "医療用麻酔薬として承認。向精神薬として規制" },
      Mescaline:  { status: "illegal",                note: "禁止薬物に指定" },
    },
  },
  {
    nameJa: "中国", code: "CN", x: 795, y: 155,
    substances: {
      Psilocybin: { status: "illegal",                note: "精神薬品リストIに分類。厳格に禁止" },
      LSD:        { status: "illegal",                 note: "精神薬品として厳格に禁止。重罰" },
      MDMA:       { status: "illegal",                 note: "精神薬品として禁止。製造・密売は死刑の可能性" },
      DMT:        { status: "illegal",                 note: "精神薬品として禁止" },
      Ketamine:   { status: "restricted",              note: "医療用として使用可能だが、乱用問題により厳格に規制" },
      Mescaline:  { status: "illegal",                 note: "精神薬品として禁止" },
    },
  },
  {
    nameJa: "タイ", code: "TH", x: 778, y: 212,
    substances: {
      Psilocybin: { status: "illegal",                 note: "麻薬法カテゴリー5に分類。違法" },
      LSD:        { status: "illegal",                  note: "麻薬法により厳格に禁止" },
      MDMA:       { status: "illegal",                  note: "麻薬法により禁止。厳罰" },
      DMT:        { status: "illegal",                  note: "麻薬法により禁止" },
      Ketamine:   { status: "medical",                  note: "医療用麻酔薬として承認。向精神薬として規制" },
      Mescaline:  { status: "illegal",                  note: "麻薬法により禁止" },
    },
  },
  {
    nameJa: "インド", code: "IN", x: 714, y: 200,
    substances: {
      Psilocybin: { status: "restricted",               note: "NDPS法では明確に記載なし。法的グレーゾーン" },
      LSD:        { status: "illegal",                    note: "NDPS法により禁止" },
      MDMA:       { status: "illegal",                    note: "NDPS法により禁止" },
      DMT:        { status: "restricted",                 note: "アヤワスカは法的グレーゾーン。DMT自体は規制対象" },
      Ketamine:   { status: "medical",                    note: "医療用として広く使用。必須医薬品リストに記載" },
      Mescaline:  { status: "restricted",                 note: "サボテン自体は規制なし。抽出物は法的に曖昧" },
    },
  },
  {
    nameJa: "南アフリカ", code: "ZA", x: 570, y: 340,
    substances: {
      Psilocybin: { status: "illegal",                    note: "薬物及び薬物取引法により禁止" },
      LSD:        { status: "illegal",                     note: "禁止薬物に指定" },
      MDMA:       { status: "illegal",                     note: "禁止薬物に指定" },
      DMT:        { status: "illegal",                     note: "禁止薬物に指定" },
      Ketamine:   { status: "medical",                     note: "医療用として承認。スケジュール5薬物として管理" },
      Mescaline:  { status: "restricted",                  note: "サンペドロサボテン自体は規制なし。抽出は違法" },
    },
  },
];

// Pixel-grid continent map: each entry is [row, colStart, colEnd]
// Grid: 100 cols x 50 rows on 1000x500 viewBox (stride=10, rect=8)
type Run = [number, number, number];

const LAND_RUNS: Run[] = [
  // -- Greenland --
  [3, 39, 42], [4, 39, 43], [5, 40, 43], [6, 40, 42],

  // -- North America --
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

  // -- Caribbean --
  [18, 26, 27], [19, 27, 28], [19, 29, 29],

  // -- South America --
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

  // -- Europe --
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

  // -- Africa --
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

  // -- Middle East --
  [14, 55, 60],
  [15, 55, 62],
  [16, 57, 63],
  [17, 58, 63],

  // -- Asia (mainland) --
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

  // -- Australia --
  [29, 83, 91],
  [30, 82, 92],
  [31, 82, 93],
  [32, 83, 93],
  [33, 83, 92],
  [34, 84, 92],
  [35, 85, 91],
  [36, 86, 90],
  [37, 87, 89],

  // -- New Zealand --
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
  const lines: React.ReactElement[] = [];
  for (let lat = -60; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * 500;
    lines.push(
      <line
        key={`lat-${lat}`}
        x1="0" y1={y} x2="1000" y2={y}
        stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"
      />
    );
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 1000;
    lines.push(
      <line
        key={`lon-${lon}`}
        x1={x} y1="0" x2={x} y2="500"
        stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"
      />
    );
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
      <circle
        cx={country.x} cy={country.y} r={r + 4}
        fill="none" stroke={cfg.color} strokeWidth="0.5"
        opacity={isHovered ? 0.6 : 0}
      />

      <circle
        cx={country.x} cy={country.y} r={r}
        fill="none" stroke={cfg.color} strokeWidth="0.8" opacity="0.3"
      >
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
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1;

export function WorldMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Substance>("Psilocybin");
  const [vb, setVb] = useState(DEFAULT_VB);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    vbStart: typeof DEFAULT_VB;
  } | null>(null);

  const zoom = vb.w / DEFAULT_VB.w;

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
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    setVb((prev) => {
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const nw = prev.w * factor;
      const nh = nw / 2;
      const nx = prev.x + (prev.w - nw) * mx;
      const ny = prev.y + (prev.h - nh) * my;
      return clampVb(nx, ny, nw);
    });
  }, [clampVb]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (zoom >= MAX_ZOOM) return;
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

  const statusCounts: Record<Status, number> = {
    legal: 0, medical: 0, decriminalized: 0, restricted: 0, illegal: 0,
  };
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
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
            グローバル概況
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            世界サイケデリクス規制マップ
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
                  style={{
                    backgroundColor: s.color,
                    boxShadow: isActive ? `0 0 8px ${s.color}60` : "none",
                  }}
                />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Status legend with counts */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-6">
          {(Object.entries(STATUS_CONFIG) as [Status, { color: string; labelJa: string }][]).map(
            ([status, cfg]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-[10px] font-mono text-gray-400">{cfg.labelJa}</span>
                <span className="text-[9px] font-mono text-gray-600">({statusCounts[status]})</span>
              </div>
            ),
          )}
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
                background: "linear-gradient(180deg, #020810 0%, #0a0418 50%, #020810 100%)",
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
