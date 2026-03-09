"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, MessageCircle, Clock, Flag, User } from "lucide-react";

type SortFilter = "newest" | "upvoted" | "commented";
type CategoryFilter = "all" | "research" | "analysis" | "discussion" | "news" | "guide";

interface Post {
  id: string;
  title: string;
  category: CategoryFilter;
  categoryLabel: string;
  author: string;
  preview: string;
  upvotes: number;
  comments: number;
  postedTime: string;
  tags: string[];
}

const SORT_OPTIONS: { value: SortFilter; label: string }[] = [
  { value: "newest", label: "最新" },
  { value: "upvoted", label: "人気" },
  { value: "commented", label: "議論中" },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string; color: string }[] = [
  { value: "all", label: "すべて", color: "#94a3b8" },
  { value: "research", label: "研究", color: "#14b8a6" },
  { value: "analysis", label: "分析", color: "#0ea5e9" },
  { value: "discussion", label: "議論", color: "#a855f7" },
  { value: "news", label: "ニュース", color: "#f59e0b" },
  { value: "guide", label: "ガイド", color: "#22c55e" },
];

const POSTS: Post[] = [
  {
    id: "1",
    title: "改正大麻取締法の施行スケジュールと実務への影響",
    category: "news",
    categoryLabel: "ニュース",
    author: "legal_watcher",
    preview:
      "2024年12月施行の改正法により、大麻由来医薬品の取り扱いが大きく変わる。医療現場、製薬企業、CBD事業者への具体的な影響を整理した。",
    upvotes: 412,
    comments: 94,
    postedTime: "3時間前",
    tags: ["Cannabis", "Policy"],
  },
  {
    id: "2",
    title: "エンドカンナビノイドシステム（ECS）の基礎：なぜ重要なのか",
    category: "research",
    categoryLabel: "研究",
    author: "neuro_science_jp",
    preview:
      "CB1/CB2受容体、アナンダミド、2-AGなど内因性カンナビノイドの基礎知識。ECSが痛み・免疫・睡眠・気分の調節に果たす役割を解説。",
    upvotes: 287,
    comments: 56,
    postedTime: "6時間前",
    tags: ["Research", "Chemistry"],
  },
  {
    id: "3",
    title: "CBD製品の第三者検査：消費者が確認すべき5つのポイント",
    category: "guide",
    categoryLabel: "ガイド",
    author: "quality_check_jp",
    preview:
      "日本のCBD市場で品質のばらつきが問題に。CoA（分析証明書）の読み方、THC混入リスク、信頼できるブランドの見分け方を解説。",
    upvotes: 356,
    comments: 78,
    postedTime: "12時間前",
    tags: ["Cannabis", "Harm Reduction"],
  },
  {
    id: "4",
    title: "MAPSのMDMA-PTSDフェーズ3結果の解釈：専門家パネル",
    category: "analysis",
    categoryLabel: "分析",
    author: "clinical_review",
    preview:
      "MAPS（多分野サイケデリクス研究協会）のMDMA支援療法Phase 3試験の結果を、統計学・精神医学・規制科学の観点から多角的に分析。",
    upvotes: 234,
    comments: 67,
    postedTime: "1日前",
    tags: ["Psychedelics", "Research"],
  },
  {
    id: "5",
    title: "日本のドラッグポリシーを国際比較で考える",
    category: "discussion",
    categoryLabel: "議論",
    author: "global_policy",
    preview:
      "ポルトガルの非犯罪化、カナダの合法化、オランダの寛容政策。日本の「ダメ。ゼッタイ。」からの転換は可能か？国際比較から考察。",
    upvotes: 523,
    comments: 142,
    postedTime: "1日前",
    tags: ["Policy", "Discussion"],
  },
  {
    id: "6",
    title: "マイクロドーシング研究の現状：プラセボ対照試験から見えること",
    category: "research",
    categoryLabel: "研究",
    author: "micro_study",
    preview:
      "シロシビンやLSDのマイクロドーシングに関する最新のRCT結果をレビュー。プラセボ効果との区別、測定方法の課題、今後の研究方向性。",
    upvotes: 178,
    comments: 45,
    postedTime: "2日前",
    tags: ["Psychedelics", "Research"],
  },
  {
    id: "7",
    title: "ハームリダクション実践ガイド：エビデンスに基づくアプローチ",
    category: "guide",
    categoryLabel: "ガイド",
    author: "harm_reduction_jp",
    preview:
      "ハームリダクションの歴史的背景から現在の実践まで。薬物検査サービス、ナロキソン配布、安全な使用環境の国際的ベストプラクティスを紹介。",
    upvotes: 298,
    comments: 83,
    postedTime: "2日前",
    tags: ["Harm Reduction"],
  },
  {
    id: "8",
    title: "CBD vs CBG vs CBN：非精神活性カンナビノイドの比較",
    category: "analysis",
    categoryLabel: "分析",
    author: "cannabinoid_lab",
    preview:
      "CBD以外にも注目される非精神活性カンナビノイド。それぞれの薬理作用、臨床エビデンス、日本での法的地位を比較する。",
    upvotes: 215,
    comments: 39,
    postedTime: "3日前",
    tags: ["Cannabis", "Chemistry"],
  },
];

interface CommunityFeedProps {
  topicFilter: string | null;
  onReport: (postId: string) => void;
}

export function CommunityFeed({ topicFilter, onReport }: CommunityFeedProps) {
  const [sort, setSort] = useState<SortFilter>("newest");
  const [category, setCategory] = useState<CategoryFilter>("all");

  let filtered = POSTS.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (topicFilter && !p.tags.some((t) => t.toLowerCase() === topicFilter.toLowerCase()))
      return false;
    return true;
  });

  if (sort === "upvoted") filtered = [...filtered].sort((a, b) => b.upvotes - a.upvotes);
  else if (sort === "commented") filtered = [...filtered].sort((a, b) => b.comments - a.comments);

  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60 mb-2">
            Feed
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">コミュニティフィード</h2>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className="px-3 py-1.5 rounded-md text-[10px] font-mono font-medium transition-all duration-200 border"
                style={{
                  color: sort === opt.value ? "#fff" : "#94a3b8",
                  backgroundColor: sort === opt.value ? "rgba(212,167,45,0.15)" : "transparent",
                  borderColor: sort === opt.value ? "rgba(212,167,45,0.3)" : "rgba(255,255,255,0.06)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-white/[0.06] hidden sm:block" />

          {/* Category */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-medium transition-all duration-200 border"
                style={{
                  color: category === opt.value ? "#fff" : opt.color,
                  backgroundColor:
                    category === opt.value ? `${opt.color}20` : "transparent",
                  borderColor:
                    category === opt.value ? `${opt.color}40` : "rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {topicFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="text-[10px] font-mono text-gray-500">フィルター中:</span>
            <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {topicFilter}
            </span>
          </motion.div>
        )}

        {/* Posts */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} onReport={onReport} />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <p className="text-gray-500 text-[13px] font-mono">該当する投稿はありません</p>
              <p className="text-gray-600 text-[11px] mt-2">
                別のフィルターをお試しください
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function PostCard({
  post,
  index,
  onReport,
}: {
  post: Post;
  index: number;
  onReport: (postId: string) => void;
}) {
  const catOpt = CATEGORY_OPTIONS.find((c) => c.value === post.category);
  const catColor = catOpt?.color || "#94a3b8";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.03] transition-colors duration-300 group"
    >
      <div className="flex gap-4">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 min-w-[36px]">
          <ArrowUp size={14} className="text-gray-500 hover:text-amber-400 cursor-pointer transition-colors" />
          <span className="text-[12px] font-mono font-bold text-gray-300">{post.upvotes}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-md"
              style={{
                color: catColor,
                backgroundColor: `${catColor}15`,
              }}
            >
              {post.categoryLabel}
            </span>
            {post.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-mono text-gray-600">
                #{tag}
              </span>
            ))}
          </div>

          <h3 className="text-[14px] font-semibold text-gray-100 leading-snug mb-2">
            {post.title}
          </h3>

          <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
            {post.preview}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-500">@{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-600">{post.postedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={10} className="text-gray-600" />
              <span className="text-[10px] font-mono text-gray-600">{post.comments}</span>
            </div>
            <button
              onClick={() => onReport(post.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-mono text-gray-600 hover:text-red-400"
            >
              <Flag size={10} />
              報告
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
