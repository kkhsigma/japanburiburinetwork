"use client";

import { motion } from "framer-motion";
import { mockAlerts, mockCompounds } from "@/lib/mock-data";
import { ChevronDown } from "lucide-react";
import type { TransitionState } from "@/types";

const criticalCount = mockAlerts.filter((a) => a.severity === "critical").length;
const substancesTracked = mockCompounds.length;
const sourcesMonitored = 12;

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

interface HeroSectionProps {
  transitionState: TransitionState;
  onCTAClick: () => void;
}

export function HeroSection({ transitionState, onCTAClick }: HeroSectionProps) {
  const isTransitioning = transitionState !== "idle";

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <motion.div
        className="flex max-w-2xl flex-col items-center text-center"
        variants={stagger}
        initial="hidden"
        animate={isTransitioning ? undefined : "visible"}
      >
        {/* System status line */}
        <motion.div
          variants={fadeUp}
          animate={
            isTransitioning
              ? { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
              : undefined
          }
        >
          <p
            className="mb-10 font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "rgba(26, 154, 138, 0.5)" }}
          >
            システム稼働中 &nbsp;// &nbsp;{sourcesMonitored} ソース監視中
            &nbsp;// &nbsp;最終スキャン: 2分前
          </p>
        </motion.div>

        {/* Main heading */}
        <motion.div
          variants={fadeUp}
          animate={
            isTransitioning
              ? {
                  scale: 0.15,
                  opacity: 0,
                  transition: { duration: 0.6, ease: [0.5, 0, 1, 1] },
                }
              : undefined
          }
        >
          <h1
            className="text-[clamp(4rem,10vw,7rem)] font-bold leading-none tracking-tight"
            style={{ color: "#e8ecf1" }}
          >
            JBN
          </h1>
        </motion.div>

        <motion.div
          variants={fadeUp}
          animate={
            isTransitioning
              ? {
                  scale: 0.5,
                  opacity: 0,
                  transition: { duration: 0.5, delay: 0.05, ease: [0.5, 0, 1, 1] },
                }
              : undefined
          }
        >
          <p
            className="mt-3 text-lg font-light tracking-wide"
            style={{ color: "rgba(232, 236, 241, 0.55)" }}
          >
            Japan Buriburi Network
          </p>
        </motion.div>

        {/* Value prop */}
        <motion.div
          variants={fadeUp}
          animate={
            isTransitioning
              ? { opacity: 0, y: 15, transition: { duration: 0.35, ease: "easeIn" } }
              : undefined
          }
        >
          <p
            className="mt-6 max-w-md text-base leading-relaxed"
            style={{ color: "rgba(232, 236, 241, 0.4)" }}
          >
            日本のカンナビノイド市場における規制インテリジェンス
          </p>
        </motion.div>

        {/* Stat bar */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex items-center gap-8 sm:gap-12"
          animate={
            isTransitioning
              ? { opacity: 0, y: 30, transition: { duration: 0.4, delay: 0.05, ease: "easeIn" } }
              : undefined
          }
        >
          <StatItem
            label="緊急アラート"
            value={criticalCount}
            color="#ef4444"
          />
          <Divider />
          <StatItem
            label="追跡物質数"
            value={substancesTracked}
            color="#1a9a8a"
          />
          <Divider />
          <StatItem
            label="監視ソース数"
            value={sourcesMonitored}
            color="#d4a72d"
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          className="mt-12"
          animate={
            isTransitioning
              ? {
                  scale: 0.8,
                  opacity: 0,
                  transition: { duration: 0.35, ease: "easeIn" },
                }
              : undefined
          }
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              onCTAClick();
            }}
            disabled={isTransitioning}
            className="group inline-flex items-center gap-2 rounded-md px-7 py-3 text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer disabled:cursor-default"
            style={{
              backgroundColor: "rgba(26, 154, 138, 0.12)",
              border: "1px solid rgba(26, 154, 138, 0.3)",
              color: "#1a9a8a",
            }}
            onMouseEnter={(e) => {
              if (isTransitioning) return;
              e.currentTarget.style.backgroundColor =
                "rgba(26, 154, 138, 0.2)";
              e.currentTarget.style.borderColor = "rgba(26, 154, 138, 0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (isTransitioning) return;
              e.currentTarget.style.backgroundColor =
                "rgba(26, 154, 138, 0.12)";
              e.currentTarget.style.borderColor = "rgba(26, 154, 138, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            アラートを見る
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex flex-col items-center gap-2"
          animate={
            isTransitioning
              ? { opacity: 0, transition: { duration: 0.2 } }
              : undefined
          }
        >
          <p
            className="text-[10px] font-mono uppercase tracking-[0.15em]"
            style={{ color: "rgba(232, 236, 241, 0.2)" }}
          >
            スクロールして詳細を見る
          </p>
          <motion.div
            animate={
              isTransitioning
                ? { y: 0 }
                : { y: [0, 6, 0] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown
              size={16}
              style={{ color: "rgba(232, 236, 241, 0.15)" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-mono text-2xl font-semibold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-mono uppercase tracking-[0.12em]"
        style={{ color: "rgba(232, 236, 241, 0.3)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="h-8 w-px"
      style={{ backgroundColor: "rgba(232, 236, 241, 0.08)" }}
    />
  );
}
