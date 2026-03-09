"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Cannabinoid {
  id: string;
  name: string;
  description: string;
  color: string;
}

const CANNABINOIDS: Cannabinoid[] = [
  { id: "thc", name: "THC", description: "Primary psychoactive compound. Scheduled in most jurisdictions. Key target of regulatory frameworks.", color: "#ef4444" },
  { id: "cbd", name: "CBD", description: "Non-psychoactive. Widely researched for therapeutic applications. Legal in many markets with THC limits.", color: "#22c55e" },
  { id: "cbn", name: "CBN", description: "Mildly psychoactive oxidation product of THC. Under regulatory review in Japan.", color: "#f59e0b" },
  { id: "cbg", name: "CBG", description: "Non-psychoactive precursor cannabinoid. Growing research interest for anti-inflammatory properties.", color: "#14b8a6" },
  { id: "thcp", name: "THCP", description: "Potent THC analog discovered in 2019. Up to 33x binding affinity at CB1 receptors.", color: "#dc2626" },
  { id: "hhc", name: "HHC", description: "Hydrogenated THC derivative. Semi-synthetic. Designated substance in Japan since 2023.", color: "#a855f7" },
  { id: "delta-8-thc", name: "Delta-8 THC", description: "THC isomer with lower psychoactive potency. Regulatory status varies by jurisdiction.", color: "#f97316" },
  { id: "delta-10-thc", name: "Delta-10 THC", description: "Minor THC isomer. Typically produced synthetically from CBD. Limited research available.", color: "#06b6d4" },
];

function Card({ compound, index }: { compound: Cannabinoid; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/cannabis/${compound.id}`}
        className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-full hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: compound.color, boxShadow: `0 0 12px ${compound.color}40` }}
          />
          <h3 className="text-lg font-bold font-mono text-white tracking-tight">{compound.name}</h3>
        </div>
        <p className="text-[12px] text-gray-400 leading-relaxed mb-4">{compound.description}</p>
        <span
          className="text-[11px] font-mono font-medium tracking-wide"
          style={{ color: compound.color }}
        >
          View Details →
        </span>
      </Link>
    </motion.div>
  );
}

export function CannabinoidDatabase() {
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
            Compound Library
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Cannabinoid Database</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANNABINOIDS.map((c, i) => (
            <Card key={c.id} compound={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
