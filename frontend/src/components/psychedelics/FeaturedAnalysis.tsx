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
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
            特集分析
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">注目の分析記事</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div
            className="h-48 sm:h-64 w-full relative"
            style={{
              background: "linear-gradient(135deg, #0e0418 0%, #1a0a2e 30%, #0a0618 60%, #020810 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(168,85,247,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-[#020810] to-transparent">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-purple-500/15 text-purple-400 mb-3 inline-block">
                特集記事
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                サイケデリクス・ルネサンス：精神医療の革命は日本に届くか
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600" />
                <span className="text-[12px] font-medium text-gray-300">JBN リサーチチーム</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">2026年3月</span>
              <span className="text-[10px] font-mono text-gray-600">15分で読了</span>
            </div>

            <p className="text-[13px] text-gray-400 leading-relaxed mb-6 max-w-2xl">
              2023年のオーストラリアによるシロシビン・MDMA医療承認を皮切りに、サイケデリクス支援療法は
              世界の精神医療を根本から変えつつある。本分析では、米国FDA・EMAの審査動向、日本の厚労省WGの
              検討状況、そしてケタミン治療を先行事例とした国内導入シナリオを詳細に検証する。
              文化的障壁、規制フレームワーク、医療経済性の3軸から2027-2030年の展望を提示。
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-[12px] font-mono font-medium text-purple-500 hover:text-purple-400 transition-colors"
            >
              全文を読む
              <span className="text-lg">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
