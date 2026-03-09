"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { REPORT_REASONS, type ReportReason } from "@/lib/moderation";

interface ReportModalProps {
  isOpen: boolean;
  postId: string | null;
  onClose: () => void;
}

export function ReportModal({ isOpen, postId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason || !postId) return;

    // In production: submit to Supabase moderation queue
    console.log("Report submitted:", { postId, reason, details });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setReason(null);
      setDetails("");
      setSubmitted(false);
    }, 1500);
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0e18] shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">投稿を報告</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                </motion.div>
                <p className="text-[13px] text-gray-300">報告を受け付けました</p>
                <p className="text-[11px] text-gray-600 mt-1">モデレーターが確認します</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2 block">
                    報告理由
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setReason(r.value)}
                        className="w-full text-left p-3 rounded-lg border transition-all duration-200"
                        style={{
                          borderColor:
                            reason === r.value ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)",
                          backgroundColor:
                            reason === r.value ? "rgba(239,68,68,0.05)" : "transparent",
                        }}
                      >
                        <p
                          className="text-[12px] font-medium mb-0.5"
                          style={{ color: reason === r.value ? "#ef4444" : "#e2e8f0" }}
                        >
                          {r.label}
                        </p>
                        <p className="text-[10px] text-gray-600">{r.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
                    詳細（任意）
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="具体的な内容を記述してください..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[12px] text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-red-500/30 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[11px] font-mono text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!reason}
                    className="px-5 py-2 rounded-lg text-[11px] font-mono font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      color: "#ef4444",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      borderColor: "rgba(239,68,68,0.25)",
                    }}
                  >
                    報告する
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
