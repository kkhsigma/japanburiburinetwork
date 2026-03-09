"use client";

import { motion } from "framer-motion";

interface Topic {
  label: string;
  color: string;
  count: number;
}

const TOPICS: Topic[] = [
  { label: "Cannabis", color: "#22c55e", count: 342 },
  { label: "THC", color: "#ef4444", count: 187 },
  { label: "CBD", color: "#14b8a6", count: 256 },
  { label: "Psilocybin", color: "#a855f7", count: 134 },
  { label: "DMT", color: "#f97316", count: 78 },
  { label: "Policy", color: "#0ea5e9", count: 198 },
  { label: "Medical Research", color: "#06b6d4", count: 167 },
  { label: "Harm Reduction", color: "#f59e0b", count: 145 },
  { label: "Ketamine", color: "#8b5cf6", count: 92 },
  { label: "MDMA", color: "#ec4899", count: 63 },
  { label: "Chemistry", color: "#d946ef", count: 89 },
  { label: "Japan Law", color: "#64748b", count: 211 },
];

interface TrendingTopicsProps {
  activeTopic: string | null;
  onTopicClick: (topic: string | null) => void;
}

export function TrendingTopics({ activeTopic, onTopicClick }: TrendingTopicsProps) {
  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60 mb-2">
            Trending
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">トレンドトピック</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {TOPICS.map((topic, i) => {
            const isActive = activeTopic === topic.label;
            return (
              <motion.button
                key={topic.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTopicClick(isActive ? null : topic.label)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-mono font-medium transition-all duration-200 border"
                style={{
                  color: isActive ? "#fff" : topic.color,
                  backgroundColor: isActive ? `${topic.color}25` : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? `${topic.color}50` : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 0 16px ${topic.color}20` : "none",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: topic.color }}
                />
                {topic.label}
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? `${topic.color}30` : "rgba(255,255,255,0.04)",
                    color: isActive ? topic.color : "#6b7280",
                  }}
                >
                  {topic.count}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
