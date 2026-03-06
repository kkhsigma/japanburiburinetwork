"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { useNotificationStore, type Notification, type NotificationType } from "@/stores/notificationStore";

const typeConfig: Record<
  NotificationType,
  {
    borderColor: string;
    icon: typeof AlertTriangle;
    iconColor: string;
    bgColor: string;
  }
> = {
  critical: {
    borderColor: "border-l-[#b91c1c]",
    icon: AlertTriangle,
    iconColor: "text-[#b91c1c]",
    bgColor: "bg-[#b91c1c]/5",
  },
  warning: {
    borderColor: "border-l-[#d4a72d]",
    icon: AlertCircle,
    iconColor: "text-[#d4a72d]",
    bgColor: "bg-[#d4a72d]/5",
  },
  info: {
    borderColor: "border-l-[#1a9a8a]",
    icon: Info,
    iconColor: "text-[#1a9a8a]",
    bgColor: "bg-[#1a9a8a]/5",
  },
  success: {
    borderColor: "border-l-[#22c55e]",
    icon: CheckCircle,
    iconColor: "text-[#22c55e]",
    bgColor: "bg-[#22c55e]/5",
  },
};

interface ToastItem {
  notification: Notification;
  visible: boolean;
}

export function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Track new notifications and show them as toasts
  useEffect(() => {
    const newNotifications = notifications.filter(
      (n) => !n.read && !seenIds.has(n.id)
    );

    if (newNotifications.length > 0) {
      setSeenIds((prev) => {
        const next = new Set(prev);
        newNotifications.forEach((n) => next.add(n.id));
        return next;
      });

      setToasts((prev) => {
        const newToasts = newNotifications.map((n) => ({
          notification: n,
          visible: true,
        }));
        // Keep max 3 toasts
        return [...newToasts, ...prev].slice(0, 3);
      });
    }
  }, [notifications, seenIds]);

  // Auto-dismiss non-critical toasts after 8 seconds
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    toasts.forEach((toast) => {
      if (toast.notification.type !== "critical" && toast.visible) {
        const timer = setTimeout(() => {
          handleDismissToast(toast.notification.id);
        }, 8000);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  const handleDismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.notification.id === id ? { ...t, visible: false } : t
      )
    );
    // Clean up after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.notification.id !== id));
    }, 300);
  };

  const handleAction = (id: string, alertId?: string) => {
    markRead(id);
    handleDismissToast(id);
    if (alertId) {
      window.location.href = `/alerts/${alertId}`;
    }
  };

  return (
    <div className="fixed top-4 right-4 md:right-6 z-[90] flex flex-col gap-2 w-[calc(100%-2rem)] md:w-[400px] max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto">
      <AnimatePresence mode="popLayout">
        {toasts
          .filter((t) => t.visible)
          .map((toast, index) => {
            const config = typeConfig[toast.notification.type];
            const Icon = config.icon;
            const isCompressed = index >= 1;

            return (
              <motion.div
                key={toast.notification.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{
                  opacity: isCompressed ? 0.7 : 1,
                  y: 0,
                  scale: isCompressed ? 0.97 : 1,
                }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`
                  relative rounded-lg border-l-4 border border-[#1e293b]
                  ${config.borderColor} ${config.bgColor}
                  bg-[#111827] backdrop-blur-xl shadow-2xl
                  overflow-hidden
                `}
              >
                <div className="px-4 py-3 flex items-start gap-3">
                  <Icon size={18} className={`${config.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e2e8f0] truncate">
                      {toast.notification.title}
                    </p>
                    {!isCompressed && (
                      <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                        {toast.notification.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismissToast(toast.notification.id)}
                    className="text-[#64748b] hover:text-[#e2e8f0] transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                {!isCompressed && toast.notification.alertId && (
                  <div className="px-4 pb-3 flex justify-end">
                    <button
                      onClick={() =>
                        handleAction(
                          toast.notification.id,
                          toast.notification.alertId
                        )
                      }
                      className="text-xs font-medium text-[#1a9a8a] hover:text-[#22d3b7] transition-colors"
                    >
                      詳細を見る
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
