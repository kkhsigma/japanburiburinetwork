"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { NavBar } from "@/components/universe/NavBar";
import { SunRayTransition } from "@/components/universe/SunRayTransition";
import { FloatingSubstances } from "@/components/dashboard/FloatingSubstances";
import { LatestAlerts } from "@/components/dashboard/LatestAlerts";
import { RegulationTimeline } from "@/components/dashboard/RegulationTimeline";
import { MonitoredSources } from "@/components/dashboard/MonitoredSources";

export default function UniversePage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [transitioning, setTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<"dark" | "light" | null>(null);
  const [skipIntro, setSkipIntro] = useState(true); // default to skip, check localStorage on mount
  const [canvasKey, setCanvasKey] = useState(0); // remount canvas for replay

  useEffect(() => {
    try {
      const seen = localStorage.getItem("jbn_intro_seen");
      setSkipIntro(!!seen);
    } catch {
      setSkipIntro(false);
    }
  }, []);

  const handleToggleTheme = useCallback(() => {
    if (transitioning) return;
    const next = theme === "dark" ? "light" : "dark";
    setPendingTheme(next);
    setTransitioning(true);
  }, [theme, transitioning]);

  const handleTransitionComplete = useCallback(() => {
    if (pendingTheme) {
      setTheme(pendingTheme);
      setPendingTheme(null);
    }
    setTransitioning(false);
  }, [pendingTheme]);

  const handleReplayIntro = () => {
    try { localStorage.removeItem("jbn_intro_seen"); } catch {}
    setSkipIntro(false);
    setCanvasKey((k) => k + 1); // remount to reset all animation timers
  };

  const isDark = theme === "dark";

  return (
    <div
      className="relative min-h-screen transition-colors duration-700"
      style={{ background: isDark ? "#02060c" : "#f5f6f8" }}
    >
      {/* Fixed navbar */}
      <NavBar theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Replay intro button — bottom right corner */}
      {skipIntro && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={handleReplayIntro}
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 text-[10px] font-mono text-gray-600 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#020810]/80 backdrop-blur-sm"
          title="イントロを再生"
        >
          <RotateCcw size={11} />
          Replay Intro
        </motion.button>
      )}

      {/* Sun ray transition overlay */}
      <SunRayTransition
        active={transitioning}
        toTheme={pendingTheme || "dark"}
        originX={typeof window !== "undefined" ? window.innerWidth - 80 : 0}
        originY={24}
        onComplete={handleTransitionComplete}
      />

      {/* 3D Universe — always present at top */}
      <div className="pt-12">
        <UniverseCanvas key={canvasKey} theme={theme} skipIntro={skipIntro} />
      </div>

      {/* Dashboard content — always present below universe */}
      <div
        className="relative z-10 transition-colors duration-700"
        style={{ background: isDark ? "#02060c" : "#f5f6f8" }}
      >
        <FloatingSubstances hideHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <LatestAlerts />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 px-4">
            <div className="lg:col-span-2">
              <RegulationTimeline />
            </div>
            <div className="lg:col-span-3">
              <MonitoredSources />
            </div>
          </div>
        </motion.div>

        <div className="h-16" />
      </div>
    </div>
  );
}
