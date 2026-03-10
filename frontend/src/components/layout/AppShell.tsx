"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Compass,
  Eye,
  Settings,
} from "lucide-react";
import { Header } from "./Header";
import { TabBar } from "./TabBar";

const navItems = [
  { name: "アラート", href: "/alerts", icon: Bell },
  { name: "探索", href: "/explore", icon: Compass },
  { name: "ウォッチリスト", href: "/watchlist", icon: Eye },
  { name: "設定", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-60 flex-col overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #080d16 0%, #0a1018 50%, #060b12 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(26,154,138,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,154,138,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.4) 50%, transparent 100%)",
          }}
        />

        {/* Branding */}
        <div className="relative px-6 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center relative"
              style={{
                background: "linear-gradient(135deg, #1a9a8a 0%, #0d7a6e 100%)",
                boxShadow: "0 0 16px rgba(26,154,138,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-white font-bold text-sm tracking-tight">
                JBN
              </span>
            </div>
            <div>
              <h1 className="text-[#e2e8f0] font-bold text-sm leading-tight tracking-tight">
                JBN
              </h1>
              <p className="text-[#4a5568] text-[10px] leading-tight font-mono tracking-wide">
                Buriburi Network
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="relative flex-1 px-3 space-y-1 pt-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative block"
              >
                <motion.div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${
                      isActive
                        ? "text-[#e2e8f0]"
                        : "text-[#5a6478] hover:text-[#94a3b8]"
                    }
                  `}
                  style={isActive ? {
                    background: "linear-gradient(90deg, rgba(26,154,138,0.12) 0%, rgba(26,154,138,0.03) 100%)",
                    boxShadow: "inset 0 0 20px rgba(26,154,138,0.05)",
                  } : undefined}
                  whileHover={!isActive ? { x: 2, backgroundColor: "rgba(255,255,255,0.03)" } : { x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, #1a9a8a 0%, #0d7a6e 100%)",
                        boxShadow: "0 0 8px rgba(26,154,138,0.5)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon size={17} style={isActive ? { color: "#1a9a8a", filter: "drop-shadow(0 0 4px rgba(26,154,138,0.3))" } : undefined} />
                  <span className="tracking-wide">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* System Status */}
        <div className="relative px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-30" />
              </div>
              <span className="text-[10px] text-[#4a5568] font-mono tracking-widest uppercase">
                稼働中
              </span>
            </div>
            <span className="text-[10px] text-[#2d3748] font-mono">
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="md:pl-60">
        <Header />
        <main className="pb-20 md:pb-8 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <TabBar />
    </>
  );
}
