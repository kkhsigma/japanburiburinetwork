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
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-60 bg-[#0c1220] border-r border-[#1e293b] flex-col">
        {/* Branding */}
        <div className="px-6 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a9a8a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">
                JBN
              </span>
            </div>
            <div>
              <h1 className="text-[#e2e8f0] font-bold text-sm leading-tight">
                JBN
              </h1>
              <p className="text-[#64748b] text-[10px] leading-tight">
                Japan Buriburi Network
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 space-y-0.5">
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
                    transition-colors duration-150
                    ${
                      isActive
                        ? "text-[#1a9a8a] bg-[#1a9a8a]/5"
                        : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#111827]"
                    }
                  `}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#1a9a8a] rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon size={18} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* System Status */}
        <div className="px-4 py-4 border-t border-[#1e293b]">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
              <span className="text-[10px] text-[#64748b] font-medium tracking-wide uppercase">
                稼働中
              </span>
            </div>
            <span className="text-[10px] text-[#64748b]/50 font-mono">
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
