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
    title: "シロシビン支援療法による治療抵抗性うつ病の長期転帰",
    journal: "The New England Journal of Medicine",
    year: 2025,
    summary: "Phase 3試験の2年追跡データ。シロシビン群の59%が寛解を維持。従来治療との比較で有意な優位性。",
    tags: ["シロシビン", "うつ病", "臨床試験"],
  },
  {
    title: "MDMA支援療法のPTSD治療における神経可塑性メカニズム",
    journal: "Nature Neuroscience",
    year: 2025,
    summary: "fMRIデータによりMDMAが扁桃体-前頭前皮質接続性を回復させるメカニズムを解明。",
    tags: ["MDMA", "PTSD", "神経科学"],
  },
  {
    title: "マイクロドーシングの認知機能への影響：大規模RCT",
    journal: "The Lancet Psychiatry",
    year: 2026,
    summary: "LSDマイクロドーシング（10μg）の二重盲検試験。プラセボ比で創造性スコアに有意差なし。",
    tags: ["LSD", "マイクロドーシング", "認知"],
  },
  {
    title: "ケタミン静注療法の自殺念慮に対する即時効果",
    journal: "JAMA Psychiatry",
    year: 2025,
    summary: "緊急精神科における低用量ケタミン投与。24時間以内に自殺念慮が63%減少。",
    tags: ["ケタミン", "自殺予防", "救急"],
  },
  {
    title: "東アジアにおけるサイケデリクス政策の比較分析",
    journal: "International Journal of Drug Policy",
    year: 2026,
    summary: "日本・韓国・台湾・シンガポールの規制枠組みを比較。文化的要因と政策変革の関連性を考察。",
    tags: ["政策", "東アジア", "比較研究"],
  },
];

const tagColors: Record<string, string> = {
  "シロシビン": "#a855f7",
  "うつ病": "#0ea5e9",
  "臨床試験": "#22c55e",
  "MDMA": "#ec4899",
  "PTSD": "#f97316",
  "神経科学": "#6366f1",
  "LSD": "#ef4444",
  "マイクロドーシング": "#f59e0b",
  "認知": "#14b8a6",
  "ケタミン": "#0ea5e9",
  "自殺予防": "#dc2626",
  "救急": "#f97316",
  "政策": "#f59e0b",
  "東アジア": "#14b8a6",
  "比較研究": "#6366f1",
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
        <span className="text-[10px] font-mono text-purple-500/60">{paper.year}</span>
      </div>
      <h3 className="text-[14px] font-semibold text-gray-200 leading-snug mb-2">{paper.title}</h3>
      <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{paper.summary}</p>
      <div className="flex flex-wrap gap-1.5">
        {paper.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full"
            style={{ color: tagColors[tag] || "#94a3b8", backgroundColor: `${tagColors[tag] || "#94a3b8"}15` }}
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
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
            最新研究
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">研究論文フィード</h2>
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
