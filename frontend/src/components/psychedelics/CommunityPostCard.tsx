"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowUp } from "lucide-react";

interface Post {
  title: string;
  author: string;
  upvotes: number;
  comments: number;
  category: string;
  categoryColor: string;
}

const POSTS: Post[] = [
  {
    title: "オーストラリアのシロシビン承認は日本の政策にどう影響するか？",
    author: "policy_watcher_jp",
    upvotes: 187,
    comments: 42,
    category: "政策",
    categoryColor: "#a855f7",
  },
  {
    title: "ケタミンクリニックの体験レポート — 治療抵抗性うつ病",
    author: "mental_health_jp",
    upvotes: 134,
    comments: 31,
    category: "体験談",
    categoryColor: "#0ea5e9",
  },
  {
    title: "MAPS Phase 3の結果をどう解釈すべきか — 研究者の視点",
    author: "neuro_researcher",
    upvotes: 98,
    comments: 27,
    category: "研究",
    categoryColor: "#14b8a6",
  },
  {
    title: "日本のサイケデリクス研究の現状と課題",
    author: "jp_pharma_insight",
    upvotes: 256,
    comments: 63,
    category: "分析",
    categoryColor: "#f59e0b",
  },
];

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] hover:bg-white/[0.03] transition-colors duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <ArrowUp size={14} className="text-gray-500" />
          <span className="text-[12px] font-mono font-bold text-gray-300">{post.upvotes}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-semibold text-gray-200 leading-snug mb-2">{post.title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-500">@{post.author}</span>
            <span
              className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded"
              style={{ color: post.categoryColor, backgroundColor: `${post.categoryColor}15` }}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle size={11} />
              <span className="text-[10px] font-mono">{post.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CommunityPosts() {
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
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
              フォーラム
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">コミュニティ</h2>
          </div>
          <a href="#" className="text-[11px] font-mono text-purple-500 hover:text-purple-400 transition-colors">
            すべてのディスカッション →
          </a>
        </motion.div>

        <div className="flex flex-col gap-3">
          {POSTS.map((post, i) => (
            <PostCard key={i} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
