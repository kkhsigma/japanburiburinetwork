"use client";

import { motion } from "framer-motion";

interface Paper {
  title: string;
  journal: string;
  year: number;
  summary: string;
  tags: string[];
}

const PAPERS: Paper[] = [
  {
    title: "Therapeutic Potential of Cannabidiol in Neurological Disorders",
    journal: "Nature Reviews Neuroscience",
    year: 2025,
    summary: "Comprehensive review of CBD's neuroprotective mechanisms, examining preclinical and clinical evidence across epilepsy, Parkinson's, and anxiety disorders.",
    tags: ["neuroscience", "medicine", "CBD"],
  },
  {
    title: "Synthetic Cannabinoid Receptor Agonists: Pharmacological Risks",
    journal: "British Journal of Pharmacology",
    year: 2025,
    summary: "Analysis of emerging synthetic cannabinoids including THCP and HHC analogs. Details receptor binding profiles and toxicological concerns.",
    tags: ["pharmacology", "toxicology", "synthetic"],
  },
  {
    title: "Cannabis Policy Reform in East Asia: A Comparative Analysis",
    journal: "International Journal of Drug Policy",
    year: 2026,
    summary: "Examines regulatory shifts in Japan, South Korea, and Thailand. Documents the transition from prohibition to conditional medical access frameworks.",
    tags: ["policy", "regulation", "asia"],
  },
  {
    title: "Entourage Effect Revisited: Cannabinoid-Terpene Interactions",
    journal: "Frontiers in Plant Science",
    year: 2024,
    summary: "Investigates synergistic effects between minor cannabinoids (CBG, CBN) and terpene profiles in full-spectrum extracts.",
    tags: ["pharmacology", "botany", "chemistry"],
  },
  {
    title: "Endocannabinoid System Modulation in Chronic Pain Management",
    journal: "The Lancet Neurology",
    year: 2025,
    summary: "Meta-analysis of 47 RCTs evaluating cannabinoid-based medicines for neuropathic and inflammatory pain conditions.",
    tags: ["medicine", "neuroscience", "clinical"],
  },
];

const tagColors: Record<string, string> = {
  neuroscience: "#a855f7",
  medicine: "#22c55e",
  pharmacology: "#06b6d4",
  policy: "#f59e0b",
  regulation: "#f97316",
  toxicology: "#ef4444",
  synthetic: "#ec4899",
  asia: "#14b8a6",
  botany: "#84cc16",
  chemistry: "#6366f1",
  clinical: "#22d3ee",
  CBD: "#22c55e",
};

function PaperCard({ paper, index }: { paper: Paper; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.03] transition-colors duration-300"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[10px] font-mono text-gray-500">{paper.journal}</span>
        <span className="text-[10px] font-mono text-emerald-500/60">{paper.year}</span>
      </div>
      <h3 className="text-[14px] font-semibold text-gray-200 leading-snug mb-2">{paper.title}</h3>
      <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{paper.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {paper.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full"
            style={{
              color: tagColors[tag] || "#94a3b8",
              backgroundColor: `${tagColors[tag] || "#94a3b8"}15`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function ResearchFeed() {
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
            Publications
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Research</h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {PAPERS.map((paper, i) => (
            <PaperCard key={i} paper={paper} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
