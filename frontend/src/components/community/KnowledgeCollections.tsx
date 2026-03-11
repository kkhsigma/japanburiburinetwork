"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Collection {
  title: string;
  description: string;
  articleCount: number;
  color: string;
  icon: string;
}

const COLLECTIONS: Collection[] = [
  {
    title: "カンナビノイド入門ガイド",
    description: "CBD、THC、CBNなど主要カンナビノイドの基礎知識と日本での法的ステータスを体系的に解説。",
    articleCount: 12,
    color: "#22c55e",
    icon: "🌿",
  },
  {
    title: "日本の大麻法制度",
    description: "大麻取締法の歴史、2023年改正の詳細、医療用大麻の今後、産業用ヘンプの可能性。",
    articleCount: 8,
    color: "#0ea5e9",
    icon: "⚖️",
  },
  {
    title: "サイケデリクス研究入門",
    description: "シロシビン、MDMA、ケタミンの臨床研究の現状。エビデンスに基づく最新知見のまとめ。",
    articleCount: 15,
    color: "#a855f7",
    icon: "🔬",
  },
  {
    title: "ハームリダクション・リソース",
    description: "エビデンスに基づく安全情報、薬物検査、緊急時対応、相談窓口の包括的リソース集。",
    articleCount: 10,
    color: "#f59e0b",
    icon: "🛡️",
  },
];

/* ── Animated Holy Book ──
   Idle: closed book. Hover: pages flip, book opens, center glows white. */
function HolyBook({ hovered }: { hovered: boolean }) {
  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      {/* White glow that radiates when open */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Outer soft glow */}
            <div
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
              }}
            />
            {/* Inner bright glow */}
            <div
              className="absolute -inset-1 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 50%, transparent 80%)",
              }}
            />
            {/* Light rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <motion.div
                key={deg}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.4, 0.2], scaleY: [0, 1, 0.8] }}
                transition={{ duration: 0.8, delay: 0.4 + deg * 0.001, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                  width: "1px",
                  height: "18px",
                  background: "linear-gradient(to top, rgba(255,255,255,0.6), transparent)",
                  transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book SVG */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="relative z-10"
      >
        {/* Back cover */}
        <motion.rect
          x="4" y="4" width="24" height="24" rx="2"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
        />

        {/* Spine */}
        <motion.line
          x1="16" y1="4" x2="16" y2="28"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />

        {/* Left cover — opens on hover */}
        <motion.g
          style={{ originX: "4px", originY: "16px" }}
          animate={hovered ? { rotateY: -50 } : { rotateY: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <rect x="4" y="4" width="12" height="24" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        </motion.g>

        {/* Right cover — opens on hover */}
        <motion.g
          style={{ originX: "28px", originY: "16px" }}
          animate={hovered ? { rotateY: 50 } : { rotateY: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <rect x="16" y="4" width="12" height="24" rx="1" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        </motion.g>

        {/* Pages flipping — staggered animation */}
        {[0, 1, 2, 3, 4].map((pageIdx) => (
          <motion.g key={pageIdx}>
            {/* Left page */}
            <motion.rect
              x="6" y="6" width="9" height="20" rx="0.5"
              fill={hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)"}
              animate={hovered ? {
                rotateY: [0, -120 - pageIdx * 15, -60],
                opacity: [0.3, 0.9, 0.7],
              } : {
                rotateY: 0,
                opacity: 0.06,
              }}
              transition={{
                duration: 0.6,
                delay: hovered ? 0.1 + pageIdx * 0.08 : 0,
                ease: "easeInOut",
              }}
              style={{ originX: "6px", originY: "16px" }}
            />
            {/* Right page */}
            <motion.rect
              x="17" y="6" width="9" height="20" rx="0.5"
              fill={hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)"}
              animate={hovered ? {
                rotateY: [0, 120 + pageIdx * 15, 60],
                opacity: [0.3, 0.9, 0.7],
              } : {
                rotateY: 0,
                opacity: 0.06,
              }}
              transition={{
                duration: 0.6,
                delay: hovered ? 0.1 + pageIdx * 0.08 : 0,
                ease: "easeInOut",
              }}
              style={{ originX: "26px", originY: "16px" }}
            />
          </motion.g>
        ))}

        {/* Center page text lines (visible when open) */}
        <AnimatePresence>
          {hovered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <rect
                  key={line}
                  x={7 + (line % 2) * 11}
                  y={9 + line * 3}
                  width={6 + (line % 3)}
                  height="0.8"
                  rx="0.4"
                  fill="rgba(255,255,255,0.3)"
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Center glow when fully open */}
        <AnimatePresence>
          {hovered && (
            <motion.rect
              x="10" y="6" width="12" height="20" rx="1"
              initial={{ opacity: 0, fill: "rgba(255,255,255,0)" }}
              animate={{ opacity: [0, 0.6, 0.4], fill: "rgba(255,255,255,0.15)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

function CollectionCard({ col, index }: { col: Collection; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300 block group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 relative overflow-visible"
          style={{ backgroundColor: hovered ? "rgba(255,255,255,0.06)" : `${col.color}15` }}
        >
          <HolyBook hovered={hovered} />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-gray-100 mb-1 group-hover:text-amber-400 transition-colors">
            {col.title}
          </h3>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
            {col.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">{col.icon}</span>
              <span
                className="text-[10px] font-mono font-medium"
                style={{ color: col.color }}
              >
                {col.articleCount} 記事
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function KnowledgeCollections() {
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
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60 mb-2">
            Collections
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">ナレッジコレクション</h2>
          <p className="text-[12px] text-gray-500 mt-2">
            テーマ別に整理されたキュレーション記事集
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COLLECTIONS.map((col, i) => (
            <CollectionCard key={col.title} col={col} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
