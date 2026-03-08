"use client";

import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { LatestAlerts } from "@/components/dashboard/LatestAlerts";
import { RegulationTimeline } from "@/components/dashboard/RegulationTimeline";
import { TrackedSubstances } from "@/components/dashboard/TrackedSubstances";
import { MonitoredSources } from "@/components/dashboard/MonitoredSources";
import { NetworkGrid } from "@/components/dashboard/NetworkGrid";
import { AssembleOverlay } from "@/components/dashboard/AssembleOverlay";

// Staggered section entrance — each section materializes with slight blur + scale
function MaterializeSection({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default function UniversePage() {
  return (
    <div className="relative min-h-screen bg-[#f8f9fb]">
      <AssembleOverlay />
      <NetworkGrid />
      <div className="relative z-10">
        <MaterializeSection delay={0.6}>
          <DashboardHeader />
        </MaterializeSection>
        <main>
          <MaterializeSection delay={0.8}>
            <DashboardHero />
          </MaterializeSection>
          <MaterializeSection delay={1.0}>
            <KpiGrid />
          </MaterializeSection>
          <MaterializeSection delay={1.2}>
            <LatestAlerts />
          </MaterializeSection>
          <MaterializeSection delay={1.4}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-8">
              <div className="lg:col-span-2">
                <RegulationTimeline />
              </div>
              <div className="lg:col-span-3">
                <TrackedSubstances />
              </div>
            </div>
          </MaterializeSection>
          <MaterializeSection delay={1.6}>
            <MonitoredSources />
          </MaterializeSection>
        </main>
      </div>
    </div>
  );
}
