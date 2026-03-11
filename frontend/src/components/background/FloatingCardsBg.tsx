"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { mockCompounds } from "@/lib/mock-data";
import type { RiskLevel, LegalStatus, TransitionState } from "@/types";

const riskHex: Record<RiskLevel, string> = {
  illegal: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#38bdf8",
  safe: "#22c55e",
};

const riskLabels: Record<RiskLevel, string> = {
  illegal: "違法",
  high: "高",
  medium: "注意",
  low: "低",
  safe: "合法",
};

const statusLabels: Record<LegalStatus, string> = {
  effective: "施行済", promulgated: "公布済", official_confirmed: "確認済",
  under_review: "審査中", pending: "保留", reported: "報告済",
  unknown: "未確認", recalled: "リコール",
};

// Color molecules by their legal status in Japan
const statusHex: Record<LegalStatus, string> = {
  effective: "#ef4444",       // red — actively enforced / banned
  promulgated: "#f97316",     // orange — announced, not yet enforced
  official_confirmed: "#fb923c", // amber — confirmed by authorities
  under_review: "#eab308",    // yellow — under review
  pending: "#a3a3a3",         // gray — pending decision
  reported: "#facc15",        // warm yellow — reported
  unknown: "#38bdf8",         // blue — unknown / unregulated
  recalled: "#22c55e",        // green — recalled / delisted
};

// ── Molecular structure SVG data per chemical family ──
// Each structure is an array of bonds (line segments) and atoms (circle positions)
// Coordinates are in a 0-80 x 0-70 viewBox
type MolNode = { x: number; y: number; label?: string };
type MolBond = [number, number]; // indices into nodes array

interface MolStructure {
  nodes: MolNode[];
  bonds: MolBond[];
}

// Cannabinoid: terpenoid + phenol bicyclic ring (THC-like skeleton)
const cannabinoidStructure: MolStructure = {
  nodes: [
    { x: 12, y: 28 }, { x: 22, y: 18 }, { x: 34, y: 18 },
    { x: 44, y: 28 }, { x: 34, y: 38 }, { x: 22, y: 38 },
    { x: 44, y: 28 }, { x: 56, y: 22 }, { x: 66, y: 30 },
    { x: 66, y: 44 }, { x: 56, y: 52 }, { x: 44, y: 44 },
    { x: 34, y: 38 },
    // Side chain
    { x: 4, y: 28, label: "OH" }, { x: 72, y: 22 },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [3, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 3],
    [0, 13], [8, 14],
  ],
};

// Tryptamine: indole ring (5+6 fused) + amine tail
const tryptamineStructure: MolStructure = {
  nodes: [
    // 6-ring
    { x: 14, y: 20 }, { x: 26, y: 14 }, { x: 38, y: 20 },
    { x: 38, y: 34 }, { x: 26, y: 40 }, { x: 14, y: 34 },
    // 5-ring fused
    { x: 46, y: 14 }, { x: 52, y: 26 }, { x: 46, y: 38 },
    // Amine tail
    { x: 60, y: 26 }, { x: 70, y: 20, label: "N" },
    // NH on 5-ring
    { x: 52, y: 8, label: "NH" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [2, 6], [6, 7], [7, 8], [8, 3],
    [7, 9], [9, 10],
    [6, 11],
  ],
};

// Lysergamide: ergoline tetracyclic system
const lysergamideStructure: MolStructure = {
  nodes: [
    // Ring A (6)
    { x: 8, y: 24 }, { x: 18, y: 16 }, { x: 30, y: 16 },
    { x: 36, y: 26 }, { x: 28, y: 36 }, { x: 16, y: 34 },
    // Ring B (6) fused
    { x: 42, y: 16 }, { x: 52, y: 20 }, { x: 52, y: 34 },
    { x: 42, y: 38 },
    // Ring C (5) fused
    { x: 60, y: 14 }, { x: 66, y: 26 },
    // Ring D (6)
    { x: 60, y: 40 }, { x: 66, y: 50 },
    // N label
    { x: 42, y: 46, label: "N" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [2, 6], [6, 7], [7, 8], [8, 9], [9, 3],
    [7, 10], [10, 11], [11, 8],
    [9, 12], [12, 13],
    [4, 14],
  ],
};

// Phenethylamine: benzene + ethylamine chain
const phenethylamineStructure: MolStructure = {
  nodes: [
    { x: 10, y: 22 }, { x: 20, y: 14 }, { x: 32, y: 14 },
    { x: 42, y: 22 }, { x: 32, y: 32 }, { x: 20, y: 32 },
    // Chain
    { x: 52, y: 22 }, { x: 62, y: 16 }, { x: 72, y: 22, label: "NH₂" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [3, 6], [6, 7], [7, 8],
  ],
};

// Arylcyclohexylamine: cyclohexane + phenyl (ketamine-like)
const arylcyclohexylamineStructure: MolStructure = {
  nodes: [
    // Cyclohexane
    { x: 14, y: 20 }, { x: 24, y: 12 }, { x: 36, y: 12 },
    { x: 44, y: 20 }, { x: 36, y: 30 }, { x: 24, y: 30 },
    // Phenyl
    { x: 52, y: 12 }, { x: 62, y: 8 }, { x: 72, y: 14 },
    { x: 72, y: 26 }, { x: 62, y: 32 }, { x: 52, y: 26 },
    // Amine
    { x: 44, y: 34, label: "N" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [3, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6],
    [3, 12],
  ],
};

// Isoxazole: 5-membered ring with O and N
const isoxazoleStructure: MolStructure = {
  nodes: [
    { x: 24, y: 14, label: "O" }, { x: 38, y: 10, label: "N" },
    { x: 46, y: 24 }, { x: 36, y: 36 }, { x: 22, y: 30 },
    // Substituent
    { x: 56, y: 24 }, { x: 66, y: 18, label: "OH" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
    [2, 5], [5, 6],
  ],
};

// Simple chain fallback for small molecules (GHB, Phenibut, etc.)
const simpleChainStructure: MolStructure = {
  nodes: [
    { x: 10, y: 24, label: "O" }, { x: 24, y: 18 }, { x: 38, y: 24 },
    { x: 52, y: 18 }, { x: 66, y: 24, label: "OH" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4],
  ],
};

// Terpenoid: decalin-like bicyclic (Salvinorin)
const terpenoidStructure: MolStructure = {
  nodes: [
    { x: 10, y: 20 }, { x: 20, y: 12 }, { x: 32, y: 12 },
    { x: 42, y: 20 }, { x: 32, y: 30 }, { x: 20, y: 30 },
    { x: 52, y: 12 }, { x: 62, y: 20 }, { x: 52, y: 30 },
    // Ester
    { x: 70, y: 14, label: "O" }, { x: 10, y: 36, label: "O" },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [3, 6], [6, 7], [7, 8], [8, 3],
    [7, 9], [5, 10],
  ],
};

// Indole Alkaloid: indole + extra ring (mitragynine-like)
const indoleAlkaloidStructure: MolStructure = {
  nodes: [
    // Indole 6-ring
    { x: 8, y: 22 }, { x: 18, y: 14 }, { x: 30, y: 14 },
    { x: 38, y: 22 }, { x: 30, y: 32 }, { x: 18, y: 32 },
    // Indole 5-ring
    { x: 44, y: 14, label: "N" }, { x: 50, y: 26 }, { x: 44, y: 36 },
    // Extra ring
    { x: 60, y: 20 }, { x: 70, y: 26 }, { x: 60, y: 36 },
  ],
  bonds: [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [2, 6], [6, 7], [7, 8], [8, 3],
    [7, 9], [9, 10], [10, 11], [11, 7],
  ],
};

const familyStructures: Record<string, MolStructure> = {
  Cannabinoid: cannabinoidStructure,
  Tryptamine: tryptamineStructure,
  Lysergamide: lysergamideStructure,
  Phenethylamine: phenethylamineStructure,
  Arylcyclohexylamine: arylcyclohexylamineStructure,
  Isoxazole: isoxazoleStructure,
  Terpenoid: terpenoidStructure,
  "Indole Alkaloid": indoleAlkaloidStructure,
  "GABA Analog": simpleChainStructure,
  GHB: simpleChainStructure,
  Kavalactone: phenethylamineStructure,
};

// Chemical formulas
const formulaMap: Record<string, string> = {
  "1": "C\u2082\u2081H\u2083\u2080O\u2082", "2": "C\u2082\u2081H\u2082\u2086O\u2082",
  "3": "C\u2082\u2081H\u2083\u2082O\u2082", "4": "C\u2082\u2081H\u2083\u2080O\u2082",
  "5": "C\u2082\u2081H\u2083\u2080O\u2082", "6": "C\u2082\u2081H\u2083\u2080O\u2082",
  "7": "C\u2081\u2089H\u2082\u2086O\u2082", "8": "C\u2082\u2083H\u2083\u2084O\u2082",
  "9": "C\u2082\u2081H\u2083\u2082O\u2082", "10": "C\u2082\u2083H\u2083\u2086O\u2082",
  "11": "C\u2082\u2083H\u2083\u2086O\u2082", "12": "C\u2082\u2081H\u2083\u2082O\u2082",
  "17": "C\u2081\u2082H\u2081\u2087N\u2082O\u2084P",
  "18": "C\u2081\u2082H\u2081\u2086N\u2082O",
  "22": "C\u2082\u2083H\u2083\u2080N\u2082O\u2084",
  "24": "C\u2081\u2081H\u2081\u2087NO\u2083",
  "27": "C\u2081\u2083H\u2081\u2086ClNO",
  "28": "C\u2081\u2082H\u2081\u2086N\u2082",
  "31": "C\u2081\u2081H\u2081\u2085NO\u2082",
};

// SVG molecular structure component
function MolecularSVG({ structure, hex, size }: { structure: MolStructure; hex: string; size: number }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 80 56"
      fill="none"
      className="pointer-events-none"
    >
      {/* Bonds */}
      {structure.bonds.map(([a, b], i) => (
        <line
          key={`b${i}`}
          x1={structure.nodes[a].x}
          y1={structure.nodes[a].y}
          x2={structure.nodes[b].x}
          y2={structure.nodes[b].y}
          stroke={hex}
          strokeOpacity={0.5}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      ))}
      {/* Atoms */}
      {structure.nodes.map((node, i) => (
        <g key={`n${i}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.label ? 2.5 : 1.8}
            fill={node.label ? hex : "white"}
            fillOpacity={node.label ? 0.85 : 0.55}
          />
          {node.label && (
            <text
              x={node.x}
              y={node.y - 5}
              textAnchor="middle"
              fill={hex}
              fillOpacity={0.8}
              fontSize={5}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {node.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

const families = Array.from(new Set(mockCompounds.map((c) => c.chemical_family ?? "Other")));
const riskLevels: RiskLevel[] = ["illegal", "high", "medium", "low", "safe"];

type FilterMode = "none" | "risk" | "family";
type FilterValue = RiskLevel | string;

interface TrailPoint { x: number; y: number }

interface Shockwave {
  x: number; y: number;
  radius: number;
  maxRadius: number;
  life: number; // 0→1
  hex: string;
}

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  squishX: number; // 1 = normal, >1 = stretched horizontally
  squishY: number; // 1 = normal, <1 = compressed vertically
  trail: TrailPoint[]; // last N positions for comet tail
  el: HTMLDivElement | null;
}

const TRAIL_LENGTH = 8;
const MAX_SHOCKWAVES = 10;


// Sized for molecular structure display
const CARD_W = 135;
const CARD_H = 80;
const EXCLUSION_W = 420;
const EXCLUSION_H = 250;
const BAR_HEIGHT = 70; // substance bar collision zone from bottom

// ── Compare Row helper ──
function CompareRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[7px] font-mono text-white/25">{label}</span>
      <span className="text-[9px] font-mono font-medium" style={{ color: color || "rgba(255,255,255,0.6)" }}>
        {value}
      </span>
    </div>
  );
}

interface FloatingCardsBgProps {
  transitionState?: TransitionState;
}

export function FloatingCardsBg({ transitionState = "idle" }: FloatingCardsBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<FloatingCard[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const viewportH = useRef(0);
  const scrollY = useRef(0);
  const scrollVelocity = useRef(0); // px/frame scroll speed for momentum bounce
  const lastScrollY = useRef(0);
  const transitionRef = useRef<TransitionState>("idle");
  const lineFrameCount = useRef(0);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const hoveredIdRef = useRef<string | null>(null);
  const globalTime = useRef(0); // monotonic time for constellation dot animation

  // ── Feature: Magnetic cursor state ──
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const mouseSpeedRef = useRef(0);

  // ── Feature 4: Gravity well (long-press) ──
  const gravityWellRef = useRef<{ x: number; y: number; active: boolean; strength: number; timer: ReturnType<typeof setTimeout> | null }>({
    x: 0, y: 0, active: false, strength: 0, timer: null,
  });

  // Pre-built lookup for O(1) compound data access in physics loop
  const compLookup = useRef(new Map(
    mockCompounds.map((c) => [c.id, { family: c.chemical_family ?? "Other", hex: statusHex[c.legal_status_japan] || statusHex.unknown, risk: c.risk_level, status: c.legal_status_japan }])
  )).current;
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const [mounted, setMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const tooltipPos = useRef({ x: 0, y: 0 });

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }, []);

  transitionRef.current = transitionState;
  filterRef.current = { mode: filterMode, value: filterValue };
  hoveredIdRef.current = hoveredId;

  const updateCardDOM = useCallback((card: FloatingCard, opacity: number, scale: number) => {
    if (!card.el) return;
    const sx = card.squishX * scale;
    const sy = card.squishY * scale;
    card.el.style.transform = `translate(${card.x - CARD_W / 2}px, ${card.y - CARD_H / 2}px) scale(${sx}, ${sy})`;
    card.el.style.opacity = String(opacity);
  }, []);

  const setCardRef = useCallback((id: string, el: HTMLDivElement | null) => {
    const card = cardsRef.current.find((c) => c.id === id);
    if (card) card.el = el;
  }, []);

  const initCards = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const exW = EXCLUSION_W / 2 + CARD_W / 2;
    const exH = EXCLUSION_H / 2 + CARD_H / 2;
    const padX = CARD_W / 2 + 10;
    const padY = CARD_H / 2 + 10;
    const maxY = h * 0.85;

    // Build spawn zones: left, right, bottom-left, bottom-right of exclusion
    // This guarantees molecules never spawn inside the hero text area
    const zones: { x1: number; y1: number; x2: number; y2: number }[] = [
      { x1: padX, y1: padY, x2: cx - exW, y2: maxY },              // left column
      { x1: cx + exW, y1: padY, x2: w - padX, y2: maxY },          // right column
      { x1: cx - exW, y1: cy + exH, x2: cx + exW, y2: maxY },      // below center
      { x1: cx - exW, y1: padY, x2: cx + exW, y2: cy - exH },      // above center (small strip)
    ].filter(z => z.x2 > z.x1 && z.y2 > z.y1); // remove invalid zones

    // Weight zones by area so distribution is even
    const areas = zones.map(z => (z.x2 - z.x1) * (z.y2 - z.y1));
    const totalArea = areas.reduce((a, b) => a + b, 0);

    const cards: FloatingCard[] = mockCompounds.map((compound) => {
      // Pick a zone weighted by area
      let r = Math.random() * totalArea;
      let zone = zones[0];
      for (let i = 0; i < zones.length; i++) {
        r -= areas[i];
        if (r <= 0) { zone = zones[i]; break; }
      }
      const x = zone.x1 + Math.random() * (zone.x2 - zone.x1);
      const y = zone.y1 + Math.random() * (zone.y2 - zone.y1);

      return {
        id: compound.id, x, y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        squishX: 1, squishY: 1,
        trail: [],
        el: null,
      };
    });
    cardsRef.current = cards;
  }, []);

  const applyFilter = useCallback((mode: FilterMode, value: FilterValue | null) => {
    for (const card of cardsRef.current) {
      const compound = mockCompounds.find((c) => c.id === card.id)!;
      if (mode === "none" || !value) {
        updateCardDOM(card, 0.5, 1);
      } else {
        const isMatch = mode === "risk"
          ? compound.risk_level === value
          : (compound.chemical_family ?? "Other") === value;
        updateCardDOM(card, isMatch ? 0.9 : 0.06, isMatch ? 1.08 : 0.75);
      }
    }
  }, [updateCardDOM]);

  const restoreFloating = useCallback(() => {
    setFilterMode("none");
    setFilterValue(null);
    filterRef.current = { mode: "none", value: null };
    applyFilter("none", null);
  }, [applyFilter]);

  const handleFilter = (mode: FilterMode, value: FilterValue) => {
    if (filterMode === mode && filterValue === value) {
      restoreFloating();
    } else {
      setFilterMode(mode);
      setFilterValue(value);
      filterRef.current = { mode, value };
      applyFilter(mode, value);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };

    if (cardsRef.current.length === 0) {
      initCards(rect.width, rect.height);
    }
    setMounted(true);

    viewportH.current = window.innerHeight;
    const onResize = () => {
      const r = container.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      viewportH.current = window.innerHeight;
      // Resize connection lines canvas
      const canvas = linesCanvasRef.current;
      if (canvas) { canvas.width = r.width; canvas.height = r.height; }
    };
    window.addEventListener("resize", onResize);

    // Mouse tracking for magnetic cursor (speed-aware attract/repel)
    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      const newX = e.clientX - r.left;
      const newY = e.clientY - r.top;
      const dx = newX - prevMouseRef.current.x;
      const dy = newY - prevMouseRef.current.y;
      mouseSpeedRef.current = Math.sqrt(dx * dx + dy * dy);
      prevMouseRef.current = { x: newX, y: newY };
      mouseRef.current = { x: newX, y: newY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      mouseSpeedRef.current = 0;
    };
    const onScroll = () => {
      const newY = window.scrollY || window.pageYOffset;
      scrollVelocity.current = newY - lastScrollY.current;
      lastScrollY.current = newY;
      scrollY.current = newY;
    };

    // ── Feature 4: Gravity well — long-press anywhere on page ──
    const LONG_PRESS_MS = 400;
    const gw = gravityWellRef.current;

    const startGravityWell = (x: number, y: number) => {
      const r = container.getBoundingClientRect();
      gw.x = x - r.left;
      gw.y = y - r.top;
      gw.strength = 0;
      gw.timer = setTimeout(() => {
        gw.active = true;
      }, LONG_PRESS_MS);
    };
    const endGravityWell = () => {
      if (gw.timer) { clearTimeout(gw.timer); gw.timer = null; }
      if (gw.active) {
        // Release: fling all molecules outward from the well
        const cards = cardsRef.current;
        for (const card of cards) {
          const dx = card.x - gw.x;
          const dy = card.y - gw.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const fling = Math.max(0, 3 - dist * 0.005) + Math.random();
          card.vx += (dx / dist) * fling;
          card.vy += (dy / dist) * fling;
          card.squishX = 1.2; card.squishY = 0.8;
        }
        // Spawn release shockwave
        const shockwaves = shockwavesRef.current;
        if (shockwaves.length < MAX_SHOCKWAVES) {
          shockwaves.push({ x: gw.x, y: gw.y, radius: 0, maxRadius: 200, life: 0, hex: "#8b5cf6" });
        }
      }
      gw.active = false;
      gw.strength = 0;
    };
    const moveGravityWell = (x: number, y: number) => {
      if (gw.timer || gw.active) {
        const r = container.getBoundingClientRect();
        gw.x = x - r.left;
        gw.y = y - r.top;
      }
    };

    // Mouse long-press — on document so it works through pointer-events-none layers
    const onGwMouseDown = (e: MouseEvent) => startGravityWell(e.clientX, e.clientY);
    const onGwMouseMove = (e: MouseEvent) => moveGravityWell(e.clientX, e.clientY);
    const onGwTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) startGravityWell(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onGwTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) moveGravityWell(e.touches[0].clientX, e.touches[0].clientY);
    };
    document.addEventListener("mousedown", onGwMouseDown);
    document.addEventListener("mousemove", onGwMouseMove);
    window.addEventListener("mouseup", endGravityWell);
    document.addEventListener("touchstart", onGwTouchStart, { passive: true });
    document.addEventListener("touchmove", onGwTouchMove, { passive: true });
    window.addEventListener("touchend", endGravityWell);
    window.addEventListener("touchcancel", endGravityWell);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("mouseleave", onMouseLeave);

    // Init canvas
    const canvas = linesCanvasRef.current;
    if (canvas) { canvas.width = rect.width; canvas.height = rect.height; }

    let lastUpdate = 0;
    const tick = (now: number) => {
      const ts = transitionRef.current;
      const cards = cardsRef.current;
      const cw = sizeRef.current.w;
      const ch = sizeRef.current.h;

      if (cw === 0 || ch === 0) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // Black hole suck-in
      if (ts !== "idle") {
        const cx = cw / 2;
        const cy = ch / 2;
        const strength = ts === "collapsing" ? 0.03 : ts === "singularity" ? 0.08 : ts === "zoom" ? 0.15 : 0.2;
        const opacity = ts === "collapsing" ? 0.4 : ts === "singularity" ? 0.15 : 0;
        const scale = ts === "collapsing" ? 0.8 : 0.3;

        for (const card of cards) {
          card.vx += (cx - card.x) * strength;
          card.vy += (cy - card.y) * strength;
          card.vx *= 0.92;
          card.vy *= 0.92;
          card.x += card.vx;
          card.y += card.vy;
          card.squishX = 1; card.squishY = 1;
          updateCardDOM(card, opacity, scale);
        }
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // Throttle physics to ~30fps for performance
      if (now - lastUpdate < 33) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const cx = cw / 2;
      const cy = ch / 2;
      const exW = EXCLUSION_W / 2 + CARD_W / 2;
      const exH = EXCLUSION_H / 2 + CARD_H / 2;
      // Bar collision zone: viewport bottom + scroll offset in container coords
      const vh = viewportH.current || ch;
      const barTop = scrollY.current + vh - BAR_HEIGHT;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Feature 2: Magnetic cursor — slow = attract, fast = repel ──
      const cursorSpeed = mouseSpeedRef.current;
      // Decay cursor speed over frames for smooth transitions
      mouseSpeedRef.current *= 0.85;

      // ── Feature 4: Gravity well — ramp up strength while held ──
      const gwActive = gravityWellRef.current.active;
      if (gwActive) {
        gravityWellRef.current.strength = Math.min(gravityWellRef.current.strength + 0.002, 0.06);
      }
      const gwX = gravityWellRef.current.x;
      const gwY = gravityWellRef.current.y;
      const gwStr = gravityWellRef.current.strength;

      for (const card of cards) {
        // Magnetic cursor
        const dmx = card.x - mx;
        const dmy = card.y - my;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const MOUSE_RADIUS = 160;
        if (mouseDist > 20 && mouseDist < MOUSE_RADIUS && mouseDist > 0) {
          const proximity = (MOUSE_RADIUS - mouseDist) / MOUSE_RADIUS;
          const speedFactor = cursorSpeed / 8;
          if (speedFactor > 1) {
            const repelForce = proximity * Math.min(speedFactor * 0.015, 0.06);
            card.vx += (dmx / mouseDist) * repelForce;
            card.vy += (dmy / mouseDist) * repelForce;
          } else {
            const attractForce = proximity * 0.004 * (1 - speedFactor * 0.5);
            card.vx -= (dmx / mouseDist) * attractForce;
            card.vy -= (dmy / mouseDist) * attractForce;
          }
        }

        // ── Feature 4: Gravity well pull — orbit style ──
        if (gwActive && gwStr > 0) {
          const gdx = gwX - card.x;
          const gdy = gwY - card.y;
          const gDist = Math.sqrt(gdx * gdx + gdy * gdy) || 1;
          // Pull toward well center with inverse-distance falloff
          const pullForce = gwStr * Math.min(300 / gDist, 3);
          card.vx += (gdx / gDist) * pullForce;
          card.vy += (gdy / gDist) * pullForce;
          // Add tangential velocity for orbital motion (perpendicular to pull direction)
          const tangentForce = gwStr * Math.min(150 / gDist, 1.5) * 0.6;
          card.vx += (-gdy / gDist) * tangentForce;
          card.vy += (gdx / gDist) * tangentForce;
          // Extra damping in gravity well to prevent runaway speeds
          card.vx *= 0.97;
          card.vy *= 0.97;
        }

        card.x += card.vx;
        card.y += card.vy;

        const padX = CARD_W / 2 + 4;
        const padY = CARD_H / 2 + 4;
        if (card.x < padX) { card.x = padX; card.vx *= -0.6; }
        if (card.x > cw - padX) { card.x = cw - padX; card.vx *= -0.6; }
        if (card.y < padY) { card.y = padY; card.vy = Math.abs(card.vy) * 0.6 + 0.3; } // bounce off ceiling with minimum push down

        // Substance bar collision — momentum bounce powered by scroll speed!
        const cardBottom = card.y + CARD_H / 2;
        if (cardBottom > barTop) {
          card.y = barTop - CARD_H / 2;
          // Scroll velocity boost: faster scroll = harder bounce
          const scrollSpeed = Math.abs(scrollVelocity.current);
          const scrollBoost = Math.min(scrollSpeed * 0.15, 4); // cap at 4
          const impactSpeed = Math.abs(card.vy) + scrollBoost;
          // Bounce up — strong restitution with scroll momentum
          card.vy = -Math.max(impactSpeed * 0.85, 0.5 + scrollBoost);
          // Random horizontal scatter on hard hits
          if (scrollBoost > 1) {
            card.vx += (Math.random() - 0.5) * scrollBoost * 0.5;
          }
          // Jelly squish on impact — bigger squish for harder hits
          const squishAmount = Math.min(0.6, impactSpeed * 0.8);
          card.squishX = 1 + squishAmount;
          card.squishY = 1 - squishAmount * 0.7;
        }

        // Regular bottom boundary (fallback — use container height)
        const maxY = Math.min(ch - padY, barTop - CARD_H / 2);
        if (card.y > maxY) { card.y = maxY; card.vy = -0.4; }

        // Center exclusion zone — soft push outward, strongly prefer horizontal
        const relX = card.x - cx;
        const relY = card.y - cy;
        if (Math.abs(relX) < exW && Math.abs(relY) < exH) {
          const overlapX = exW - Math.abs(relX);
          const overlapY = exH - Math.abs(relY);
          // Push horizontally (left/right) — this is always safe
          card.vx += Math.sign(relX || (Math.random() > 0.5 ? 1 : -1)) * overlapX * 0.015;
          // Only add vertical push if overlap is mostly vertical AND push downward
          if (overlapY < overlapX * 0.5) {
            card.vy += Math.abs(overlapY) * 0.008; // always push DOWN
          }
        }

        // Anti-clustering: gentle force toward vertical center when too far from it
        const verticalCenter = ch * 0.45;
        const distFromCenter = card.y - verticalCenter;
        if (Math.abs(distFromCenter) > ch * 0.3) {
          card.vy -= Math.sign(distFromCenter) * 0.008;
        }

        // No gravity — molecules float freely in space

        card.vx += (Math.random() - 0.5) * 0.012;
        card.vy += (Math.random() - 0.5) * 0.01;
        // Speed cap — higher for vertical to allow bounce arcs, much higher for shake scatter
        const speed = Math.sqrt(card.vx * card.vx + card.vy * card.vy);
        const maxSpeed = speed > 3 ? 12 : 2; // allow high speed from shake/fling but cap drift
        if (speed > maxSpeed) {
          card.vx = (card.vx / speed) * maxSpeed;
          card.vy = (card.vy / speed) * maxSpeed;
        }
        // Stronger damping at high speed, gentle at low speed
        const damping = speed > 1.5 ? 0.975 : 0.995;
        card.vx *= damping;
        card.vy *= damping;

        // Jelly squish decay — spring back to normal
        card.squishX += (1 - card.squishX) * 0.15;
        card.squishY += (1 - card.squishY) * 0.15;
        // Overshoot oscillation for juiciness
        if (Math.abs(card.squishX - 1) > 0.01) {
          card.squishX += (1 - card.squishX) * 0.05;
        }
      }

      // ── Feature 1: Record trail positions for comet tails ──
      for (const card of cards) {
        const speed = Math.sqrt(card.vx * card.vx + card.vy * card.vy);
        // Only record trail when moving noticeably
        if (speed > 0.05) {
          card.trail.push({ x: card.x, y: card.y });
          if (card.trail.length > TRAIL_LENGTH) card.trail.shift();
        } else if (card.trail.length > 0) {
          // Fade out trail when nearly still
          card.trail.shift();
        }
      }

      // ── Elastic collision (physics only, no visual effects for performance) ──
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i], b = cards[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = CARD_W * 0.85;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = minDist - dist;

            // Separate
            a.x += nx * overlap * 0.5;
            a.y += ny * overlap * 0.5;
            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;

            // Elastic velocity exchange along collision normal
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dotN = dvx * nx + dvy * ny;
            if (dotN > 0) {
              a.vx -= dotN * nx * 0.9;
              a.vy -= dotN * ny * 0.9;
              b.vx += dotN * nx * 0.9;
              b.vy += dotN * ny * 0.9;

              // Jelly squish on both
              const impactForce = Math.abs(dotN);
              const sq = Math.min(0.4, impactForce * 1.5);
              a.squishX = 1 + sq; a.squishY = 1 - sq * 0.6;
              b.squishX = 1 + sq; b.squishY = 1 - sq * 0.6;
            }
          }
        }
      }

      // Update shockwaves (gravity well release only — rare, low cost)
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.life += 0.04;
        sw.radius = sw.maxRadius * sw.life;
        if (sw.life >= 1) shockwaves.splice(i, 1);
      }


      // ── Canvas drawing: trails + sparks + constellation lines ──
      globalTime.current += 0.02;
      if (lineFrameCount.current++ % 2 === 0) {
        const cvs = linesCanvasRef.current;
        if (cvs) {
          const ctx = cvs.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, cw, ch);

            // Feature 1: Draw comet trails
            for (const card of cards) {
              if (card.trail.length < 2) continue;
              const data = compLookup.get(card.id);
              if (!data) continue;
              const trail = card.trail;
              for (let t = 1; t < trail.length; t++) {
                const alpha = (t / trail.length) * 0.2;
                const width = (t / trail.length) * 1.5;
                ctx.strokeStyle = data.hex;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = width;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(trail[t - 1].x, trail[t - 1].y);
                ctx.lineTo(trail[t].x, trail[t].y);
                ctx.stroke();
              }
            }

            // Shockwave rings (gravity well release only — rare)
            for (const sw of shockwaves) {
              const alpha = (1 - sw.life);
              ctx.strokeStyle = sw.hex;
              ctx.lineWidth = Math.max(0.5, alpha * 2);
              ctx.globalAlpha = alpha * 0.35;
              ctx.beginPath();
              ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
              ctx.stroke();
            }


            // ── Feature 4: Gravity well visual — swirling vortex ──
            if (gwActive && gwStr > 0) {
              const gt = globalTime.current;
              // Pulsing core glow
              const coreSize = 8 + Math.sin(gt * 6) * 3;
              ctx.globalAlpha = Math.min(gwStr * 8, 0.5);
              const coreGrad = ctx.createRadialGradient(gwX, gwY, 0, gwX, gwY, coreSize * 5);
              coreGrad.addColorStop(0, "rgba(139,92,246,0.6)");
              coreGrad.addColorStop(0.4, "rgba(139,92,246,0.15)");
              coreGrad.addColorStop(1, "transparent");
              ctx.fillStyle = coreGrad;
              ctx.beginPath();
              ctx.arc(gwX, gwY, coreSize * 5, 0, Math.PI * 2);
              ctx.fill();

              // Rotating orbital rings
              const ringCount = 3;
              for (let r = 0; r < ringCount; r++) {
                const ringRadius = 25 + r * 22 + Math.sin(gt * 3 + r) * 5;
                const rotation = gt * (2 - r * 0.4);
                ctx.globalAlpha = Math.min(gwStr * 6, 0.3) * (1 - r * 0.25);
                ctx.strokeStyle = "#8b5cf6";
                ctx.lineWidth = 1.2 - r * 0.3;
                ctx.beginPath();
                // Draw partial arc (not full circle) for dynamic look
                ctx.arc(gwX, gwY, ringRadius, rotation, rotation + Math.PI * 1.4);
                ctx.stroke();
              }

              // Spiral particle dots orbiting the well
              const dotCount = 8;
              for (let d = 0; d < dotCount; d++) {
                const angle = gt * 3 + (d / dotCount) * Math.PI * 2;
                const orbitR = 15 + (d % 3) * 18 + Math.sin(gt * 2 + d) * 6;
                const dx = gwX + Math.cos(angle) * orbitR;
                const dy = gwY + Math.sin(angle) * orbitR;
                ctx.globalAlpha = Math.min(gwStr * 10, 0.5);
                ctx.fillStyle = d % 2 === 0 ? "#8b5cf6" : "#a78bfa";
                ctx.beginPath();
                ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            // Feature 3: Hover pulse resonance glow (drawn as expanding rings)
            const hId = hoveredIdRef.current;
            if (hId) {
              const hovData = compLookup.get(hId);
              const hovCard = cards.find(c => c.id === hId);
              if (hovData && hovCard) {
                // Pulse ring on hovered molecule
                const pulsePhase = (globalTime.current * 3) % 1;
                const pulseR = 30 + pulsePhase * 40;
                ctx.globalAlpha = (1 - pulsePhase) * 0.15;
                ctx.strokeStyle = hovData.hex;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(hovCard.x, hovCard.y, pulseR, 0, Math.PI * 2);
                ctx.stroke();

                // Resonance: glow same-family molecules
                for (const card of cards) {
                  if (card.id === hId) continue;
                  const cData = compLookup.get(card.id);
                  if (!cData || cData.family !== hovData.family) continue;
                  const resPulse = ((globalTime.current * 2) + Math.random() * 0.01) % 1;
                  const resR = 20 + resPulse * 25;
                  ctx.globalAlpha = (1 - resPulse) * 0.08;
                  ctx.strokeStyle = cData.hex;
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.arc(card.x, card.y, resR, 0, Math.PI * 2);
                  ctx.stroke();
                }
              }
            }

            // Feature 4: Animated constellation lines with flowing dots
            const CONNECTION_DIST = 220;
            const t = globalTime.current;
            for (let i = 0; i < cards.length; i++) {
              const a = cards[i];
              const famA = compLookup.get(a.id);
              if (!famA) continue;
              for (let j = i + 1; j < cards.length; j++) {
                const b = cards[j];
                const famB = compLookup.get(b.id);
                if (!famB || famA.family !== famB.family) continue;
                const ddx = a.x - b.x, ddy = a.y - b.y;
                const distSq = ddx * ddx + ddy * ddy;
                if (distSq < CONNECTION_DIST * CONNECTION_DIST && distSq > 0) {
                  const dist = Math.sqrt(distSq);
                  const baseAlpha = (1 - dist / CONNECTION_DIST);

                  // Dashed line
                  ctx.strokeStyle = famA.hex;
                  ctx.globalAlpha = baseAlpha * 0.08;
                  ctx.lineWidth = 0.6;
                  ctx.setLineDash([4, 6]);
                  ctx.lineDashOffset = -t * 20; // animate the dash
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.stroke();
                  ctx.setLineDash([]);

                  // Flowing dots along the line
                  const dotCount = 2;
                  for (let d = 0; d < dotCount; d++) {
                    const phase = ((t * 0.5 + d / dotCount + i * 0.1) % 1);
                    const px = a.x + (b.x - a.x) * phase;
                    const py = a.y + (b.y - a.y) * phase;
                    ctx.globalAlpha = baseAlpha * 0.25 * Math.sin(phase * Math.PI);
                    ctx.fillStyle = famA.hex;
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }
              }
            }
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
          }
        }
      }

      const f = filterRef.current;
      if (f.mode === "none" || !f.value) {
        for (const card of cards) updateCardDOM(card, 0.5, 1);
      } else {
        for (const card of cards) {
          const data = compLookup.get(card.id);
          const isMatch = f.mode === "risk"
            ? data?.risk === f.value
            : data?.family === f.value;
          updateCardDOM(card, isMatch ? 0.9 : 0.06, isMatch ? 1.08 : 0.75);
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onGwMouseDown);
      document.removeEventListener("mousemove", onGwMouseMove);
      window.removeEventListener("mouseup", endGravityWell);
      document.removeEventListener("touchstart", onGwTouchStart);
      document.removeEventListener("touchmove", onGwTouchMove);
      window.removeEventListener("touchend", endGravityWell);
      window.removeEventListener("touchcancel", endGravityWell);
      container.removeEventListener("mouseleave", onMouseLeave);
      if (gravityWellRef.current.timer) clearTimeout(gravityWellRef.current.timer);
      cancelAnimationFrame(animRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initCards, updateCardDOM]);

  const isTransitioning = transitionState !== "idle";
  const isFiltered = filterMode !== "none" && filterValue !== null;

  // Search state for substance bar
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // JST clock
  const [jstTime, setJstTime] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
      const h = String(jst.getHours()).padStart(2, "0");
      const m = String(jst.getMinutes()).padStart(2, "0");
      const s = String(jst.getSeconds()).padStart(2, "0");
      setJstTime(`${h}:${m}:${s}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Search filtering — highlight matching compounds via filter system
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    for (const card of cardsRef.current) {
      const compound = mockCompounds.find((c) => c.id === card.id);
      if (!compound) continue;
      const matches = compound.name.toLowerCase().includes(q)
        || compound.aliases.some((a) => a.toLowerCase().includes(q))
        || (compound.chemical_family ?? "").toLowerCase().includes(q);
      updateCardDOM(card, matches ? 0.95 : 0.06, matches ? 1.1 : 0.75);
    }
  }, [searchQuery, updateCardDOM]);

  // Hovered compound data for tooltip
  const hoveredCompound = hoveredId ? mockCompounds.find((c) => c.id === hoveredId) : null;

  return (
    <>
    {/* JST Clock — top right */}
    {!isTransitioning && (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 pointer-events-none">
        <span className="text-[9px] font-mono tracking-wider text-white/20">JST</span>
        <span className="text-[11px] font-mono font-bold tabular-nums text-white/30">{jstTime}</span>
      </div>
    )}

    {/* Hover tooltip — compact */}
    {hoveredCompound && !isTransitioning && (
      <div
        className="fixed z-[60] pointer-events-none"
        style={{
          left: Math.min(tooltipPos.current.x + 12, (sizeRef.current.w || 900) - 170),
          top: Math.max(tooltipPos.current.y - 16, 10),
        }}
      >
        <div
          className="rounded-md px-2 py-1.5 border max-w-[155px]"
          style={{
            backgroundColor: "rgba(6,9,15,0.94)",
            borderColor: `${statusHex[hoveredCompound.legal_status_japan]}25`,
            boxShadow: `0 2px 10px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusHex[hoveredCompound.legal_status_japan] }}
            />
            <span className="text-[10px] font-bold text-white/85">{hoveredCompound.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono" style={{ color: `${statusHex[hoveredCompound.legal_status_japan]}bb` }}>
              {statusLabels[hoveredCompound.legal_status_japan]}
            </span>
            <span className="text-[7px] text-white/20">|</span>
            <span className="text-[8px] text-white/35">{riskLabels[hoveredCompound.risk_level]}</span>
          </div>
          {formulaMap[hoveredCompound.id] && (
            <p className="text-[8px] font-mono text-white/20 mt-0.5">{formulaMap[hoveredCompound.id]}</p>
          )}
          <p className="text-[8px] text-white/30 mt-0.5 leading-snug line-clamp-1">{hoveredCompound.effects_summary}</p>
        </div>
      </div>
    )}

    {/* Substance Bar — fixed bottom */}
    {!isTransitioning && (
      <div
        className="fixed left-0 right-0 z-50 flex justify-center px-4 pb-4 pt-8 pointer-events-none"
        style={{
          bottom: 0,
          background: "linear-gradient(to top, rgba(6,9,15,0.9) 0%, rgba(6,9,15,0.5) 60%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.06] px-1.5 py-1 pointer-events-auto">
          {/* Search toggle */}
          {searchOpen ? (
            <div className="flex items-center gap-1 px-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    setSearchOpen(false);
                    restoreFloating();
                  }
                }}
                placeholder="物質を検索..."
                className="bg-transparent text-[10px] text-white/70 placeholder-white/20 outline-none w-24 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); restoreFloating(); }}
                  className="text-white/30 hover:text-white/60 text-[10px]"
                >×</button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-6 h-6 rounded-full text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}

          <div className="w-px h-4 bg-white/[0.06] mx-0.5" />

          {/* Risk dots */}
          {riskLevels.map((risk) => {
            const isActive = filterMode === "risk" && filterValue === risk;
            const hex = riskHex[risk];
            return (
              <button
                key={risk}
                onClick={() => { setSearchQuery(""); setSearchOpen(false); handleFilter("risk", risk); }}
                className="relative group flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer"
                style={isActive ? {
                  backgroundColor: `${hex}18`,
                  boxShadow: `0 0 12px ${hex}25`,
                } : undefined}
                title={riskLabels[risk]}
              >
                <span
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: hex,
                    boxShadow: isActive ? `0 0 8px ${hex}80` : `0 0 4px ${hex}40`,
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                  }}
                />
                <span
                  className="text-[9px] font-bold tracking-wide transition-all duration-200"
                  style={{ color: isActive ? hex : "rgba(255,255,255,0.35)" }}
                >
                  {riskLabels[risk]}
                </span>
              </button>
            );
          })}

          {/* Separator */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* Family pills */}
          {families.map((fam) => {
            const isActive = filterMode === "family" && filterValue === fam;
            return (
              <button
                key={fam}
                onClick={() => { setSearchQuery(""); setSearchOpen(false); handleFilter("family", fam); }}
                className={`px-2 py-1 rounded-full text-[9px] font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#1a9a8a]/20 text-[#1a9a8a] shadow-[0_0_12px_rgba(26,154,138,0.2)]"
                    : "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
                }`}
              >
                {fam}
              </button>
            );
          })}

          {/* Clear */}
          {(isFiltered || searchQuery) && (
            <button
              onClick={() => { setSearchQuery(""); setSearchOpen(false); restoreFloating(); }}
              className="w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-colors cursor-pointer text-[10px]"
            >
              ×
            </button>
          )}
        </div>
      </div>
    )}

    <div
      ref={containerRef}
      className="absolute inset-0 z-[15] overflow-hidden pointer-events-none"
    >
      {/* Connection lines canvas */}
      <canvas
        ref={linesCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Floating molecular structure nodes */}
      {mounted && mockCompounds.map((compound) => {
        const hex = statusHex[compound.legal_status_japan] || statusHex.unknown;
        const family = compound.chemical_family ?? "Other";
        const structure = familyStructures[family] || simpleChainStructure;
        const formula = formulaMap[compound.id];

        return (
          <div
            key={compound.id}
            ref={(el) => setCardRef(compound.id, el)}
            className="absolute will-change-transform pointer-events-none [@media(hover:hover)]:pointer-events-auto"
            style={{ width: CARD_W, opacity: 0, zIndex: 2 }}
            onMouseEnter={(e) => {
              tooltipPos.current = { x: e.clientX, y: e.clientY };
              setHoveredId(compound.id);
            }}
            onMouseMove={(e) => {
              tooltipPos.current = { x: e.clientX, y: e.clientY };
            }}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => toggleSelect(compound.id)}
          >
            {/* The card IS the molecular structure */}
            <div className="relative">
              {/* Selection ring */}
              {selectedIds.includes(compound.id) && (
                <div
                  className="absolute -inset-1.5 rounded-2xl pointer-events-none"
                  style={{
                    border: `2px solid ${hex}`,
                    boxShadow: `0 0 12px ${hex}60, inset 0 0 8px ${hex}20`,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              )}
              {/* Soft glow behind the structure */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, ${hex}${selectedIds.includes(compound.id) ? '25' : '12'} 0%, transparent 70%)`,
                }}
              />

              {/* SVG molecular skeleton — the main visual */}
              <div className="relative flex justify-center">
                <MolecularSVG structure={structure} hex={hex} size={CARD_W - 16} />
              </div>

              {/* Name label — floats below the structure */}
              <div className="flex items-center justify-center gap-1.5 -mt-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: hex,
                    boxShadow: `0 0 8px ${hex}aa`,
                  }}
                />
                <span className="text-[8px] font-bold text-white/90 tracking-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                  {compound.name}
                </span>
                <span
                  className="text-[6px] font-mono font-bold tracking-wider px-0.5 py-px rounded-sm"
                  style={{ color: hex, backgroundColor: `${hex}28`, textShadow: `0 0 4px ${hex}40` }}
                >
                  {statusLabels[compound.legal_status_japan]}
                </span>
              </div>

              {/* Formula + status — tiny text below */}
              <div className="flex items-center justify-center gap-2 mt-0.5">
                {formula && (
                  <span className="text-[7px] font-mono font-medium" style={{ color: `${hex}bb`, textShadow: `0 0 6px ${hex}30` }}>
                    {formula}
                  </span>
                )}
                <span className="text-[6px] font-mono text-white/30" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                  {statusLabels[compound.legal_status_japan]}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* ── Comparison Panel ── slides up when 2+ molecules selected */}
    {selectedIds.length >= 2 && (
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] animate-slideUp"
        style={{
          background: "linear-gradient(180deg, rgba(6,9,15,0.97) 0%, rgba(6,9,15,0.99) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(26,154,138,0.06)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#1a9a8a]">比較モード</span>
            <span className="text-[9px] font-mono text-white/30">{selectedIds.length}/3 選択</span>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-[9px] font-mono text-white/40 hover:text-white/80 px-2 py-1 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            クリア ✕
          </button>
        </div>

        {/* Comparison grid */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedIds.length}, minmax(140px, 1fr))` }}>
            {selectedIds.map((id) => {
              const c = mockCompounds.find((m) => m.id === id);
              if (!c) return null;
              const cHex = statusHex[c.legal_status_japan];
              return (
                <div
                  key={id}
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: `1px solid ${cHex}30`,
                  }}
                >
                  {/* Name + remove */}
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="text-[11px] font-bold text-white/90">{c.name}</div>
                      {c.aliases?.[0] && (
                        <div className="text-[8px] font-mono text-white/30 truncate">{c.aliases[0]}</div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleSelect(id)}
                      className="text-[9px] text-white/20 hover:text-white/60 cursor-pointer shrink-0 mt-0.5"
                    >✕</button>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cHex, boxShadow: `0 0 6px ${cHex}80` }} />
                    <span className="text-[9px] font-mono font-bold" style={{ color: cHex }}>
                      {statusLabels[c.legal_status_japan]}
                    </span>
                  </div>

                  {/* Data rows */}
                  <div className="space-y-1.5">
                    <CompareRow label="リスク" value={riskLabels[c.risk_level]} color={riskHex[c.risk_level]} />
                    <CompareRow label="分類" value={c.chemical_family || "—"} />
                    <CompareRow label="種別" value={c.natural_or_synthetic === "natural" ? "天然" : c.natural_or_synthetic === "synthetic" ? "合成" : "—"} />
                    <CompareRow label="更新日" value={c.legal_status_updated_at?.slice(0, 10) || "—"} />
                  </div>

                  {/* Effects summary */}
                  <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="text-[7px] font-mono text-white/25 mb-0.5">概要</div>
                    <div className="text-[8px] text-white/50 leading-relaxed line-clamp-3">
                      {c.effects_summary || "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
