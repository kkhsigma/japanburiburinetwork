"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, BookOpen } from "lucide-react";

const PROHIBITED = [
  "違法薬物の売買・斡旋",
  "薬物の入手方法の質問・回答",
  "薬物の製造・合成方法の共有",
  "危険な用量に関するアドバイス",
  "違法活動の促進・推奨",
  "ダークネットマーケットへのリンク・言及",
];

const ENCOURAGED = [
  "科学的エビデンスに基づく教育コンテンツ",
  "査読済み研究論文の紹介・考察",
  "薬物政策・規制に関する議論",
  "ハームリダクション情報の共有",
  "医療・治療目的の学術的議論",
  "国際比較による政策分析",
];

export function CommunityGuidelines() {
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
            Guidelines
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">コミュニティガイドライン</h2>
          <p className="text-[12px] text-gray-500 mt-2">
            安全で建設的なコミュニティを維持するためのルール
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prohibited */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-400" />
              <h3 className="text-[15px] font-bold text-red-400">禁止事項</h3>
            </div>
            <ul className="space-y-2.5">
              {PROHIBITED.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-red-500/60 text-[10px] mt-1">✕</span>
                  <span className="text-[12px] text-gray-400 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Encouraged */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={18} className="text-emerald-400" />
              <h3 className="text-[15px] font-bold text-emerald-400">推奨コンテンツ</h3>
            </div>
            <ul className="space-y-2.5">
              {ENCOURAGED.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-emerald-500/60 text-[10px] mt-1">✓</span>
                  <span className="text-[12px] text-gray-400 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Moderation note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex items-start gap-3"
        >
          <ShieldCheck size={16} className="text-amber-500/60 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              すべての投稿はAIモデレーションシステムにより自動審査されます。
              違反コンテンツは自動的にブロックまたはレビューキューに送信されます。
              問題のある投稿を見つけた場合は、報告ボタンをご利用ください。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
