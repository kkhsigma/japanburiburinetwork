"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronDown } from "lucide-react";
import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { NavBar } from "@/components/universe/NavBar";
import { SunRayTransition } from "@/components/universe/SunRayTransition";
// StarField removed — WebGL Stars inside UniverseCanvas handles star rendering
import { StatusBar } from "@/components/universe/StatusBar";
import { IntelligenceBrief } from "@/components/dashboard/IntelligenceBrief";
import { CategoryCards } from "@/components/dashboard/CategoryCards";

export default function UniversePage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [transitioning, setTransitioning] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<"dark" | "light" | null>(null);
  const [skipIntro, setSkipIntro] = useState(true); // default to skip, check localStorage on mount
  const [canvasKey, setCanvasKey] = useState(0); // remount canvas for replay
  const [entryFade, setEntryFade] = useState(true); // fade-in from transition
  const [hasScrolled, setHasScrolled] = useState(false); // hide scroll indicator after scrolling

  // Mobile touch handling: single finger for universe navigation, two fingers to scroll
  const universeRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isTwoFingerTouch = useRef(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("jbn_intro_seen");
      setSkipIntro(!!seen);
    } catch {
      setSkipIntro(false);
    }
    // Fade out the entry overlay after mount
    const timer = setTimeout(() => setEntryFade(false), 100);

    // Force canvas remount when restored from bfcache (browser back button)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setCanvasKey((k) => k + 1);
        setEntryFade(true);
        setTimeout(() => setEntryFade(false), 100);
      }
    };
    window.addEventListener("pageshow", onPageShow);

    // Hide scroll indicator after user scrolls
    const onScroll = () => {
      if (window.scrollY > 50) setHasScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mobile: Two-finger scroll on universe section
  useEffect(() => {
    const universeEl = universeRef.current;
    if (!universeEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      isTwoFingerTouch.current = e.touches.length >= 2;
      if (e.touches.length >= 2) {
        // Two fingers: record starting Y position for scroll
        touchStartY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && isTwoFingerTouch.current) {
        // Two-finger scroll: calculate delta and scroll page
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const deltaY = touchStartY.current - currentY;
        window.scrollBy(0, deltaY * 1.5);
        touchStartY.current = currentY;
        e.preventDefault(); // Prevent pinch zoom
      } else if (e.touches.length === 1 && !isTwoFingerTouch.current) {
        // Single finger: prevent page scroll, let canvas handle it
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isTwoFingerTouch.current = false;
    };

    universeEl.addEventListener("touchstart", handleTouchStart, { passive: false });
    universeEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    universeEl.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      universeEl.removeEventListener("touchstart", handleTouchStart);
      universeEl.removeEventListener("touchmove", handleTouchMove);
      universeEl.removeEventListener("touchend", handleTouchEnd);
    };
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
      {/* Entry fade overlay — smooth transition from black hole animation */}
      <div
        className="fixed inset-0 z-[100] pointer-events-none transition-opacity"
        style={{
          backgroundColor: "#06090f",
          opacity: entryFade ? 1 : 0,
          transitionDuration: "1.2s",
          transitionTimingFunction: "cubic-bezier(0.25, 0.4, 0.25, 1)",
        }}
      />

      {/* Stars handled by WebGL Stars component inside UniverseCanvas */}

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
      {/* Mobile: single finger navigates universe, two fingers scroll page */}
      <div ref={universeRef} className="relative pt-12 touch-none">
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
            <span className="hidden sm:inline">再生</span>
          </motion.button>
        )}

        {/* Scroll indicator - fixed to bottom of viewport, hides after scrolling */}
        <AnimatePresence>
          {!hasScrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ delay: 1, duration: 0.8 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-gray-400 pointer-events-none"
            >
              <span className="text-sm font-light tracking-[0.3em] uppercase hidden sm:block">scroll</span>
              <span className="text-xs font-light tracking-[0.2em] uppercase sm:hidden">2本指でスクロール</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={24} strokeWidth={1.5} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Intelligence Brief Section */}
      <div className="relative z-10">
        <IntelligenceBrief theme={theme} />
      </div>

      {/* Category Cards Section */}
      <div className="relative z-10 pb-16">
        <CategoryCards theme={theme} />
      </div>
    </div>
  );
}
