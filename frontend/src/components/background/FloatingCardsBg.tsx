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

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  squishX: number; // 1 = normal, >1 = stretched horizontally
  squishY: number; // 1 = normal, <1 = compressed vertically
  el: HTMLDivElement | null;
}

// Sized for molecular structure display
const CARD_W = 115;
const CARD_H = 68;
const EXCLUSION_W = 500;
const EXCLUSION_H = 350;
const BAR_HEIGHT = 70; // substance bar collision zone from bottom

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
  const transitionRef = useRef<TransitionState>("idle");
  const lineFrameCount = useRef(0);

  // Pre-built lookup for O(1) compound data access in physics loop
  const compLookup = useRef(new Map(
    mockCompounds.map((c) => [c.id, { family: c.chemical_family ?? "Other", hex: statusHex[c.legal_status_japan] || statusHex.unknown, risk: c.risk_level, status: c.legal_status_japan }])
  )).current;
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const [mounted, setMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const tooltipPos = useRef({ x: 0, y: 0 });

  transitionRef.current = transitionState;
  filterRef.current = { mode: filterMode, value: filterValue };

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

    const cards: FloatingCard[] = mockCompounds.map((compound) => {
      let x: number, y: number, attempts = 0;
      // Bias toward upper 70% so molecules don't cluster near the substance bar
      const maxInitY = h * 0.7;
      do {
        x = padX + Math.random() * (w - padX * 2);
        y = padY + Math.random() * (maxInitY - padY);
        attempts++;
      } while (attempts < 50 && Math.abs(x - cx) < exW && Math.abs(y - cy) < exH);

      return {
        id: compound.id, x, y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        squishX: 1, squishY: 1,
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

    // Mouse tracking for repulsion
    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    const onScroll = () => {
      scrollY.current = window.scrollY || window.pageYOffset;
    };
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

      for (const card of cards) {
        // Mouse repulsion — gentle push, doesn't fight hover
        const dmx = card.x - mx;
        const dmy = card.y - my;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const MOUSE_RADIUS = 100;
        // Only repel if mouse is not directly on the card (allows hover)
        if (mouseDist > 30 && mouseDist < MOUSE_RADIUS && mouseDist > 0) {
          const force = (MOUSE_RADIUS - mouseDist) * 0.003;
          card.vx += (dmx / mouseDist) * force;
          card.vy += (dmy / mouseDist) * force;
        }

        card.x += card.vx;
        card.y += card.vy;

        const padX = CARD_W / 2 + 4;
        const padY = CARD_H / 2 + 4;
        if (card.x < padX) { card.x = padX; card.vx *= -0.6; }
        if (card.x > cw - padX) { card.x = cw - padX; card.vx *= -0.6; }
        if (card.y < padY) { card.y = padY; card.vy = Math.abs(card.vy) * 0.5; } // bounce off ceiling

        // Substance bar collision — rubber ball bounce!
        const cardBottom = card.y + CARD_H / 2;
        if (cardBottom > barTop) {
          card.y = barTop - CARD_H / 2;
          const impactSpeed = Math.abs(card.vy);
          // Rubber ball bounce — visible but not frantic
          card.vy = -Math.max(impactSpeed * 0.95, 1.5);
          // Jelly squish on impact
          const squishAmount = Math.min(0.5, impactSpeed * 1.0);
          card.squishX = 1 + squishAmount;
          card.squishY = 1 - squishAmount * 0.7;
        }

        // Regular bottom boundary (fallback — use container height)
        const maxY = Math.min(ch - padY, barTop - CARD_H / 2);
        if (card.y > maxY) { card.y = maxY; card.vy = -1.2; }

        // Center exclusion zone
        const relX = card.x - cx;
        const relY = card.y - cy;
        if (Math.abs(relX) < exW && Math.abs(relY) < exH) {
          const pushX = relX > 0 ? exW - relX : -(exW + relX);
          const pushY = relY > 0 ? exH - relY : -(exH + relY);
          if (Math.abs(pushX) < Math.abs(pushY)) card.vx += pushX * 0.04;
          else card.vy += pushY * 0.04;
        }

        // Gentle gravity — pulls molecules down so they arc like rubber balls
        card.vy += 0.006;

        card.vx += (Math.random() - 0.5) * 0.012;
        card.vy += (Math.random() - 0.5) * 0.01;
        // Speed cap — higher for vertical to allow bounce arcs
        const absVx = Math.abs(card.vx);
        const absVy = Math.abs(card.vy);
        if (absVx > 0.25) card.vx = Math.sign(card.vx) * 0.25;
        if (absVy > 2.0) card.vy = Math.sign(card.vy) * 2.0;
        card.vx *= 0.995;
        card.vy *= 0.993;

        // Jelly squish decay — spring back to normal
        card.squishX += (1 - card.squishX) * 0.15;
        card.squishY += (1 - card.squishY) * 0.15;
        // Overshoot oscillation for juiciness
        if (Math.abs(card.squishX - 1) > 0.01) {
          card.squishX += (1 - card.squishX) * 0.05;
        }
      }

      // Card repulsion
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i], b = cards[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CARD_W * 0.9 && dist > 0) {
            const f = (CARD_W * 0.9 - dist) * 0.015;
            const nx = dx / dist, ny = dy / dist;
            a.vx += nx * f; a.vy += ny * f;
            b.vx -= nx * f; b.vy -= ny * f;
          }
        }
      }

      // Draw connection lines between same-family compounds (throttled — every 3rd frame)
      if (lineFrameCount.current++ % 3 === 0) {
        const cvs = linesCanvasRef.current;
        if (cvs) {
          const ctx = cvs.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, cw, ch);
            const CONNECTION_DIST = 220;
            for (let i = 0; i < cards.length; i++) {
              const a = cards[i];
              const famA = compLookup.get(a.id);
              if (!famA) continue;
              for (let j = i + 1; j < cards.length; j++) {
                const b = cards[j];
                const famB = compLookup.get(b.id);
                if (!famB || famA.family !== famB.family) continue;
                const dx = a.x - b.x, dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < CONNECTION_DIST * CONNECTION_DIST && distSq > 0) {
                  const dist = Math.sqrt(distSq);
                  const alpha = (1 - dist / CONNECTION_DIST) * 0.1;
                  ctx.strokeStyle = famA.hex;
                  ctx.globalAlpha = alpha;
                  ctx.lineWidth = 0.7;
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.stroke();
                }
              }
            }
            ctx.globalAlpha = 1;
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
      container.removeEventListener("mouseleave", onMouseLeave);
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
          >
            {/* The card IS the molecular structure */}
            <div className="relative">
              {/* Soft glow behind the structure */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, ${hex}12 0%, transparent 70%)`,
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
    </>
  );
}
