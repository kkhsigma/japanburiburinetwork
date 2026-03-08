"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { mockCompounds } from "@/lib/mock-data";
import type { RiskLevel, LegalStatus } from "@/types";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; glow: string }> = {
  illegal:  { label: "違法",     color: "text-red-600",     bg: "bg-red-500/10",     border: "border-red-400/30",     glow: "shadow-red-500/5" },
  high:     { label: "高リスク", color: "text-orange-600",  bg: "bg-orange-500/10",  border: "border-orange-400/30",  glow: "shadow-orange-500/5" },
  medium:   { label: "要注意",   color: "text-amber-600",   bg: "bg-amber-500/10",   border: "border-amber-400/30",   glow: "shadow-amber-500/5" },
  low:      { label: "低リスク", color: "text-sky-600",     bg: "bg-sky-500/10",     border: "border-sky-400/30",     glow: "shadow-sky-500/5" },
  safe:     { label: "合法",     color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-400/30", glow: "shadow-emerald-500/5" },
};

const statusLabels: Record<LegalStatus, string> = {
  effective: "施行済", promulgated: "公布済", official_confirmed: "確認済",
  under_review: "審査中", pending: "保留", reported: "報告済",
  unknown: "未確認", recalled: "リコール",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

type FilterMode = "none" | "risk" | "family";
type FilterValue = RiskLevel | string;

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  el: HTMLElement | null;
}

const CARD_W = 172;
const CARD_H = 108;
const HEADER_HEIGHT = 90;

const riskLevels: RiskLevel[] = ["illegal", "high", "medium", "low", "safe"];
const families = Array.from(new Set(mockCompounds.map((c) => c.chemical_family ?? "Other")));

const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
  { label: "物質DB", href: "/explore" },
  { label: "タイムライン", href: "#timeline" },
  { label: "ソース", href: "#sources" },
];

export function FloatingSubstances() {
  const [filterMode, setFilterMode] = useState<FilterMode>("none");
  const [filterValue, setFilterValue] = useState<FilterValue | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<FloatingCard[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const filterRef = useRef<{ mode: FilterMode; value: FilterValue | null }>({ mode: "none", value: null });
  const [mounted, setMounted] = useState(false);

  filterRef.current = { mode: filterMode, value: filterValue };
  const isFiltered = filterMode !== "none" && filterValue !== null;

  const compoundMatches = useCallback((compound: typeof mockCompounds[0], mode: FilterMode, value: FilterValue | null) => {
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
    const cards: FloatingCard[] = mockCompounds.map((compound) => {
      const padX = CARD_W / 2 + 10;
      const padY = CARD_H / 2 + 10;
      const minY = HEADER_HEIGHT + padY;
      return {
        id: compound.id,
        x: padX + Math.random() * (w - padX * 2),
        y: minY + Math.random() * (h - minY - padY),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        el: null,
      };
    });
    cardsRef.current = cards;
  }, []);

  const getGridPositions = useCallback((mode: FilterMode, value: FilterValue) => {
    const matched = mockCompounds.filter((c) => compoundMatches(c, mode, value));
    const unmatched = mockCompounds.filter((c) => !compoundMatches(c, mode, value));
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
  }, [compoundMatches]);

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
          const compound = mockCompounds.find((c) => c.id === card.id)!;
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

      if (now - lastUpdate < 33) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastUpdate = now;

      const cards = cardsRef.current;
      const cw = sizeRef.current.w;
      const ch = sizeRef.current.h;
      if (cw === 0 || ch === 0) { animRef.current = requestAnimationFrame(tick); return; }

      for (const card of cards) {
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
        if (speed > 0.6) { card.vx = (card.vx / speed) * 0.6; card.vy = (card.vy / speed) * 0.6; }
        card.vx *= 0.996;
        card.vy *= 0.996;
      }

      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i], b = cards[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CARD_W * 0.95 && dist > 0) {
            const f = (CARD_W * 0.95 - dist) * 0.02;
            const nx = dx / dist, ny = dy / dist;
            a.vx += nx * f; a.vy += ny * f;
            b.vx -= nx * f; b.vy -= ny * f;
          }
        }
      }

      for (const card of cards) {
        updateCardDOM(card, 1, 1);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initCards, updateCardDOM]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      {/* Header overlay */}
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
                <span className="text-[11px] font-mono text-gray-400">監視中 {mockCompounds.length}物質</span>
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
              const count = mockCompounds.filter((c) => c.risk_level === risk).length;
              return (
                <button key={risk} onClick={() => handleFilter("risk", risk)}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all duration-200 cursor-pointer flex-shrink-0 ${isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-white/60 text-gray-500 border-black/[0.06] hover:border-black/[0.12] hover:text-gray-700"}`}
                >{cfg.label}<span className="text-[8px] font-mono opacity-40">{count}</span></button>
              );
            })}
            <span className="text-gray-200 mx-0.5 flex-shrink-0">·</span>
            {families.map((fam) => {
              const isActive = filterMode === "family" && filterValue === fam;
              const count = mockCompounds.filter((c) => (c.chemical_family ?? "Other") === fam).length;
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

      {/* Cards — rendered once, positioned via direct DOM */}
      {mounted && mockCompounds.map((compound) => {
        const risk = riskConfig[compound.risk_level];
        return (
          <div
            key={compound.id}
            ref={(el) => setCardRef(compound.id, el)}
            className="absolute z-10 will-change-transform"
            style={{ width: CARD_W, opacity: 0 }}
          >
            <Link href={`/explore/compounds/${compound.id}`}
              className={`block rounded-lg border p-3 transition-colors duration-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md ${risk.glow} ${risk.border} cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-bold font-mono text-gray-900 tracking-tight">{compound.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${risk.bg} ${risk.color} tracking-wide`}>{risk.label}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-current opacity-50" style={{ color: "inherit" }} />
                  <span className="text-[10px] text-gray-500 font-medium">{statusLabels[compound.legal_status_japan]}</span>
                </div>
                {compound.chemical_family && (
                  <span className="text-[8px] text-gray-400 font-mono truncate max-w-[70px]">{compound.chemical_family}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-black/[0.04]">
                <span className="text-[9px] text-gray-400 font-mono tracking-wide">{formatDate(compound.legal_status_updated_at)}</span>
                <span className={`text-[9px] font-mono tracking-wide ${compound.natural_or_synthetic === "natural" ? "text-emerald-500" : "text-violet-500"}`}>
                  {compound.natural_or_synthetic === "natural" ? "NAT" : "SYN"}
                </span>
              </div>
            </Link>
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
