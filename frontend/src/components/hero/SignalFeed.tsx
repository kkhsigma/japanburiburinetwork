"use client";

import { motion } from "framer-motion";
import { mockAlerts, mockCompounds } from "@/lib/mock-data";
import { AlertTriangle, Clock, Shield } from "lucide-react";
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

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// Upcoming enforcement deadlines — alerts with future effective_at dates
const upcomingDeadlines = mockAlerts
  .filter((a) => a.effective_at && new Date(a.effective_at).getTime() > Date.now())
  .sort((a, b) => new Date(a.effective_at!).getTime() - new Date(b.effective_at!).getTime())
  .slice(0, 4);

// Already-enforced recent changes
const recentChanges = mockAlerts
  .filter((a) => a.effective_at && new Date(a.effective_at).getTime() <= Date.now())
  .sort((a, b) => new Date(b.effective_at!).getTime() - new Date(a.effective_at!).getTime())
  .slice(0, 3);

const recentAlerts = mockAlerts
  .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  .slice(0, 4);

// Risk overview stats
const riskCounts = {
  illegal: mockCompounds.filter((c) => c.risk_level === "illegal").length,
  high: mockCompounds.filter((c) => c.risk_level === "high").length,
  medium: mockCompounds.filter((c) => c.risk_level === "medium").length,
  safe: mockCompounds.filter((c) => c.risk_level === "safe" || c.risk_level === "low").length,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function SignalFeed() {
  return (
    <section id="radar-section" className="relative z-10 pb-32">
      <motion.div
        className="mx-auto max-w-5xl px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Section header */}
        <motion.div variants={itemVariants} className="mb-10 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(26,154,138,0.35), transparent)" }} />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(26, 154, 138, 0.7)", textShadow: "0 0 12px rgba(26,154,138,0.3)" }}>
            規制レーダー
          </p>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(26,154,138,0.35), transparent)" }} />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Upcoming Deadlines */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} style={{ color: "#ef4444" }} />
              <h3 className="font-mono text-[12px] font-semibold uppercase tracking-wider" style={{ color: "rgba(232, 236, 241, 0.8)" }}>
                施行カウントダウン
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((alert) => {
                  const days = daysUntil(alert.effective_at!);
                  const color = SEVERITY_COLORS[alert.severity];
                  const isUrgent = days <= 30;
                  return (
                    <motion.div
                      key={alert.id}
                      variants={itemVariants}
                      className="group relative rounded-lg px-4 py-3 transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        backgroundColor: "rgba(12, 18, 32, 0.92)",
                        border: `1px solid ${color}25`,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                      }}
                      whileHover={{ borderColor: `${color}50` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isUrgent && (
                              <AlertTriangle size={11} style={{ color }} className="shrink-0" />
                            )}
                            <span className="text-[11px] font-semibold truncate" style={{ color: "rgba(232,236,241,0.85)" }}>
                              {alert.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {alert.compounds.slice(0, 4).map((c) => (
                              <span
                                key={c}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${color}1a`, color: `${color}dd` }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Countdown */}
                        <div className="text-right shrink-0">
                          <span
                            className="font-mono text-xl font-bold tabular-nums"
                            style={{ color: isUrgent ? color : "rgba(232,236,241,0.7)", textShadow: isUrgent ? `0 0 10px ${color}50` : "none" }}
                          >
                            {days}
                          </span>
                          <p className="text-[9px] font-mono" style={{ color: "rgba(232,236,241,0.4)" }}>
                            日後
                          </p>
                        </div>
                      </div>
                      {/* Progress bar showing urgency */}
                      <div className="mt-2 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(5, 100 - days)}%`,
                            backgroundColor: color,
                            opacity: 0.7,
                            boxShadow: `0 0 10px ${color}60`,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-lg px-4 py-6 text-center" style={{ backgroundColor: "rgba(12, 18, 32, 0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                  <Shield size={20} className="mx-auto mb-2" style={{ color: "rgba(34,197,94,0.5)" }} />
                  <p className="text-[11px] font-mono" style={{ color: "rgba(232,236,241,0.45)" }}>
                    直近の施行予定はありません
                  </p>
                </div>
              )}
            </div>

            {/* Recently enforced */}
            {recentChanges.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-mono uppercase tracking-wider mb-3" style={{ color: "rgba(232,236,241,0.4)" }}>
                  最近の施行
                </p>
                <div className="flex flex-col gap-1.5">
                  {recentChanges.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center gap-2.5 rounded px-3 py-2"
                      style={{ backgroundColor: "rgba(12, 18, 32, 0.85)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: SEVERITY_COLORS[alert.severity], opacity: 0.7 }}
                      />
                      <span className="text-[11px] truncate flex-1" style={{ color: "rgba(232,236,241,0.55)" }}>
                        {alert.title}
                      </span>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: "rgba(232,236,241,0.3)" }}>
                        {timeAgo(alert.effective_at!)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* RIGHT: Signal Feed + Risk Overview */}
          <motion.div variants={itemVariants}>
            {/* Risk overview bar */}
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
              <h3 className="font-mono text-[12px] font-semibold uppercase tracking-wider" style={{ color: "rgba(232, 236, 241, 0.8)" }}>
                リスク概況
              </h3>
            </div>

            <div
              className="rounded-lg px-4 py-3 mb-6 flex items-center gap-4"
              style={{ backgroundColor: "rgba(12, 18, 32, 0.92)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
            >
              {[
                { label: "違法", count: riskCounts.illegal, color: "#ef4444" },
                { label: "高リスク", count: riskCounts.high, color: "#f97316" },
                { label: "注意", count: riskCounts.medium, color: "#eab308" },
                { label: "合法", count: riskCounts.safe, color: "#22c55e" },
              ].map((item) => (
                <div key={item.label} className="flex-1 text-center">
                  <span className="font-mono text-lg font-bold tabular-nums" style={{ color: item.color, textShadow: `0 0 8px ${item.color}40` }}>
                    {item.count}
                  </span>
                  <p className="text-[8px] font-mono tracking-wider mt-0.5" style={{ color: "rgba(232,236,241,0.4)" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Latest signals */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a9a8a] animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: "rgba(26, 154, 138, 0.6)" }}>
                最新シグナル
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  variants={itemVariants}
                  className="group flex items-center gap-3 rounded-md px-4 py-2.5 transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(12, 18, 32, 0.9)",
                    border: "1px solid rgba(26, 154, 138, 0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                  whileHover={{
                    backgroundColor: "rgba(12, 18, 32, 0.8)",
                    borderColor: "rgba(26, 154, 138, 0.25)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: SEVERITY_COLORS[alert.severity],
                      boxShadow: `0 0 6px ${SEVERITY_COLORS[alert.severity]}60`,
                    }}
                  />
                  <span className="flex-1 truncate text-xs" style={{ color: "rgba(232, 236, 241, 0.7)" }}>
                    {alert.title}
                  </span>
                  <span className="flex-shrink-0 font-mono text-[10px]" style={{ color: "rgba(232, 236, 241, 0.35)" }}>
                    {timeAgo(alert.published_at)}
                  </span>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
