"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const navItems = [
  { label: "ダッシュボード", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
  { label: "物質", href: "/explore" },
  { label: "タイムライン", href: "#timeline" },
  { label: "ソース", href: "#sources" },
];

export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-200/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/universe" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <span className="text-teal-600 text-xs font-bold tracking-tight">J</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 tracking-wide">
                JBN
              </span>
            </a>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    item.active
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <motion.div
                  initial={{ width: 32, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
                >
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="検索..."
                    className="bg-transparent text-xs text-gray-900 placeholder-gray-400 outline-none w-full"
                    onBlur={() => setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)}>
                    <X size={12} className="text-gray-400" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Search size={15} />
                </button>
              )}
            </div>

            {/* System status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
              <span className="text-2xs font-mono text-gray-500">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
