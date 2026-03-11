"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ParticleField } from "@/components/background/ParticleField";
import { BlackHoleTransition } from "@/components/background/BlackHoleTransition";
import { FloatingCardsBg } from "@/components/background/FloatingCardsBg";
import { HeroSection } from "@/components/hero/HeroSection";
import { SignalFeed } from "@/components/hero/SignalFeed";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import type { TransitionState } from "@/types";

export default function Page() {
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");

  const handleCTAClick = useCallback(() => {
    if (transitionState !== "idle") return;

    setTransitionState("collapsing");

    setTimeout(() => setTransitionState("singularity"), 700);
    setTimeout(() => setTransitionState("zoom"), 1400);
    setTimeout(() => setTransitionState("supernova"), 2100);
    setTimeout(() => setTransitionState("warp"), 4300);
    setTimeout(() => {
      setTransitionState("navigate");
      // Full page navigation — avoids client-side mount conflicts
      window.location.href = "/universe";
    }, 6000);
  }, [transitionState]);

  return (
    <div className="relative min-h-screen bg-[#06090f]">
      <ParticleField transitionState={transitionState} />
      <FloatingCardsBg transitionState={transitionState} />
      <BlackHoleTransition transitionState={transitionState} />
      <HeroSection transitionState={transitionState} onCTAClick={handleCTAClick} />
      <motion.div
        animate={
          transitionState !== "idle"
            ? { opacity: 0, y: 30 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4, ease: "easeIn" }}
      >
        <SignalFeed />
      </motion.div>
      <NotificationToast />
    </div>
  );
}
