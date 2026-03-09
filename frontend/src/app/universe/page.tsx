"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { ThemeToggle } from "@/components/universe/ThemeToggle";
import { SunRayTransition } from "@/components/universe/SunRayTransition";
import { FloatingSubstances } from "@/components/dashboard/FloatingSubstances";
import { LatestAlerts } from "@/components/dashboard/LatestAlerts";
import { RegulationTimeline } from "@/components/dashboard/RegulationTimeline";
import { MonitoredSources } from "@/components/dashboard/MonitoredSources";

function FadeIn({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function UniversePage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [transitioning, setTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<"dark" | "light" | null>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const [toggleOrigin, setToggleOrigin] = useState({ x: 0, y: 0 });

  const handleToggle = useCallback(() => {
    if (transitioning) return;

    const next = theme === "dark" ? "light" : "dark";
    setPendingTheme(next);
    setTransitioning(true);

    // Get toggle button position for ray origin
    if (toggleRef.current) {
      const rect = toggleRef.current.getBoundingClientRect();
      setToggleOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
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
    <div className="relative min-h-screen" style={{ background: isDark ? "#02060c" : "#f5f6f8", transition: "background 0.5s ease" }}>
      {/* Theme toggle — fixed top right */}
      <div
        ref={toggleRef}
        className="fixed top-4 right-4 z-50"
      >
        <ThemeToggle theme={theme} onToggle={handleToggle} />
      </div>

      {/* Sun ray transition overlay */}
      <SunRayTransition
        active={transitioning}
        toTheme={pendingTheme || "dark"}
        originX={toggleOrigin.x}
        originY={toggleOrigin.y}
        onComplete={handleTransitionComplete}
      />

      {/* Dark mode: 3D Universe */}
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="universe-3d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <UniverseCanvas theme="dark" />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-screen dash-grid-bg"
          >
            <div className="relative z-10">
              <FloatingSubstances />

              <FadeIn delay={0.3}>
                <LatestAlerts />
              </FadeIn>

              <FadeIn delay={0.45}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 px-4">
                  <div className="lg:col-span-2">
                    <RegulationTimeline />
                  </div>
                  <div className="lg:col-span-3">
                    <MonitoredSources />
                  </div>
                </div>
              </FadeIn>

              <div className="h-16" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
