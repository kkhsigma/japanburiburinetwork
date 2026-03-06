"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Eye, Search, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-800 border-t border-navy-600 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
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
                    className="absolute -top-px left-2 right-2 h-0.5 bg-accent-green rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-accent-green" : "text-gray-500"}
                  />
                </motion.div>
                <span
                  className={`text-2xs mt-1 ${
                    isActive ? "text-accent-green font-medium" : "text-gray-500"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-64 bg-navy-800 border-r border-navy-600 flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JBN</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Japan Botanical</h1>
              <p className="text-gray-400 text-2xs">Network</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive
                    ? "text-white bg-navy-700"
                    : "text-gray-400 hover:text-gray-200 hover:bg-navy-700/50"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator-desktop"
                    className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-green rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={18} />
                {tab.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-navy-600">
          <p className="text-2xs text-gray-500 text-center">
            JBN v0 - Regulatory Intelligence
          </p>
        </div>
      </nav>
    </>
  );
}
