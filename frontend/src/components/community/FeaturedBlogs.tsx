"use client";

import { motion } from "framer-motion";
import { ArrowUp, MessageCircle, Clock, User } from "lucide-react";

interface Blog {
  title: string;
  author: string;
  readTime: string;
  tags: string[];
  preview: string;
  upvotes: number;
  comments: number;
  date: string;
  tagColors: Record<string, string>;
}

const TAG_COLORS: Record<string, string> = {
  Cannabis: "#22c55e",
  Psychedelics: "#a855f7",
  Policy: "#0ea5e9",
  Research: "#14b8a6",
  "Harm Reduction": "#f59e0b",
  Chemistry: "#ec4899",
  Medical: "#06b6d4",
  カンナビス: "#22c55e",
  サイケデリクス: "#a855f7",
  政策: "#0ea5e9",
  研究: "#14b8a6",
  ハームリダクション: "#f59e0b",
  化学: "#ec4899",
  医療: "#06b6d4",
};

const BLOGS: Blog[] = [
  {
    title: "日本の大麻取締法改正2023：医療用解禁の全容と今後の展望",
    author: "policy_analyst_jp",
    readTime: "12分",
    tags: ["Cannabis", "Policy"],
    preview:
      "2023年12月に成立した改正大麻取締法は、日本の大麻政策における歴史的転換点となった。本記事では法改正の背景、具体的な変更点、そして今後の医療・産業への影響を詳細に分析する。",
    upvotes: 342,
    comments: 87,
    date: "2026年3月5日",
    tagColors: TAG_COLORS,
  },
  {
    title: "シロシビン治療の最前線：オーストラリアTGA承認から2年",
    author: "neuro_researcher",
    readTime: "15分",
    tags: ["Psychedelics", "Research"],
    preview:
      "2023年にオーストラリアが世界初のシロシビン医療承認を行ってから2年。臨床データ、患者アウトカム、そして他国への波及効果を最新のエビデンスに基づき検証する。",
    upvotes: 278,
    comments: 63,
    date: "2026年3月2日",
    tagColors: TAG_COLORS,
  },
  {
    title: "CBD市場の科学：品質管理と消費者保護の課題",
    author: "chem_insights",
    readTime: "10分",
    tags: ["Cannabis", "Chemistry"],
    preview:
      "日本のCBD市場は急成長を続けているが、製品の品質格差は深刻な問題だ。第三者検査の現状、THC混入リスク、そして消費者が知るべき科学的知識をまとめる。",
    upvotes: 195,
    comments: 41,
    date: "2026年2月28日",
    tagColors: TAG_COLORS,
  },
  {
    title: "ハームリダクションとは何か：日本における必要性と国際比較",
    author: "harm_reduction_jp",
    readTime: "8分",
    tags: ["Harm Reduction", "Policy"],
    preview:
      "「ハームリダクション」の概念は日本ではまだ馴染みが薄い。欧州・北米の実践例と日本の薬物政策の比較から、エビデンスに基づくアプローチの可能性を探る。",
    upvotes: 256,
    comments: 72,
    date: "2026年2月25日",
    tagColors: TAG_COLORS,
  },
  {
    title: "ケタミン治療の実際：治療抵抗性うつ病への新たな選択肢",
    author: "psychiatry_today_jp",
    readTime: "11分",
    tags: ["Psychedelics", "Medical"],
    preview:
      "エスケタミン鼻腔スプレーの日本承認から、ケタミンクリニックの広がりまで。治療抵抗性うつ病患者にとっての新たな希望と、科学的エビデンスの現状を解説する。",
    upvotes: 189,
    comments: 38,
    date: "2026年2月20日",
    tagColors: TAG_COLORS,
  },
  {
    title: "カンナビノイド受容体の科学：ECSシステム入門",
    author: "endo_science",
    readTime: "14分",
    tags: ["Research", "Chemistry"],
    preview:
      "エンドカンナビノイドシステム（ECS）は人体の恒常性維持に重要な役割を果たす。CB1/CB2受容体、内因性リガンド、そして外因性カンナビノイドの作用機序を科学的に解説。",
    upvotes: 167,
    comments: 29,
    date: "2026年2月15日",
    tagColors: TAG_COLORS,
  },
];

function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300 flex flex-col"
    >
      {/* Gradient banner */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${
            TAG_COLORS[blog.tags[0]] || "#d4a72d"
          }, ${TAG_COLORS[blog.tags[1]] || "#f59e0b"})`,
          opacity: 0.6,
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-md"
              style={{
                color: TAG_COLORS[tag] || "#94a3b8",
                backgroundColor: `${TAG_COLORS[tag] || "#94a3b8"}15`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-[14px] font-bold text-gray-100 leading-snug mb-2 line-clamp-2">
          {blog.title}
        </h3>

        {/* Preview */}
        <p className="text-[11px] text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
          {blog.preview}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <User size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-500">@{blog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-600">{blog.readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ArrowUp size={11} className="text-amber-500/60" />
              <span className="text-[10px] font-mono font-bold text-gray-400">{blog.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-600">{blog.comments}</span>
            </div>
          </div>
        </div>

        <p className="text-[9px] font-mono text-gray-700 mt-2">{blog.date}</p>
      </div>
    </motion.div>
  );
}

export function FeaturedBlogs() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60 mb-2">
              Featured
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">注目のブログ</h2>
          </div>
          <a
            href="#"
            className="text-[11px] font-mono text-amber-500 hover:text-amber-400 transition-colors"
          >
            すべてのブログ →
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOGS.map((blog, i) => (
            <BlogCard key={i} blog={blog} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
