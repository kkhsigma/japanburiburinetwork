"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { mockCompounds } from "@/lib/mock-data";
import { useCompounds } from "@/hooks/useCompounds";
import { useToggleTracking } from "@/hooks/useWatchlistSync";
import type { RiskLevel, LegalStatus, Compound } from "@/types";
import { useWatchlistStore } from "@/stores/watchlistStore";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; glow: string; hex: string; gradient: string }> = {
  illegal:  { label: "違法",     color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/40",     glow: "shadow-red-500/20",     hex: "#ef4444", gradient: "radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.05) 50%, transparent 70%)" },
  high:     { label: "高リスク", color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/40",  glow: "shadow-orange-500/20",  hex: "#f97316", gradient: "radial-gradient(ellipse at 30% 20%, rgba(249,115,22,0.22) 0%, rgba(249,115,22,0.05) 50%, transparent 70%)" },
  medium:   { label: "要注意",   color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/40",   glow: "shadow-amber-500/20",   hex: "#d4a72d", gradient: "radial-gradient(ellipse at 30% 20%, rgba(212,167,45,0.22) 0%, rgba(212,167,45,0.05) 50%, transparent 70%)" },
  low:      { label: "低リスク", color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/40",     glow: "shadow-sky-500/20",     hex: "#38bdf8", gradient: "radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.20) 0%, rgba(56,189,248,0.04) 50%, transparent 70%)" },
  safe:     { label: "合法",     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/40", glow: "shadow-emerald-500/20", hex: "#22c55e", gradient: "radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.05) 50%, transparent 70%)" },
};

const statusLabels: Record<LegalStatus, string> = {
  effective: "施行済", promulgated: "公布済", official_confirmed: "確認済",
  under_review: "審査中", pending: "保留", reported: "報告済",
  unknown: "未確認", recalled: "リコール",
};

/* ── Inline mini track button (light‑theme compatible) ── */
function MiniTrackBtn({ compound }: { compound: { id: string; name: string } }) {
  const { isTracked, toggle, isLoading } = useToggleTracking(compound);
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(); }}
      disabled={isLoading}
      className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono border transition-all duration-150 ${
        isLoading ? "animate-pulse" : ""
      } ${
        isTracked
          ? "bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25"
          : "bg-white/[0.04] text-[#5a6478] border-white/[0.08] hover:text-[#8b95a8] hover:border-white/[0.15]"
      }`}
    >
      {isTracked ? "✓ 追跡中" : "+ 追跡"}
    </button>
  );
}

type FilterMode = "none" | "risk" | "family";
type FilterValue = RiskLevel | string;

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  el: HTMLElement | null;
}

const CARD_W = 172;
const CARD_H = 108;
const HEADER_HEIGHT = 130; // accounts for external navbar + subtitle + filter bar

const riskLevels: RiskLevel[] = ["illegal", "high", "medium", "low", "safe"];
const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
  { label: "ウォッチリスト", href: "/watchlist" },
  { label: "物質DB", href: "/explore" },
  { label: "タイムライン", href: "#timeline" },
  { label: "ソース", href: "#sources" },
];

export function FloatingSubstances({ hideHeader = false }: { hideHeader?: boolean }) {
  const router = useRouter();
  const watchlistEntries = useWatchlistStore((s) => s.entries);
  const { data: compoundsResult } = useCompounds();
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<FloatingCard[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const [mounted, setMounted] = useState(false);

  /* Use real API compounds when available, fallback to mock */
  const compounds: Compound[] = useMemo(() => {
    const apiData = compoundsResult?.data;
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
      return apiData.map((c) => ({
        ...c,
        risk_level: (c.risk_level?.toLowerCase() || "medium") as RiskLevel,
        legal_status_japan: (c.legal_status_japan?.toLowerCase() || "unknown") as LegalStatus,
      }));
    }
    return mockCompounds;
  }, [compoundsResult]);

  /* Derived filter lists from current compounds */
  const currentFamilies = useMemo(
    () => Array.from(new Set(compounds.map((c) => c.chemical_family ?? "Other"))),
    [compounds],
  );

  // Drag state
  const dragRef = useRef<{
    cardId: string | null;
    startX: number;
    startY: number;
    totalDist: number;
    prevX: number;
    prevY: number;
    velX: number;
    velY: number;
  }>({ cardId: null, startX: 0, startY: 0, totalDist: 0, prevX: 0, prevY: 0, velX: 0, velY: 0 });

  filterRef.current = { mode: filterMode, value: filterValue };
  const isFiltered = filterMode !== "none" && filterValue !== null;

  const compoundMatches = useCallback((compound: Compound, mode: FilterMode, value: FilterValue | null) => {
    if (mode === "none" || value === null) return true;
    if (mode === "risk") return compound.risk_level === value;
    if (mode === "family") return (compound.chemical_family ?? "Other") === value;
    return true;
  }, []);

  const updateCardDOM = useCallback((card: FloatingCard, opacity: number, scale: number) => {
    if (!card.el) return;
    card.el.style.transform = `translate(${card.x - CARD_W / 2}px, ${card.y - CARD_H / 2}px) scale(${scale})`;
    card.el.style.opacity = String(opacity);
  }, []);

  const setCardRef = useCallback((id: string, el: HTMLElement | null) => {
    const card = cardsRef.current.find((c) => c.id === id);
    if (card) card.el = el;
  }, []);

  const initCards = useCallback((w: number, h: number) => {
    const cards: FloatingCard[] = compounds.map((compound) => {
      const padX = CARD_W / 2 + 10;
      const padY = CARD_H / 2 + 10;
      const minY = HEADER_HEIGHT + padY;
      return {
        id: compound.id,
        x: padX + Math.random() * (w - padX * 2),
        y: minY + Math.random() * (h - minY - padY),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        mass: 1,
        el: null,
      };
    });
    cardsRef.current = cards;
  }, [compounds]);

  // Drag handlers
  const handleGrab = useCallback((id: string, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    dragRef.current = {
      cardId: id,
      startX: clientX,
      startY: clientY,
      totalDist: 0,
      prevX: clientX - rect.left,
      prevY: clientY - rect.top,
      velX: 0,
      velY: 0,
    };
    const card = cardsRef.current.find((c) => c.id === id);
    if (card) card.mass = 15; // very heavy while dragging — bulldozes other cards
  }, []);

  const handleDrag = useCallback((clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag.cardId) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Accumulate total distance for click detection
    drag.totalDist += Math.abs(x - drag.prevX) + Math.abs(y - drag.prevY);
    // Track velocity as smoothed delta
    drag.velX = drag.velX * 0.3 + (x - drag.prevX) * 0.7;
    drag.velY = drag.velY * 0.3 + (y - drag.prevY) * 0.7;
    drag.prevX = x;
    drag.prevY = y;

    const card = cardsRef.current.find((c) => c.id === drag.cardId);
    if (card) {
      card.x = x;
      card.y = y;
      // Full cursor velocity transferred to card
      card.vx = drag.velX;
      card.vy = drag.velY;
    }
  }, []);

  const handleRelease = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.cardId) return;
    const clickedId = drag.cardId;
    const wasDrag = drag.totalDist > 8; // px — threshold to distinguish click vs drag
    const card = cardsRef.current.find((c) => c.id === clickedId);
    if (card) {
      // Fling with full cursor velocity
      card.vx = drag.velX * 1.5;
      card.vy = drag.velY * 1.5;
      card.mass = 1;
    }
    drag.cardId = null;

    // Navigate to compound detail if it was a click (not a drag)
    if (!wasDrag) {
      router.push(`/explore/compounds/${clickedId}`);
    }
  }, [router]);

  const getGridPositions = useCallback((mode: FilterMode, value: FilterValue) => {
    const matched = compounds.filter((c) => compoundMatches(c, mode, value));
    const unmatched = compounds.filter((c) => !compoundMatches(c, mode, value));
    const cw = sizeRef.current.w || 900;
    const cols = Math.max(1, Math.floor((cw - 40) / (CARD_W + 12)));
    const gridW = cols * (CARD_W + 12) - 12;
    const startX = (cw - gridW) / 2 + CARD_W / 2;
    const startY = HEADER_HEIGHT + 30;
    const pos: Record<string, { x: number; y: number }> = {};

    matched.forEach((compound, i) => {
      pos[compound.id] = { x: startX + (i % cols) * (CARD_W + 12), y: startY + Math.floor(i / cols) * (CARD_H + 12) };
    });

    const matchedRows = Math.ceil(matched.length / cols);
    const unmStartY = startY + matchedRows * (CARD_H + 12) + 40;
    unmatched.forEach((compound, i) => {
      pos[compound.id] = { x: startX + (i % cols) * (CARD_W + 8), y: unmStartY + Math.floor(i / cols) * (CARD_H + 10) };
    });
    return pos;
  }, [compounds, compoundMatches]);

  const handleFilter = (mode: FilterMode, value: FilterValue) => {
    if (filterMode === mode && filterValue === value) {
      setFilterMode("none");
      setFilterValue(null);
    } else {
      setFilterMode(mode);
      setFilterValue(value);
      filterRef.current = { mode, value };
      const gridPos = getGridPositions(mode, value);
      for (const card of cardsRef.current) {
        if (gridPos[card.id]) {
          card.x = gridPos[card.id].x;
          card.y = gridPos[card.id].y;
          card.vx = 0;
          card.vy = 0;
          const compound = compounds.find((c) => c.id === card.id)!;
          const isMatch = compoundMatches(compound, mode, value);
          updateCardDOM(card, isMatch ? 1 : 0.25, isMatch ? 1 : 0.88);
        }
      }
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
      const { mode } = filterRef.current;

      if (mode !== "none") {
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      if (now - lastUpdate < 16) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const cards = cardsRef.current;
      const cw = sizeRef.current.w;
      const ch = sizeRef.current.h;
      if (cw === 0 || ch === 0) { animRef.current = requestAnimationFrame(tick); return; }

      const dragId = dragRef.current.cardId;

      for (const card of cards) {
        // Skip position update for dragged card (cursor controls it)
        if (card.id === dragId) continue;

        card.x += card.vx;
        card.y += card.vy;

        const padX = CARD_W / 2 + 4;
        const padY = CARD_H / 2 + 4;
        const minY = HEADER_HEIGHT + padY;
        if (card.x < padX) { card.x = padX; card.vx *= -0.8; }
        if (card.x > cw - padX) { card.x = cw - padX; card.vx *= -0.8; }
        if (card.y < minY) { card.y = minY; card.vy *= -0.8; }
        if (card.y > ch - padY) { card.y = ch - padY; card.vy *= -0.8; }

        card.vx += (Math.random() - 0.5) * 0.03;
        card.vy += (Math.random() - 0.5) * 0.03;
        const speed = Math.sqrt(card.vx ** 2 + card.vy ** 2);
        const maxSpeed = 40;
        if (speed > maxSpeed) { card.vx = (card.vx / speed) * maxSpeed; card.vy = (card.vy / speed) * maxSpeed; }
        // Damping scales with speed — fast cards slow down gradually, slow cards drift gently
        const damping = speed > 2 ? 0.985 : 0.996;
        card.vx *= damping;
        card.vy *= damping;
      }

      // Collision detection with mass-based impulse
      const collisionDist = CARD_W * 0.95;
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i], b = cards[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < collisionDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = collisionDist - dist;

            // Relative velocity along collision normal
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dvDotN = dvx * nx + dvy * ny;

            // Only resolve if approaching
            if (dvDotN < 0) {
              const totalMass = a.mass + b.mass;
              const impactSpeed = Math.abs(dvDotN);
              // Higher restitution for harder hits — scales 0.85 to 1.1
              const restitution = Math.min(0.85 + impactSpeed * 0.03, 1.1);
              const impulse = -(1 + restitution) * dvDotN / totalMass;

              if (a.id !== dragId) {
                a.vx += impulse * b.mass * nx;
                a.vy += impulse * b.mass * ny;
              }
              if (b.id !== dragId) {
                b.vx -= impulse * a.mass * nx;
                b.vy -= impulse * a.mass * ny;
              }
            }

            // Separate overlapping cards — push harder on fast impacts
            const sep = overlap * 0.6 + 2;
            if (a.id !== dragId) { a.x += nx * sep; a.y += ny * sep; }
            if (b.id !== dragId) { b.x -= nx * sep; b.y -= ny * sep; }
          }
        }
      }

      for (const card of cards) {
        updateCardDOM(card, 1, 1);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    // Global mouse/touch move and up listeners for dragging
    const onMouseMove = (e: MouseEvent) => handleDrag(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) handleDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onMouseUp = () => handleRelease();
    const onTouchEnd = () => handleRelease();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      cancelAnimationFrame(animRef.current);
    };
  }, [initCards, updateCardDOM, handleDrag, handleRelease, compounds]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      {/* Header overlay — only when not hidden */}
      {!hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute top-0 left-0 right-0 z-30"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 sm:px-8 h-11">
            <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold font-mono tracking-tighter">JBN</span>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-0.5">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href}
                    className={`px-2.5 py-1 rounded text-[12px] transition-colors ${item.active ? "text-gray-900 font-semibold bg-black/[0.05]" : "text-gray-400 hover:text-gray-700 hover:bg-black/[0.03]"}`}
                  >{item.label}</a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {searchOpen ? (
                  <motion.div initial={{ width: 32, opacity: 0 }} animate={{ width: 200, opacity: 1 }}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur border border-black/10 rounded px-2.5 py-1 shadow-sm">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input autoFocus type="text" placeholder="物質名で検索..."
                      className="bg-transparent text-[12px] text-gray-900 placeholder-gray-400 outline-none w-full"
                      onBlur={() => setSearchOpen(false)} />
                    <button onClick={() => setSearchOpen(false)}><X size={11} className="text-gray-400" /></button>
                  </motion.div>
                ) : (
                  <button onClick={() => setSearchOpen(true)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-black/[0.04] transition-colors">
                    <Search size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/[0.03] border border-black/[0.05]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-gray-500 tracking-wider">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="px-5 sm:px-8 pt-2 pb-1">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <p className="text-[13px] text-gray-500 max-w-lg leading-relaxed">
                日本の規制動向を追跡 — 物質別の法的ステータスと規制日を一覧
              </p>
              <div className="flex items-center gap-4 pb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-gray-400">監視中 {compounds.length}物質</span>
                </div>
                <span className="text-[11px] font-mono text-gray-300">|</span>
                <span className="text-[11px] font-mono text-gray-400">最終更新 12分前</span>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="px-5 sm:px-8 pt-1 pb-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {riskLevels.map((risk) => {
                const cfg = riskConfig[risk];
                const isActive = filterMode === "risk" && filterValue === risk;
                const count = compounds.filter((c) => c.risk_level === risk).length;
                return (
                  <button key={risk} onClick={() => handleFilter("risk", risk)}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all duration-200 cursor-pointer flex-shrink-0 ${isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-white/60 text-gray-500 border-black/[0.06] hover:border-black/[0.12] hover:text-gray-700"}`}
                  >{cfg.label}<span className="text-[8px] font-mono opacity-40">{count}</span></button>
                );
              })}
              <span className="text-gray-200 mx-0.5 flex-shrink-0">·</span>
              {currentFamilies.map((fam) => {
                const isActive = filterMode === "family" && filterValue === fam;
                const count = compounds.filter((c) => (c.chemical_family ?? "Other") === fam).length;
                return (
                  <button key={fam} onClick={() => handleFilter("family", fam)}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium border transition-all duration-200 cursor-pointer flex-shrink-0 ${isActive ? "bg-teal-500/10 text-teal-600 border-teal-500/30" : "bg-white/60 text-gray-500 border-black/[0.06] hover:border-black/[0.12] hover:text-gray-700"}`}
                  >{fam}<span className="text-[8px] font-mono opacity-40">{count}</span></button>
                );
              })}
              {isFiltered && (
                <button onClick={() => { setFilterMode("none"); setFilterValue(null); }}
                  className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] text-gray-400 bg-black/[0.03] border border-black/[0.05] hover:bg-black/[0.06] transition-colors cursor-pointer flex-shrink-0"
                >×</button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Subtitle + filters when header is hidden (shown inline below external navbar) */}
      {hideHeader && (
        <div className="absolute top-0 left-0 right-0 z-30 pt-14">
          <div className="px-5 sm:px-8 pt-2 pb-1">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <p className="text-[13px] text-gray-500 max-w-lg leading-relaxed">
                日本の規制動向を追跡 — 物質別の法的ステータスと規制日を一覧
              </p>
              <div className="flex items-center gap-4 pb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono text-gray-400">監視中 {compounds.length}物質</span>
                </div>
                <span className="text-[11px] font-mono text-gray-300">|</span>
                <span className="text-[11px] font-mono text-gray-400">最終更新 12分前</span>
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-8 pt-1 pb-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {riskLevels.map((risk) => {
                const cfg = riskConfig[risk];
                const isActive = filterMode === "risk" && filterValue === risk;
                const count = compounds.filter((c) => c.risk_level === risk).length;
                return (
                  <button key={risk} onClick={() => handleFilter("risk", risk)}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all duration-200 cursor-pointer flex-shrink-0 ${isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-white/60 text-gray-500 border-black/[0.06] hover:border-black/[0.12] hover:text-gray-700"}`}
                  >{cfg.label}<span className="text-[8px] font-mono opacity-40">{count}</span></button>
                );
              })}
              <span className="text-gray-200 mx-0.5 flex-shrink-0">·</span>
              {currentFamilies.map((fam) => {
                const isActive = filterMode === "family" && filterValue === fam;
                const count = compounds.filter((c) => (c.chemical_family ?? "Other") === fam).length;
                return (
                  <button key={fam} onClick={() => handleFilter("family", fam)}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium border transition-all duration-200 cursor-pointer flex-shrink-0 ${isActive ? "bg-teal-500/10 text-teal-600 border-teal-500/30" : "bg-white/60 text-gray-500 border-black/[0.06] hover:border-black/[0.12] hover:text-gray-700"}`}
                  >{fam}<span className="text-[8px] font-mono opacity-40">{count}</span></button>
                );
              })}
              {isFiltered && (
                <button onClick={() => { setFilterMode("none"); setFilterValue(null); }}
                  className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] text-gray-400 bg-black/[0.03] border border-black/[0.05] hover:bg-black/[0.06] transition-colors cursor-pointer flex-shrink-0"
                >×</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cards — rendered once, positioned via direct DOM, grabbable + clickable */}
      {mounted && compounds.map((compound) => {
        const risk = riskConfig[compound.risk_level] || riskConfig.medium;
        return (
          <div
            key={compound.id}
            ref={(el) => setCardRef(compound.id, el)}
            className="absolute z-10 will-change-transform select-none"
            style={{ width: CARD_W, opacity: 0, cursor: "grab" }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleGrab(compound.id, e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handleGrab(compound.id, e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
          >
            <div
              className="relative block rounded-xl overflow-hidden transition-all duration-200 backdrop-blur-md hover:scale-[1.03]"
              style={{
                background: `${risk.gradient}, radial-gradient(ellipse at 70% 80%, rgba(6,9,15,0.95) 0%, #0a0f1a 100%)`,
                border: `1.5px solid ${risk.hex}35`,
                boxShadow: `0 0 15px ${risk.hex}20, inset 0 1px 0 rgba(255,255,255,0.03)`,
              }}
            >
              {/* Scan-line overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)" }}
              />
              {/* Orbital arc */}
              <div
                className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.08] pointer-events-none"
                style={{ border: `1px solid ${risk.hex}` }}
              />
              <div className="relative z-10 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold font-mono text-[#e2e8f0] tracking-tight truncate mr-1">{compound.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: risk.hex, boxShadow: `0 0 6px ${risk.hex}80` }}
                    />
                    <span className={`text-[9px] font-bold font-mono tracking-wide ${risk.color}`}>{risk.label}</span>
                    {watchlistEntries.some(e => e.entity_id === compound.id) && (
                      <span className="w-2 h-2 rounded-full bg-[#1a9a8a] shadow-[0_0_4px_rgba(26,154,138,0.6)]" title="追跡中" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: risk.hex, opacity: 0.5 }} />
                    <span className="text-[10px] text-[#8b95a8] font-medium">{statusLabels[compound.legal_status_japan] || compound.legal_status_japan}</span>
                  </div>
                  {compound.chemical_family && (
                    <span className="text-[8px] text-[#5a6478] font-mono truncate max-w-[70px]">{compound.chemical_family}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1.5" style={{ borderTop: `1px solid ${risk.hex}12` }}>
                  <MiniTrackBtn compound={{ id: compound.id, name: compound.name }} />
                  <span className={`text-[9px] font-mono tracking-wide ${compound.natural_or_synthetic === "natural" ? "text-emerald-400" : "text-violet-400"}`}>
                    {compound.natural_or_synthetic === "natural" ? "NAT" : "SYN"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-4 left-5 sm:left-8 text-[10px] text-gray-400 font-mono tracking-wide z-20"
      >ノードをクリック → 詳細 / バッジをクリック → フィルタ</motion.p>
    </div>
  );
}
