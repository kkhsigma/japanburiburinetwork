"use client";

import { motion } from "framer-motion";
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
  return (
    <div className="relative min-h-screen dash-grid-bg">
      <div className="relative z-10">
        {/* Full-screen floating substances — the opening view */}
        <FloatingSubstances />

        {/* Content below the fold */}
        <FadeIn delay={0.7}>
          <LatestAlerts />
        </FadeIn>

        <FadeIn delay={0.85}>
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
    </div>
  );
}
