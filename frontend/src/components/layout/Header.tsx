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
      <header
        className="md:hidden sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, rgba(8,13,22,0.95) 0%, rgba(8,13,22,0.85) 100%)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1a9a8a 0%, #0d7a6e 100%)",
                boxShadow: "0 0 10px rgba(26,154,138,0.25)",
              }}
            >
              <span className="text-white font-bold text-xs">JBN</span>
            </div>
            <span className="text-[#e2e8f0] font-semibold text-sm tracking-tight">
              {pageTitle}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-[#5a6478] hover:text-[#e2e8f0] transition-colors"
            >
              <Search size={20} />
            </Link>
            <div className="relative">
              <button
                onClick={toggleNotif}
                className="text-[#5a6478] hover:text-[#e2e8f0] transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1"
                    style={{
                      background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                      boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={closeNotif} />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header
        className="hidden md:block sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, rgba(6,9,15,0.9) 0%, rgba(6,9,15,0.8) 100%)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Bottom glow accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(26,154,138,0.15) 50%, transparent 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#4a5568] font-mono text-xs tracking-wide">JBN</span>
              <span className="text-[#1e293b]">/</span>
              <span className="text-[#e2e8f0] font-medium tracking-tight">{pageTitle}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="text-[#5a6478] hover:text-[#e2e8f0] transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]">
                <Search size={15} />
              </button>
              <div className="relative">
                <button
                  onClick={toggleNotif}
                  className="text-[#5a6478] hover:text-[#e2e8f0] transition-colors relative p-1.5 rounded-lg hover:bg-white/[0.04]"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1"
                      style={{
                        background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                        boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                      }}
                    >
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
