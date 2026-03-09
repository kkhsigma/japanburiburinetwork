"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { checkPostSafety, type ModerationResult } from "@/lib/moderation";

type PostType = "blog" | "discussion";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: PostType;
}

const CATEGORIES = [
  { value: "research", label: "研究" },
  { value: "analysis", label: "分析" },
  { value: "discussion", label: "議論" },
  { value: "news", label: "ニュース" },
  { value: "guide", label: "ガイド" },
];

const TAG_OPTIONS = [
  "Cannabis",
  "Psychedelics",
  "Policy",
  "Research",
  "Harm Reduction",
  "Chemistry",
  "Medical",
  "CBD",
  "THC",
  "Psilocybin",
];

export function CreatePostModal({ isOpen, onClose, defaultType }: CreatePostModalProps) {
  const [type, setType] = useState<PostType>(defaultType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [moderationReason, setModerationReason] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsChecking(true);
    setModerationResult(null);

    // Simulate AI moderation delay
    await new Promise((r) => setTimeout(r, 800));

    const fullText = `${title} ${content}`;
    const result = checkPostSafety(fullText);

    setModerationResult(result.result);
    setModerationReason(result.reason);
    setIsChecking(false);

    if (result.result === "SAFE") {
      // In production: submit to Supabase
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSelectedTags([]);
    setContent("");
    setModerationResult(null);
    setModerationReason(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0a0e18] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/[0.06] bg-[#0a0e18]">
              <h2 className="text-lg font-bold text-white">
                {type === "blog" ? "ブログを作成" : "ディスカッションを開始"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setType("blog")}
                  className="px-4 py-2 rounded-lg text-[11px] font-mono font-medium transition-all border"
                  style={{
                    color: type === "blog" ? "#fff" : "#94a3b8",
                    backgroundColor: type === "blog" ? "rgba(212,167,45,0.15)" : "transparent",
                    borderColor: type === "blog" ? "rgba(212,167,45,0.3)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  ブログ
                </button>
                <button
                  onClick={() => setType("discussion")}
                  className="px-4 py-2 rounded-lg text-[11px] font-mono font-medium transition-all border"
                  style={{
                    color: type === "discussion" ? "#fff" : "#94a3b8",
                    backgroundColor: type === "discussion" ? "rgba(212,167,45,0.15)" : "transparent",
                    borderColor: type === "discussion" ? "rgba(212,167,45,0.3)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  ディスカッション
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="投稿のタイトルを入力..."
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[13px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
                  カテゴリ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className="px-3 py-1.5 rounded-md text-[10px] font-mono transition-all border"
                      style={{
                        color: category === cat.value ? "#d4a72d" : "#94a3b8",
                        backgroundColor: category === cat.value ? "rgba(212,167,45,0.12)" : "transparent",
                        borderColor: category === cat.value ? "rgba(212,167,45,0.25)" : "rgba(255,255,255,0.06)",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
                  タグ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_OPTIONS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-2.5 py-1 rounded-full text-[9px] font-mono transition-all border"
                        style={{
                          color: isSelected ? "#fff" : "#6b7280",
                          backgroundColor: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
                          borderColor: isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
                  {type === "blog" ? "本文（Markdown対応）" : "内容"}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    type === "blog"
                      ? "ブログの本文をMarkdown形式で記述...\n\n# 見出し\n## 小見出し\n**太字** *斜体*\n- リスト項目"
                      : "ディスカッションの内容を入力..."
                  }
                  rows={type === "blog" ? 12 : 6}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[12px] font-mono text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-amber-500/30 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Moderation result */}
              <AnimatePresence>
                {moderationResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-lg p-4 border flex items-start gap-3"
                      style={{
                        borderColor:
                          moderationResult === "SAFE"
                            ? "rgba(34,197,94,0.2)"
                            : moderationResult === "REVIEW"
                            ? "rgba(245,158,11,0.2)"
                            : "rgba(239,68,68,0.2)",
                        backgroundColor:
                          moderationResult === "SAFE"
                            ? "rgba(34,197,94,0.05)"
                            : moderationResult === "REVIEW"
                            ? "rgba(245,158,11,0.05)"
                            : "rgba(239,68,68,0.05)",
                      }}
                    >
                      {moderationResult === "SAFE" ? (
                        <ShieldCheck size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            moderationResult === "REVIEW" ? "text-amber-400" : "text-red-400"
                          }`}
                        />
                      )}
                      <div>
                        <p
                          className="text-[12px] font-medium mb-0.5"
                          style={{
                            color:
                              moderationResult === "SAFE"
                                ? "#22c55e"
                                : moderationResult === "REVIEW"
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {moderationResult === "SAFE"
                            ? "✓ コンテンツは安全です — 投稿を公開します"
                            : moderationResult === "REVIEW"
                            ? "⚠ レビューが必要です — モデレーターが確認します"
                            : "✕ コンテンツがガイドラインに違反しています"}
                        </p>
                        {moderationReason && (
                          <p className="text-[11px] text-gray-500">{moderationReason}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-[11px] font-mono text-gray-400 hover:text-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || isChecking || moderationResult === "BLOCK"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-mono font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    color: "#fff",
                    backgroundColor: "rgba(212,167,45,0.2)",
                    borderColor: "rgba(212,167,45,0.4)",
                    border: "1px solid rgba(212,167,45,0.3)",
                  }}
                >
                  {isChecking ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      審査中...
                    </>
                  ) : (
                    "投稿する"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
