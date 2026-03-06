"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Eye, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { name: "アラート", href: "/alerts", icon: Bell },
  { name: "探索", href: "/explore", icon: Compass },
  { name: "ウォッチ", href: "/watchlist", icon: Eye },
  { name: "プロフ", href: "/profile", icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c1220]/90 backdrop-blur-xl border-t border-[#1e293b]">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator-mobile"
                  className="absolute -top-px left-3 right-3 h-0.5 bg-[#1a9a8a] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? "text-[#1a9a8a]" : "text-[#64748b]"
                  }
                />
              </motion.div>
              <span
                className={`text-[10px] mt-1 ${
                  isActive
                    ? "text-[#1a9a8a] font-medium"
                    : "text-[#64748b]"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
