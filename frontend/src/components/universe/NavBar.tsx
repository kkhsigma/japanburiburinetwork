"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Sun, Moon } from "lucide-react";

const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
  { label: "ウォッチリスト", href: "/watchlist" },
  { label: "物質DB", href: "/explore" },
  { label: "タイムライン", href: "#timeline" },
  { label: "ソース", href: "#sources" },
];

interface NavBarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function NavBar({ theme, onToggleTheme }: NavBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{
        backgroundColor: isDark ? "rgba(6, 9, 15, 0.88)" : "rgba(245, 246, 248, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Bottom accent glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.25) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.15) 50%, transparent 100%)",
        }}
      />

      <div className="flex items-center justify-between px-5 sm:px-8 h-12">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #1a9a8a 0%, #0d7a6e 100%)"
                  : "linear-gradient(135deg, #111 0%, #222 100%)",
                boxShadow: isDark ? "0 0 12px rgba(26,154,138,0.25)" : "none",
              }}
            >
              <span
                className="text-[10px] font-bold font-mono tracking-tighter text-white"
              >
                JBN
              </span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-3 py-1.5 rounded-lg text-[12px] transition-all duration-300"
                style={{
                  color: item.active
                    ? isDark ? "#e2e8f0" : "#1a1d23"
                    : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                  fontWeight: item.active ? 600 : 400,
                  backgroundColor: item.active
                    ? isDark ? "rgba(26,154,138,0.1)" : "rgba(0,0,0,0.05)"
                    : "transparent",
                  letterSpacing: "0.02em",
                }}
              >
                {item.active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full"
                    style={{
                      background: isDark
                        ? "linear-gradient(90deg, transparent, rgba(26,154,138,0.6), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent)",
                    }}
                  />
                )}
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right: search + theme toggle + status */}
        <div className="flex items-center gap-2.5">
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
                  placeholder="物質名で検索..."
                  className="bg-transparent text-[12px] placeholder-gray-500 outline-none w-full"
                  style={{ color: isDark ? "#e2e8f0" : "#1a1d23" }}
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X size={11} style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)" }} />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 rounded-lg transition-all"
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
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
              className="text-[10px] font-mono tracking-wider transition-colors duration-500"
              style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
            >
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
