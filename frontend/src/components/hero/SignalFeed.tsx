"use client";

import { motion } from "framer-motion";
import { mockAlerts } from "@/lib/mock-data";
import type { AlertSeverity } from "@/types";

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#1a9a8a",
  low: "#6b7280",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffD > 30) {
    const months = Math.floor(diffD / 30);
    return `${months}ヶ月前`;
  }
  if (diffD > 0) return `${diffD}日前`;
  if (diffH > 0) return `${diffH}時間前`;
  if (diffMin > 0) return `${diffMin}分前`;
  return "たった今";
}

const recentAlerts = mockAlerts
  .sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )
  .slice(0, 3);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 1.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function SignalFeed() {
  return (
    <section className="relative z-10 pb-24">
      <motion.div
        className="mx-auto max-w-xl px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: "rgba(26, 154, 138, 0.4)" }}
        >
          最新シグナル
        </motion.p>

        <div className="flex flex-col gap-2">
          {recentAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={itemVariants}
              className="flex items-center gap-3 rounded-md px-4 py-2.5"
              style={{
                backgroundColor: "rgba(12, 18, 32, 0.5)",
                border: "1px solid rgba(26, 154, 138, 0.06)",
              }}
            >
              {/* Severity dot */}
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: SEVERITY_COLORS[alert.severity],
                  boxShadow: `0 0 4px ${SEVERITY_COLORS[alert.severity]}40`,
                }}
              />

              {/* Title */}
              <span
                className="flex-1 truncate text-xs"
                style={{ color: "rgba(232, 236, 241, 0.5)" }}
              >
                {alert.title}
              </span>

              {/* Time */}
              <span
                className="flex-shrink-0 font-mono text-[10px]"
                style={{ color: "rgba(232, 236, 241, 0.2)" }}
              >
                {timeAgo(alert.published_at)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
