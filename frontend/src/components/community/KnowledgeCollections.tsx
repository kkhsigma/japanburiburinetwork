"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";

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
            <motion.a
              key={col.title}
              href="#"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300 block group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${col.color}15` }}
                >
                  {col.icon}
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
                      <BookOpen size={11} style={{ color: col.color }} />
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
          ))}
        </div>
      </div>
    </section>
  );
}
