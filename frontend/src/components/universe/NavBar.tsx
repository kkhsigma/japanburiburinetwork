"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Sun, Moon } from "lucide-react";

const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
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
        backgroundColor: isDark ? "rgba(2, 6, 12, 0.85)" : "rgba(245, 246, 248, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between px-5 sm:px-8 h-12">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center transition-colors duration-500"
              style={{ backgroundColor: isDark ? "#fff" : "#111" }}
            >
              <span
                className="text-[10px] font-bold font-mono tracking-tighter transition-colors duration-500"
                style={{ color: isDark ? "#111" : "#fff" }}
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
                className="px-2.5 py-1 rounded text-[12px] transition-colors duration-300"
                style={{
                  color: item.active
                    ? isDark ? "#e2e8f0" : "#1a1d23"
                    : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  fontWeight: item.active ? 600 : 400,
                  backgroundColor: item.active
                    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                    : "transparent",
                }}
              >
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
                className="flex items-center gap-2 rounded px-2.5 py-1 shadow-sm transition-colors duration-500"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <Search size={13} style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="物質名で検索..."
                  className="bg-transparent text-[12px] placeholder-gray-400 outline-none w-full"
                  style={{ color: isDark ? "#e2e8f0" : "#1a1d23" }}
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X size={11} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 rounded transition-colors"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
              >
                <Search size={14} />
              </button>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded transition-all duration-300 cursor-pointer"
            style={{
              color: isDark ? "#ffc83d" : "#6480c8",
              backgroundColor: isDark ? "rgba(255, 200, 60, 0.1)" : "rgba(100, 128, 200, 0.1)",
              border: isDark ? "1px solid rgba(255, 200, 60, 0.2)" : "1px solid rgba(100, 128, 200, 0.2)",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors duration-500"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className="text-[10px] font-mono tracking-wider transition-colors duration-500"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
