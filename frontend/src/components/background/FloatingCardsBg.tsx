"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
  effective: "施行済", promulgated: "公布済", official_confirmed: "確認済",
  under_review: "審査中", pending: "保留", reported: "報告済",
  unknown: "未確認", recalled: "リコール",
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
  el: HTMLDivElement | null;
}

const CARD_W = 160;
const CARD_H = 100;
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
  const transitionRef = useRef<TransitionState>("idle");
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const [mounted, setMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);


  transitionRef.current = transitionState;
  filterRef.current = { mode: filterMode, value: filterValue };

  // Direct DOM update — no React re-render
  const updateCardDOM = useCallback((card: FloatingCard, opacity: number, scale: number) => {
    if (!card.el) return;
    card.el.style.transform = `translate(${card.x - CARD_W / 2}px, ${card.y - CARD_H / 2}px) scale(${scale})`;
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
      do {
        x = padX + Math.random() * (w - padX * 2);
        y = padY + Math.random() * (h - padY * 2);
        attempts++;
      } while (attempts < 50 && Math.abs(x - cx) < exW && Math.abs(y - cy) < exH);

      return {
        id: compound.id, x, y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        el: null,
      };
    });
    cardsRef.current = cards;
  }, []);

  const applyFilter = useCallback((mode: FilterMode, value: FilterValue | null) => {
    for (const card of cardsRef.current) {
      const compound = mockCompounds.find((c) => c.id === card.id)!;
      if (mode === "none" || !value) {
        updateCardDOM(card, 0.55, 1);
      } else {
        const isMatch = mode === "risk"
          ? compound.risk_level === value
          : (compound.chemical_family ?? "Other") === value;
        updateCardDOM(card, isMatch ? 0.85 : 0.06, isMatch ? 1.05 : 0.8);
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

    const onResize = () => {
      const r = container.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
    };
    window.addEventListener("resize", onResize);

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
          updateCardDOM(card, opacity, scale);
        }
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // Throttle to ~20fps
      if (now - lastUpdate < 50) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const cx = cw / 2;
      const cy = ch / 2;
      const exW = EXCLUSION_W / 2 + CARD_W / 2;
      const exH = EXCLUSION_H / 2 + CARD_H / 2;

      for (const card of cards) {
        card.x += card.vx;
        card.y += card.vy;

        const padX = CARD_W / 2 + 4;
        const padY = CARD_H / 2 + 4;
        if (card.x < padX) { card.x = padX; card.vx *= -0.8; }
        if (card.x > cw - padX) { card.x = cw - padX; card.vx *= -0.8; }
        if (card.y < padY) { card.y = padY; card.vy *= -0.8; }
        if (card.y > ch - padY) { card.y = ch - padY; card.vy *= -0.8; }

        // Center exclusion
        const relX = card.x - cx;
        const relY = card.y - cy;
        if (Math.abs(relX) < exW && Math.abs(relY) < exH) {
          const pushX = relX > 0 ? exW - relX : -(exW + relX);
          const pushY = relY > 0 ? exH - relY : -(exH + relY);
          if (Math.abs(pushX) < Math.abs(pushY)) card.vx += pushX * 0.04;
          else card.vy += pushY * 0.04;
        }

        card.vx += (Math.random() - 0.5) * 0.02;
        card.vy += (Math.random() - 0.5) * 0.02;
        const speed = Math.sqrt(card.vx ** 2 + card.vy ** 2);
        if (speed > 0.4) { card.vx = (card.vx / speed) * 0.4; card.vy = (card.vy / speed) * 0.4; }
        card.vx *= 0.997;
        card.vy *= 0.997;
      }

      // Card repulsion
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i], b = cards[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CARD_W * 0.95 && dist > 0) {
            const f = (CARD_W * 0.95 - dist) * 0.015;
            const nx = dx / dist, ny = dy / dist;
            a.vx += nx * f; a.vy += ny * f;
            b.vx -= nx * f; b.vy -= ny * f;
          }
        }
      }

      // Direct DOM update — respect active filter
      const f = filterRef.current;
      for (const card of cards) {
        if (f.mode === "none" || !f.value) {
          updateCardDOM(card, 0.55, 1);
        } else {
          const compound = mockCompounds.find((c) => c.id === card.id)!;
          const isMatch = f.mode === "risk"
            ? compound.risk_level === f.value
            : (compound.chemical_family ?? "Other") === f.value;
          updateCardDOM(card, isMatch ? 0.85 : 0.06, isMatch ? 1.05 : 0.8);
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initCards, updateCardDOM]);

  const isTransitioning = transitionState !== "idle";

  return (
    <>
    {/* Filter bar — outside the pointer-events-none container, above hero z-10 */}
    {!isTransitioning && (
      <div
        className="absolute left-0 right-0 z-20 px-4 sm:px-8"
        style={{ top: "72%" }}
      >
        <div className="flex flex-col gap-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.08] px-3 py-2.5 w-fit">
          {/* Risk level row */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/40 tracking-wider mr-1 uppercase">リスク</span>
            {riskLevels.map((risk) => {
              const cfg = riskColors[risk];
              const isActive = filterMode === "risk" && filterValue === risk;
              const count = mockCompounds.filter((c) => c.risk_level === risk).length;
              return (
                <button key={risk} onClick={() => handleFilter("risk", risk)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold border transition-all duration-200 cursor-pointer ${isActive ? `${cfg.bg} ${cfg.text} border-current/30` : "bg-white/[0.06] text-white/50 border-white/[0.1] hover:border-white/[0.2] hover:text-white/70 hover:bg-white/[0.1]"}`}
                >{cfg.label}<span className="text-[8px] font-mono opacity-50">{count}</span></button>
              );
            })}
            {filterMode === "risk" && (
              <button onClick={() => { restoreFloating(); }}
                className="ml-1 px-1.5 py-1 rounded text-[10px] text-white/40 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.12] transition-colors cursor-pointer"
              >×</button>
            )}
          </div>
          {/* Chemical family row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-mono text-white/40 tracking-wider mr-1 uppercase">分類</span>
            {families.map((fam) => {
              const isActive = filterMode === "family" && filterValue === fam;
              const count = mockCompounds.filter((c) => (c.chemical_family ?? "Other") === fam).length;
              return (
                <button key={fam} onClick={() => handleFilter("family", fam)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium border transition-all duration-200 cursor-pointer ${isActive ? "bg-teal-500/15 text-teal-400 border-teal-500/30" : "bg-white/[0.06] text-white/50 border-white/[0.1] hover:border-white/[0.2] hover:text-white/70 hover:bg-white/[0.1]"}`}
                >{fam}<span className="text-[8px] font-mono opacity-50">{count}</span></button>
              );
            })}
            {filterMode === "family" && (
              <button onClick={() => { restoreFloating(); }}
                className="ml-1 px-1.5 py-1 rounded text-[10px] text-white/40 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.12] transition-colors cursor-pointer"
              >×</button>
            )}
          </div>
        </div>
      </div>
    )}

    <div
      ref={containerRef}
      className="absolute inset-0 z-[2] overflow-hidden pointer-events-none"
    >
      {/* Cards — rendered once, positioned via direct DOM */}
      {mounted && mockCompounds.map((compound) => {
        const risk = riskColors[compound.risk_level];
        return (
          <div
            key={compound.id}
            ref={(el) => setCardRef(compound.id, el)}
            className="absolute will-change-transform"
            style={{ width: CARD_W, opacity: 0 }}
          >
            <div className={`rounded-lg border p-2.5 bg-white/[0.04] backdrop-blur-[2px] ${risk.border}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-bold font-mono text-white/80 tracking-tight">{compound.name}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${risk.bg} ${risk.text} tracking-wide`}>{risk.label}</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-[9px] text-white/40 font-medium">{statusLabels[compound.legal_status_japan]}</span>
                </div>
                {compound.chemical_family && (
                  <span className="text-[7px] text-white/20 font-mono truncate max-w-[60px]">{compound.chemical_family}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span className="text-[8px] text-white/25 font-mono tracking-wide">{formatDate(compound.legal_status_updated_at)}</span>
                <span className={`text-[8px] font-mono tracking-wide ${compound.natural_or_synthetic === "natural" ? "text-emerald-500/50" : "text-violet-500/50"}`}>
                  {compound.natural_or_synthetic === "natural" ? "NAT" : "SYN"}
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
