"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

const navItems = [
  { label: "モニター", href: "/universe", active: true },
  { label: "アラート", href: "/alerts" },
  { label: "物質DB", href: "/explore" },
  { label: "タイムライン", href: "#timeline" },
  { label: "ソース", href: "#sources" },
];

export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 border-b border-black/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold font-mono tracking-tighter">JBN</span>
              </div>
            </a>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-2.5 py-1 rounded text-[12px] transition-colors ${
                    item.active
                      ? "text-gray-900 font-semibold bg-black/[0.05]"
                      : "text-gray-400 hover:text-gray-700 hover:bg-black/[0.03]"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <motion.div
                  initial={{ width: 32, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  className="flex items-center gap-2 bg-white border border-black/10 rounded px-2.5 py-1 shadow-sm"
                >
                  <Search size={13} className="text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="物質名で検索..."
                    className="bg-transparent text-[12px] text-gray-900 placeholder-gray-400 outline-none w-full"
                    onBlur={() => setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)}>
                    <X size={11} className="text-gray-400" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-black/[0.04] transition-colors"
                >
                  <Search size={14} />
                </button>
              )}
            </div>

            {/* System status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/[0.03] border border-black/[0.05]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
