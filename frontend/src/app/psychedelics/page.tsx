"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/psychedelics/HeroSection";
import { PsychedelicLegalStatus } from "@/components/psychedelics/PsychedelicLegalStatus";
import { RegulatoryAlerts } from "@/components/psychedelics/RegulatoryAlertCard";
import { LegalizationMap } from "@/components/psychedelics/LegalizationMap";
import { JapanPolicyTimeline } from "@/components/psychedelics/JapanPolicyTimeline";
import { MarketCategoryChart } from "@/components/psychedelics/MarketCategoryChart";
import { WorldMap } from "@/components/psychedelics/WorldMap";
import { ResearchFeed } from "@/components/psychedelics/ResearchPaperCard";
import { CommunityPosts } from "@/components/psychedelics/CommunityPostCard";
import { FeaturedAnalysis } from "@/components/psychedelics/FeaturedAnalysis";

export default function PsychedelicsPage() {
  return (
    <div className="min-h-screen bg-[#020810] text-gray-100">
      {/* Back to universe link */}
      <div className="fixed top-4 left-4 z-50">
        <a
          href="/universe"
          className="inline-flex items-center gap-2 text-[11px] font-mono text-gray-500 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#020810]/80 backdrop-blur-sm"
        >
          ← Universe
        </a>
      </div>

      <HeroSection />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <PsychedelicLegalStatus />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <FeaturedAnalysis />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <RegulatoryAlerts />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <WorldMap />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Market & Policy Tracker */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
              ダッシュボード
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">市場・政策トラッカー</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <LegalizationMap />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <JapanPolicyTimeline />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <MarketCategoryChart />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <ResearchFeed />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <CommunityPosts />

      <footer className="px-6 py-12 text-center">
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          JBN Psychedelic Intelligence — 規制データは情報提供のみを目的としています
        </p>
      </footer>
    </div>
  );
}
