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
        <a href="/" className="flex items-center gap-1.5 group">
          <span
            className="text-[18px] font-black font-mono tracking-[-0.05em] transition-all duration-500"
            style={{
              color: isDark ? "#1a9a8a" : "#111",
              textShadow: isDark
                ? "0 0 10px rgba(26,154,138,0.6), 0 0 30px rgba(26,154,138,0.3), 0 0 60px rgba(26,154,138,0.15)"
                : "none",
            }}
          >
            JBN
          </span>
          <span
            className="text-[9px] font-mono tracking-widest uppercase transition-colors duration-500 hidden sm:block"
            style={{
              color: isDark ? "rgba(26,154,138,0.4)" : "rgba(0,0,0,0.25)",
            }}
          >
            monitor
          </span>
        </a>

        {/* Center: Nav items */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-3.5 py-1.5 rounded-md text-[12px] transition-all duration-300 group"
              style={{
                color: item.active
                  ? isDark ? "#e2e8f0" : "#1a1d23"
                  : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                fontWeight: item.active ? 600 : 400,
                letterSpacing: "0.03em",
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
              {/* Hover bg */}
              <span
                className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  backgroundColor: isDark ? "rgba(26,154,138,0.06)" : "rgba(0,0,0,0.03)",
                }}
              />
              <span className="relative">{item.label}</span>
            </a>
          ))}
        </nav>

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
              稼働中
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
