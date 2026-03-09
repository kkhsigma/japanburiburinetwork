"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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

  const isDark = theme === "dark";

  return (
    <div
      className="relative min-h-screen transition-colors duration-700"
      style={{ background: isDark ? "#02060c" : "#f5f6f8" }}
    >
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
      <div className="pt-12">
        <UniverseCanvas theme={theme} />
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
