"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const routeTitles: Record<string, string> = {
  "/alerts": "アラート",
  "/explore": "探索",
  "/watchlist": "ウォッチリスト",
  "/settings": "設定",
  "/profile": "プロフィール",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/alerts/")) return "アラート詳細";
  if (pathname.startsWith("/explore/")) return "成分詳細";
  return "JBN";
}

export function Header() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [notifOpen, setNotifOpen] = useState(false);
  const toggleNotif = useCallback(() => setNotifOpen((v) => !v), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

  const pageTitle = getPageTitle(pathname);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0c1220]/90 backdrop-blur-xl border-b border-[#1e293b]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1a9a8a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">JBN</span>
            </div>
            <span className="text-[#e2e8f0] font-semibold text-sm">
              {pageTitle}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-[#64748b] hover:text-[#e2e8f0] transition-colors"
            >
              <Search size={20} />
            </Link>
            <div className="relative">
              <button
                onClick={toggleNotif}
                className="text-[#64748b] hover:text-[#e2e8f0] transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#b91c1c] rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={closeNotif} />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header (utility bar inside content area) */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#06090f]/80 backdrop-blur-xl border-b border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Breadcrumb-style title */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#64748b]">JBN</span>
              <span className="text-[#1e293b]">/</span>
              <span className="text-[#e2e8f0] font-medium">{pageTitle}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="text-[#64748b] hover:text-[#e2e8f0] transition-colors">
                <Search size={16} />
              </button>
              <div className="relative">
                <button
                  onClick={toggleNotif}
                  className="text-[#64748b] hover:text-[#e2e8f0] transition-colors relative"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#b91c1c] rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationCenter isOpen={notifOpen} onClose={closeNotif} />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
