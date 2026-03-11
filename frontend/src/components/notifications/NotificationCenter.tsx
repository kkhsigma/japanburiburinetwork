"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useNotificationStore, type NotificationType } from "@/stores/notificationStore";

const severityDotColor: Record<NotificationType, string> = {
  critical: "bg-[#b91c1c]",
  warning: "bg-[#d4a72d]",
  info: "bg-[#1a9a8a]",
  success: "bg-[#22c55e]",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the bell click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-full right-0 mt-2 w-[360px] max-h-[480px] bg-[#111111] border border-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <h3 className="text-sm font-semibold text-[#e2e8f0]">
              通知
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-[#94a3b8]">
                  {unreadCount}件未読
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#1a9a8a] hover:text-[#22d3b7] transition-colors"
              >
                <Check size={12} />
                すべて既読
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[420px] divide-y divide-[#1e1e1e]/50">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-[#64748b]">通知はまだありません</p>
                <p className="text-xs text-[#64748b]/60 mt-1">
                  規制の更新情報がここに表示されます
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    markRead(notification.id);
                    if (notification.alertId) {
                      onClose();
                      window.location.href = `/alerts/${notification.alertId}`;
                    }
                  }}
                  className={`
                    w-full text-left px-4 py-3 flex items-start gap-3
                    hover:bg-[#1a1a1a] transition-colors
                    ${!notification.read ? "bg-[#0a0a0a]" : ""}
                  `}
                >
                  {/* Severity dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        severityDotColor[notification.type]
                      } ${!notification.read ? "ring-2 ring-white/10" : "opacity-50"}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        !notification.read
                          ? "font-semibold text-[#e2e8f0]"
                          : "text-[#94a3b8]"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5 truncate">
                      {notification.description}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-[10px] text-[#64748b] flex-shrink-0 mt-0.5">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
