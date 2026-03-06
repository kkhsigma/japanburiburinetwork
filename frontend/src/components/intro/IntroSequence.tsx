"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GrassCanvas } from "./GrassCanvas";
import { UpdatePopup } from "./UpdatePopup";
import { mockUpdateCards } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

type IntroPhase = "growing" | "logo" | "updates" | "splitting" | "done";

const PROGRESS_MESSAGES = [
  "Collecting sources...",
  "Analyzing updates...",
  "Checking substances...",
];

interface IntroSequenceProps {
  onComplete: () => void;
  isShortVersion?: boolean;
}

export function IntroSequence({ onComplete, isShortVersion = false }: IntroSequenceProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<IntroPhase>("growing");
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);

  const updateCards = mockUpdateCards;
  const totalDuration = isShortVersion ? 1500 : 3400;

  // Growing phase - animate progress
  useEffect(() => {
    if (phase !== "growing") return;

    const stepDuration = totalDuration / 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("logo");
          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [phase, totalDuration]);

  // Progress message rotation
  useEffect(() => {
    if (phase !== "growing") return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Logo phase
  useEffect(() => {
    if (phase !== "logo") return;
    const timer = setTimeout(() => {
      if (updateCards.length > 0) {
        setPhase("updates");
      } else {
        setPhase("splitting");
      }
    }, isShortVersion ? 500 : 1000);
    return () => clearTimeout(timer);
  }, [phase, updateCards.length, isShortVersion]);

  // Handle card OK
  const handleCardOk = useCallback(() => {
    if (currentCardIndex < updateCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setPhase("splitting");
    }
  }, [currentCardIndex, updateCards.length]);

  // Splitting phase
  useEffect(() => {
    if (phase !== "splitting") return;
    setSplitting(true);

    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - p, 3);
      setSplitProgress(eased);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setPhase("done");
        onComplete();
      }
    };
    requestAnimationFrame(animate);
  }, [phase, onComplete]);

  const handleDetails = (alertId: string) => {
    onComplete();
    router.push(`/alerts/${alertId}`);
  };

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-50">
      <GrassCanvas
        progress={progress}
        splitting={splitting}
        splitProgress={splitProgress}
      />

      {/* Progress text overlay */}
      <AnimatePresence>
        {phase === "growing" && (
          <motion.div
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.p
              key={messageIndex}
              className="text-sm text-gray-400 font-mono"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {PROGRESS_MESSAGES[messageIndex]}
            </motion.p>
            <div className="mt-4 w-48 h-1 bg-navy-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-green rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-2xs text-gray-500 font-mono">{progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo reveal */}
      <AnimatePresence>
        {phase === "logo" && (
          <motion.div
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-accent-green rounded-2xl flex items-center justify-center mb-4 shadow-glow">
              <span className="text-white font-bold text-2xl">JBN</span>
            </div>
            <p className="text-white font-semibold">Japan Botanical Network</p>
            <p className="text-gray-400 text-sm mt-1">Scanning Regulations...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update popups */}
      {phase === "updates" && (
        <UpdatePopup
          card={updateCards[currentCardIndex]}
          onOk={handleCardOk}
          onDetails={handleDetails}
        />
      )}
    </div>
  );
}
