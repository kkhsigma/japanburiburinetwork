"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, Sun, Moon } from "lucide-react";

const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "カンナビノイド", href: "/cannabis" },
  { label: "サイケデリクス", href: "/psychedelics" },
  { label: "比較", href: "/explore" },
  { label: "アラート", href: "/alerts" },
  { label: "ウォッチリスト", href: "/watchlist" },
  { label: "ブログ", href: "/blog" },
];

// Hook to detect browser zoom level and return inverse scale
function useZoomCompensation() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const detectZoom = () => {
      // Use devicePixelRatio as base, compare with initial
      const baseRatio = 1; // Assume 100% zoom at load
      const currentRatio = window.devicePixelRatio || 1;

      // Alternative method: compare outer/inner width
      const zoomLevel = window.outerWidth / window.innerWidth;

      // Use the more reliable measurement
      const detectedZoom = Math.abs(zoomLevel - 1) > 0.01 ? zoomLevel : currentRatio / baseRatio;

      // Clamp the inverse scale to reasonable bounds
      const inverseScale = Math.min(Math.max(1 / detectedZoom, 0.5), 2);
      setScale(inverseScale);
    };

    detectZoom();
    window.addEventListener("resize", detectZoom);
    return () => window.removeEventListener("resize", detectZoom);
  }, []);

  return scale;
}

interface NavBarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function NavBar({ theme, onToggleTheme }: NavBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isDark = theme === "dark";
  const zoomScale = useZoomCompensation();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{
        backgroundColor: isDark ? "rgba(6, 9, 15, 0.85)" : "rgba(245, 246, 248, 0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Bottom accent glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.3) 30%, rgba(56,189,248,0.2) 70%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.15) 50%, transparent 100%)",
        }}
      />

      <div className="flex items-center justify-between px-5 sm:px-8 h-12">
        {/* Left: Glowing JBN logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "left center",
          }}
        >
          <span
            className="text-[20px] font-bold tracking-[-0.02em] transition-all duration-500"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: isDark ? "#1a9a8a" : "#111",
              textShadow: isDark
                ? "0 0 10px rgba(26,154,138,0.6), 0 0 30px rgba(26,154,138,0.3), 0 0 60px rgba(26,154,138,0.15)"
                : "none",
            }}
          >
            JBN
          </span>
          <span
            className="text-[10px] tracking-[0.15em] transition-colors duration-500 hidden sm:block"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: isDark ? "rgba(26,154,138,0.5)" : "rgba(0,0,0,0.3)",
              fontWeight: 500,
            }}
          >
            モニター
          </span>
        </Link>

        {/* Center: Nav items */}
        <nav
          className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
          style={{
            transform: `translateX(-50%) scale(${zoomScale})`,
            transformOrigin: "center center",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-3 py-1.5 rounded-md text-[13px] transition-all duration-300 group"
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: item.active
                  ? isDark ? "#e2e8f0" : "#1a1d23"
                  : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
                fontWeight: item.active ? 600 : 500,
                letterSpacing: "0.01em",
              }}
            >
              {/* Active indicator — glowing dot + underline */}
              {item.active && (
                <>
                  <span
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: isDark ? "#1a9a8a" : "#111",
                      boxShadow: isDark ? "0 0 6px rgba(26,154,138,0.6)" : "none",
                    }}
                  />
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full"
                    style={{
                      background: isDark
                        ? "linear-gradient(90deg, transparent, rgba(26,154,138,0.5), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)",
                    }}
                  />
                </>
              )}
              {/* Hover underline animation */}
              <span
                className="absolute bottom-0.5 left-3 right-3 h-[1.5px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, rgba(26,154,138,0.8), rgba(56,189,248,0.6))"
                    : "linear-gradient(90deg, rgba(26,154,138,0.6), rgba(0,0,0,0.3))",
                }}
              />
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: search + theme toggle + status */}
        <div
          className="flex items-center gap-2.5"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "right center",
          }}
        >
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <motion.div
                initial={{ width: 32, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-500"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(26,154,138,0.2)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isDark ? "0 0 12px rgba(26,154,138,0.1)" : "none",
                }}
              >
                <Search size={13} style={{ color: isDark ? "rgba(26,154,138,0.6)" : "rgba(0,0,0,0.4)" }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="成分を検索..."
                  className="bg-transparent text-[12px] placeholder-gray-500 outline-none w-full"
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    color: isDark ? "#e2e8f0" : "#1a1d23"
                  }}
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X size={11} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }} />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 rounded-lg transition-all hover:bg-white/[0.04]"
                style={{
                  color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                }}
              >
                <Search size={14} />
              </button>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg transition-all duration-300 cursor-pointer"
            style={{
              color: isDark ? "#ffc83d" : "#6480c8",
              backgroundColor: isDark ? "rgba(255, 200, 60, 0.08)" : "rgba(100, 128, 200, 0.08)",
              border: isDark ? "1px solid rgba(255, 200, 60, 0.15)" : "1px solid rgba(100, 128, 200, 0.15)",
            }}
            aria-label={isDark ? "ライトモードに切替" : "ダークモードに切替"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors duration-500"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.5)" }} />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-25" />
            </div>
            <span
              className="text-[10px] tracking-wider transition-colors duration-500"
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                fontWeight: 500,
              }}
            >
              稼働中
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
