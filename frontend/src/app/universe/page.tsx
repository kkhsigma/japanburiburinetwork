"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { NavBar } from "@/components/universe/NavBar";
import { SunRayTransition } from "@/components/universe/SunRayTransition";
import { StarField } from "@/components/universe/StarField";
import { StatusBar } from "@/components/universe/StatusBar";
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
      {/* Star field + particles — full-page background layer */}
      <StarField theme={theme} />

      {/* Fixed navbar */}
      <NavBar theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Sun ray transition overlay */}
      <SunRayTransition
        active={transitioning}
        toTheme={pendingTheme || "dark"}
        originX={typeof window !== "undefined" ? window.innerWidth - 80 : 0}
        originY={24}
        onComplete={handleTransitionComplete}
      />

      {/* 3D Universe — always present at top */}
      <div className="relative pt-12">
        <UniverseCanvas key={canvasKey} theme={theme} skipIntro={skipIntro} />
        {/* Replay intro — ghost button, blends into canvas edge */}
        {skipIntro && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            onClick={handleReplayIntro}
            className="absolute bottom-3 right-4 z-20 inline-flex items-center gap-1 text-[9px] font-mono text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded"
            title="イントロを再生"
          >
            <RotateCcw size={10} />
            <span className="hidden sm:inline">Replay</span>
          </motion.button>
        )}
      </div>

      {/* Gradient fade from canvas into dashboard */}
      <div
        className="relative z-10 h-24 -mt-24 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, transparent, #02060c)"
            : "linear-gradient(to bottom, transparent, #f5f6f8)",
        }}
      />

      {/* Live status bar — bridge between canvas and dashboard */}
      <StatusBar />

      {/* Dashboard content */}
      <div className="relative z-10 space-y-8 pt-6 pb-16">
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
      </div>
    </div>
  );
}
