"use client";

import { motion } from "framer-motion";

export function FeaturedAnalysis() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60 mb-2">
            Deep Dive
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Analysis</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          {/* Cover image placeholder */}
          <div
            className="h-48 sm:h-64 w-full relative"
            style={{
              background: "linear-gradient(135deg, #041a12 0%, #0a2818 30%, #061a20 60%, #020810 100%)",
            }}
          >
            {/* Decorative grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-[#020810] to-transparent">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 mb-3 inline-block">
                Editorial
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                The Future of Cannabis Policy in Japan: From Prohibition to Regulated Access
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
                <span className="text-[12px] font-medium text-gray-300">JBN Research Team</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">March 2026</span>
              <span className="text-[10px] font-mono text-gray-600">12 min read</span>
            </div>

            <p className="text-[13px] text-gray-400 leading-relaxed mb-6 max-w-2xl">
              Japan&apos;s 2023 Cannabis Control Act amendment marks the most significant shift in
              cannabis policy since the original 1948 law. This analysis examines the transition from
              strict prohibition to a framework that distinguishes between recreational use (newly criminalized)
              and medical/industrial applications (newly enabled). We trace the regulatory pipeline,
              assess market implications, and project the 2027-2030 outlook for cannabinoid products in Japan.
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-[12px] font-mono font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Read Full Analysis
              <span className="text-lg">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
