"use client";

import { motion } from "framer-motion";
import { useSearchStore } from "@/stores/searchStore";
import { useAskJbn } from "@/hooks/useSearch";

function formatAnswer(text: string): React.ReactNode[] {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((paragraph, i) => {
    // Replace citation references like [Compound-1] with styled badges
    const parts = paragraph.split(/(\[[^\]]+\])/g);
    const formatted = parts.map((part, j) => {
      if (/^\[[^\]]+\]$/.test(part)) {
        return (
          <span
            key={j}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-2xs font-mono font-medium bg-accent/15 text-accent border border-accent/30"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
    return (
      <p key={i} className="text-sm text-text-primary leading-relaxed mb-3 last:mb-0">
        {formatted}
      </p>
    );
  });
}

export function AskJbnPanel() {
  const { aiAnswer, aiIsStreaming, aiError } = useSearchStore();
  const { ask, cancel } = useAskJbn();
  const query = useSearchStore((s) => s.query);

  const handleRetry = () => {
    if (query) {
      ask(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="rounded-xl border border-border bg-surface-elevated p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400 text-sm">✦</span>
        <span className="text-sm font-semibold text-text-primary">JBN AI</span>
        {aiIsStreaming && (
          <span className="text-2xs text-text-muted animate-pulse ml-auto">
            generating...
          </span>
        )}
      </div>

      {/* Error state */}
      {aiError && (
        <div className="rounded-lg bg-critical-900/20 border border-critical-800 p-3 mb-4">
          <p className="text-xs text-red-400 mb-2">{aiError}</p>
          <button
            onClick={handleRetry}
            className="text-xs font-medium text-accent hover:text-accent-300 transition-colors duration-150"
          >
            Retry / 再試行
          </button>
        </div>
      )}

      {/* Answer content */}
      {aiAnswer && (
        <div className="mb-4">{formatAnswer(aiAnswer)}</div>
      )}

      {/* Streaming cursor */}
      {aiIsStreaming && !aiAnswer && (
        <div className="flex items-center gap-1.5 py-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:300ms]" />
        </div>
      )}

      {/* Streaming cursor inline */}
      {aiIsStreaming && aiAnswer && (
        <span className="inline-block w-2 h-4 bg-amber-400/60 animate-pulse rounded-sm ml-0.5" />
      )}

      {/* Stop button */}
      {aiIsStreaming && (
        <button
          onClick={cancel}
          className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary bg-navy-700/50 hover:bg-navy-700 border border-border transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-sm bg-text-muted" />
          Stop generating
        </button>
      )}

      {/* Disclaimer */}
      {(aiAnswer || aiIsStreaming) && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-2xs text-text-muted leading-relaxed">
            AI-generated response. Not legal advice. Verify with official sources.
          </p>
          <p className="text-2xs text-text-muted leading-relaxed">
            AI生成による回答です。法的助言ではありません。公式情報をご確認ください。
          </p>
        </div>
      )}
    </motion.div>
  );
}
