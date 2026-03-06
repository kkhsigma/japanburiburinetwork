"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ParticleField } from "@/components/background/ParticleField";
import { BlackHoleTransition } from "@/components/background/BlackHoleTransition";
import { HeroSection } from "@/components/hero/HeroSection";
import { SignalFeed } from "@/components/hero/SignalFeed";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import type { TransitionState } from "@/types";

export default function Page() {
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");
  const router = useRouter();

  const handleCTAClick = useCallback(() => {
    if (transitionState !== "idle") return;

    setTransitionState("collapsing");

    setTimeout(() => setTransitionState("singularity"), 700);
    setTimeout(() => setTransitionState("zoom"), 1400);
    setTimeout(() => {
      setTransitionState("navigate");
      router.push("/universe");
    }, 2000);
  }, [transitionState, router]);

  return (
    <div className="relative min-h-screen bg-[#06090f]">
      <ParticleField transitionState={transitionState} />
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
      <div className="fixed bottom-4 right-4 z-10">
        <span className="text-[10px] font-mono text-[#64748b]/30">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </span>
      </div>
    </div>
  );
}
