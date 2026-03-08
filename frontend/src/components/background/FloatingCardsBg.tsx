"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockCompounds } from "@/lib/mock-data";
import type { RiskLevel, LegalStatus, TransitionState } from "@/types";

const riskColors: Record<RiskLevel, { label: string; text: string; bg: string; border: string }> = {
  illegal:  { label: "違法",     text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  high:     { label: "高リスク", text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  medium:   { label: "要注意",   text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  low:      { label: "低リスク", text: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20" },
  safe:     { label: "合法",     text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const statusLabels: Record<LegalStatus, string> = {
  effective: "施行済",
  promulgated: "公布済",
  official_confirmed: "確認済",
  under_review: "審査中",
  pending: "保留",
  reported: "報告済",
  unknown: "未確認",
  recalled: "リコール",
};

const families = Array.from(new Set(mockCompounds.map((c) => c.chemical_family ?? "Other")));
const riskLevels: RiskLevel[] = ["illegal", "high", "medium", "low", "safe"];

type FilterMode = "none" | "risk" | "family";
type FilterValue = RiskLevel | string;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CARD_W = 160;
const CARD_H = 100;
// Center exclusion zone — cards avoid the hero text area
const EXCLUSION_W = 500;
const EXCLUSION_H = 350;

interface FloatingCardsBgProps {
  transitionState?: TransitionState;
}

export function FloatingCardsBg({ transitionState = "idle" }: FloatingCardsBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<FloatingCard[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const transitionRef = useRef<TransitionState>("idle");
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [mounted, setMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);

  filterRef.current = { mode: filterMode, value: filterValue };
  transitionRef.current = transitionState;

  const matchesFilter = useCallback((compound: typeof mockCompounds[0]) => {
    if (filterMode === "none" || filterValue === null) return true;
    if (filterMode === "risk") return compound.risk_level === filterValue;
    if (filterMode === "family") return (compound.chemical_family ?? "Other") === filterValue;
    return true;
  }, [filterMode, filterValue]);

  const initCards = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const exW = EXCLUSION_W / 2;
    const exH = EXCLUSION_H / 2;

    const cards: FloatingCard[] = mockCompounds.map((compound) => {
      const padX = CARD_W / 2 + 10;
      const padY = CARD_H / 2 + 10;
      const topPad = 20 + padY;

      // Keep generating positions until outside exclusion zone
      let x: number, y: number;
      let attempts = 0;
      do {
        x = padX + Math.random() * (w - padX * 2);
        y = topPad + Math.random() * (h - topPad - padY);
        attempts++;
      } while (
        attempts < 50 &&
        Math.abs(x - cx) < exW + CARD_W / 2 &&
        Math.abs(y - cy) < exH + CARD_H / 2
      );

      return {
        id: compound.id,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      };
    });
    cardsRef.current = cards;
    const pos: Record<string, { x: number; y: number }> = {};
    for (const c of cards) {
      pos[c.id] = { x: c.x, y: c.y };
    }
    setPositions(pos);
  }, []);

  const getGridPositions = useCallback(() => {
    const { mode, value } = filterRef.current;
    if (mode === "none" || value === null) return null;

    const cw = sizeRef.current.w || 900;
    const matched = mockCompounds.filter((c) => {
      if (mode === "risk") return c.risk_level === value;
      if (mode === "family") return (c.chemical_family ?? "Other") === value;
      return true;
    });
    const unmatched = mockCompounds.filter((c) => {
      if (mode === "risk") return c.risk_level !== value;
      if (mode === "family") return (c.chemical_family ?? "Other") !== value;
      return false;
    });

    const cols = Math.max(1, Math.floor((cw - 40) / (CARD_W + 12)));
    const gridW = cols * (CARD_W + 12) - 12;
    const startX = (cw - gridW) / 2 + CARD_W / 2;
    const startY = 20 + 30;

    const pos: Record<string, { x: number; y: number }> = {};

    matched.forEach((compound, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[compound.id] = {
        x: startX + col * (CARD_W + 12),
        y: startY + row * (CARD_H + 12),
      };
    });

    const matchedRows = Math.ceil(matched.length / cols);
    const unmatchedStartY = startY + matchedRows * (CARD_H + 12) + 40;

    unmatched.forEach((compound, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[compound.id] = {
        x: startX + col * (CARD_W + 12),
        y: unmatchedStartY + row * (CARD_H + 10),
      };
    });

    return pos;
  }, []);

  const handleFilter = (mode: FilterMode, value: FilterValue) => {
    if (filterMode === mode && filterValue === value) {
      setFilterMode("none");
      setFilterValue(null);
    } else {
      setFilterMode(mode);
      setFilterValue(value);
      filterRef.current = { mode, value };
      const newGrid = getGridPositions();
      if (newGrid) {
        for (const card of cardsRef.current) {
          if (newGrid[card.id]) {
            card.x = newGrid[card.id].x;
            card.y = newGrid[card.id].y;
            card.vx = 0;
            card.vy = 0;
          }
        }
        setPositions(newGrid);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    sizeRef.current = { w, h };

    if (cardsRef.current.length === 0) {
      initCards(w, h);
    }
    setMounted(true);

    const onResize = () => {
      const r = container.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      for (const card of cardsRef.current) {
        card.x = Math.min(Math.max(CARD_W / 2, card.x), r.width - CARD_W / 2);
        card.y = Math.min(Math.max(20 + CARD_H / 2, card.y), r.height - CARD_H / 2);
      }
    };
    window.addEventListener("resize", onResize);

    let lastUpdate = 0;
    const tick = (now: number) => {
      const { mode } = filterRef.current;
      const ts = transitionRef.current;

      // During black hole transition — suck cards toward center
      if (ts !== "idle") {
        const cards = cardsRef.current;
        const cw = sizeRef.current.w;
        const ch = sizeRef.current.h;
        const cx = cw / 2;
        const cy = ch / 2;

        const suckStrength = ts === "collapsing" ? 0.03
          : ts === "singularity" ? 0.08
          : ts === "zoom" ? 0.15
          : 0.2;

        for (const card of cards) {
          const dx = cx - card.x;
          const dy = cy - card.y;
          card.vx += dx * suckStrength;
          card.vy += dy * suckStrength;
          card.vx *= 0.92;
          card.vy *= 0.92;
          card.x += card.vx;
          card.y += card.vy;
        }

        const pos: Record<string, { x: number; y: number }> = {};
        for (const c of cards) {
          pos[c.id] = { x: c.x, y: c.y };
        }
        setPositions(pos);
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      if (mode !== "none") {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      if (now - lastUpdate < 50) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const cards = cardsRef.current;
      const cw = sizeRef.current.w;
      const ch = sizeRef.current.h;
      if (cw === 0 || ch === 0) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const cx = cw / 2;
      const cy = ch / 2;
      const exW = EXCLUSION_W / 2 + CARD_W / 2;
      const exH = EXCLUSION_H / 2 + CARD_H / 2;

      for (const card of cards) {
        card.x += card.vx;
        card.y += card.vy;

        // Wall bounce
        const padX = CARD_W / 2 + 4;
        const padY = CARD_H / 2 + 4;
        const topPad = 20 + padY;
        if (card.x < padX) { card.x = padX; card.vx *= -0.8; }
        if (card.x > cw - padX) { card.x = cw - padX; card.vx *= -0.8; }
        if (card.y < topPad) { card.y = topPad; card.vy *= -0.8; }
        if (card.y > ch - padY) { card.y = ch - padY; card.vy *= -0.8; }

        // Center exclusion zone — push cards away from hero text area
        const relX = card.x - cx;
        const relY = card.y - cy;
        if (Math.abs(relX) < exW && Math.abs(relY) < exH) {
          // Push toward nearest edge of exclusion zone
          const pushX = relX > 0 ? exW - relX : -(exW + relX);
          const pushY = relY > 0 ? exH - relY : -(exH + relY);
          if (Math.abs(pushX) < Math.abs(pushY)) {
            card.vx += pushX * 0.04;
          } else {
            card.vy += pushY * 0.04;
          }
        }

        card.vx += (Math.random() - 0.5) * 0.02;
        card.vy += (Math.random() - 0.5) * 0.02;

        const speed = Math.sqrt(card.vx ** 2 + card.vy ** 2);
        if (speed > 0.4) {
          card.vx = (card.vx / speed) * 0.4;
          card.vy = (card.vy / speed) * 0.4;
        }

        card.vx *= 0.997;
        card.vy *= 0.997;
      }

      // Card repulsion
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i];
          const b = cards[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = CARD_W * 0.95;
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) * 0.015;
            const nx = dx / dist;
            const ny = dy / dist;
            a.vx += nx * force;
            a.vy += ny * force;
            b.vx -= nx * force;
            b.vy -= ny * force;
          }
        }
      }

      const pos: Record<string, { x: number; y: number }> = {};
      for (const c of cards) {
        pos[c.id] = { x: c.x, y: c.y };
      }
      setPositions(pos);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initCards]);

  const isTransitioning = transitionState !== "idle";
  const currentPositions = (filterMode !== "none" && filterValue !== null)
    ? (getGridPositions() ?? positions)
    : positions;

  // Compute transition opacity per phase
  const transitionOpacity = isTransitioning
    ? (transitionState === "collapsing" ? 0.4
      : transitionState === "singularity" ? 0.15
      : 0)
    : 0.55;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[2] overflow-hidden pointer-events-none"
    >
      {/* ── Filter bar ── */}
      {!isTransitioning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute left-0 right-0 z-20 px-4 sm:px-8 pointer-events-auto"
          style={{ top: "72%" }}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/25 tracking-wider mr-1 uppercase">
              リスク
            </span>
            {riskLevels.map((risk) => {
              const cfg = riskColors[risk];
              const isActive = filterMode === "risk" && filterValue === risk;
              const count = mockCompounds.filter((c) => c.risk_level === risk).length;
              return (
                <button
                  key={risk}
                  onClick={() => handleFilter("risk", risk)}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold
                    border transition-all duration-200 cursor-pointer
                    ${isActive
                      ? `${cfg.bg} ${cfg.text} border-current/30`
                      : `bg-white/[0.04] text-white/40 border-white/[0.08] hover:border-white/[0.15] hover:text-white/60`
                    }
                  `}
                >
                  {cfg.label}
                  <span className="text-[8px] font-mono opacity-50">{count}</span>
                </button>
              );
            })}

            <span className="text-white/10 mx-1">|</span>

            <span className="text-[9px] font-mono text-white/25 tracking-wider mr-1 uppercase">
              分類
            </span>
            {families.map((fam) => {
              const isActive = filterMode === "family" && filterValue === fam;
              const count = mockCompounds.filter((c) => (c.chemical_family ?? "Other") === fam).length;
              return (
                <button
                  key={fam}
                  onClick={() => handleFilter("family", fam)}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
                    border transition-all duration-200 cursor-pointer
                    ${isActive
                      ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                      : "bg-white/[0.04] text-white/40 border-white/[0.08] hover:border-white/[0.15] hover:text-white/60"
                    }
                  `}
                >
                  {fam}
                  <span className="text-[8px] font-mono opacity-50">{count}</span>
                </button>
              );
            })}

            {filterMode !== "none" && (
              <button
                onClick={() => { setFilterMode("none"); setFilterValue(null); }}
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] text-white/30 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Floating cards ── */}
      {mounted && (
        <AnimatePresence>
          {mockCompounds.map((compound) => {
            const pos = currentPositions[compound.id];
            if (!pos) return null;

            const risk = riskColors[compound.risk_level];
            const isMatch = matchesFilter(compound);
            const isDimmed = filterMode !== "none" && !isMatch;

            const cardOpacity = isTransitioning
              ? transitionOpacity
              : isDimmed ? 0.08 : 0.55;

            return (
              <motion.div
                key={compound.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  x: pos.x - CARD_W / 2,
                  y: pos.y - CARD_H / 2,
                  opacity: cardOpacity,
                  scale: isDimmed ? 0.85 : (isTransitioning && transitionState !== "collapsing" ? 0.3 : 1),
                }}
                transition={
                  isTransitioning
                    ? { duration: 0.05, ease: "linear" }
                    : filterMode !== "none"
                    ? { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }
                    : { duration: 0.05, ease: "linear" }
                }
                className="absolute pointer-events-none"
                style={{ width: CARD_W }}
              >
                <div
                  className={`
                    rounded-lg border p-2.5
                    bg-white/[0.04] backdrop-blur-[2px]
                    ${risk.border}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold font-mono text-white/80 tracking-tight">
                      {compound.name}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${risk.bg} ${risk.text} tracking-wide`}>
                      {risk.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-[9px] text-white/40 font-medium">
                        {statusLabels[compound.legal_status_japan]}
                      </span>
                    </div>
                    {compound.chemical_family && (
                      <span className="text-[7px] text-white/20 font-mono truncate max-w-[60px]">
                        {compound.chemical_family}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-[8px] text-white/25 font-mono tracking-wide">
                      {formatDate(compound.legal_status_updated_at)}
                    </span>
                    <span className={`text-[8px] font-mono tracking-wide ${
                      compound.natural_or_synthetic === "natural"
                        ? "text-emerald-500/50"
                        : "text-violet-500/50"
                    }`}>
                      {compound.natural_or_synthetic === "natural" ? "NAT" : "SYN"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
