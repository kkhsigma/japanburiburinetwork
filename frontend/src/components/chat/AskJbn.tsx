"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { getAskJbnStreamUrl } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "HHCの現在の法的状況は？",
  "最近の規制変更は？",
  "CBDは日本で合法？",
  "指定薬物とは何ですか？",
];

export function AskJbn() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query.trim(),
    };

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    try {
      abortRef.current = new AbortController();
      const url = getAskJbnStreamUrl();

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), language: "ja", stream: true }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text" && parsed.text) {
              fullText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullText }
                    : m
                )
              );
            } else if (parsed.type === "error") {
              fullText += `\n\nエラー: ${parsed.message}`;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullText, streaming: false }
                    : m
                )
              );
            }
          } catch {
            // Non-JSON line, ignore
          }
        }
      }

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      // Fallback for when backend is unavailable
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "申し訳ございません。現在AIサービスに接続できません。しばらくしてからもう一度お試しください。",
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-[55] w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #1a9a8a 0%, #0d7a6e 100%)",
              boxShadow: "0 4px 20px rgba(26,154,138,0.4), 0 0 40px rgba(26,154,138,0.15)",
            }}
          >
            <MessageCircle size={20} className="text-white" />
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: "rgba(26,154,138,0.2)",
                animationDuration: "3s",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[55] w-[340px] sm:w-[380px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(6,9,15,0.96)",
              border: "1px solid rgba(26,154,138,0.15)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(26,154,138,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "linear-gradient(180deg, rgba(26,154,138,0.08) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #1a9a8a 0%, #0d7a6e 100%)",
                    boxShadow: "0 0 10px rgba(26,154,138,0.3)",
                  }}
                >
                  <span className="text-[9px] font-black font-mono text-white">JBN</span>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white/90">Ask JBN</div>
                  <div className="text-[9px] font-mono text-[#1a9a8a]/60">規制AIアシスタント</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ minHeight: "200px", maxHeight: "360px" }}
            >
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <div className="text-[11px] text-white/40 mb-1">JBNに質問してください</div>
                    <div className="text-[9px] text-white/20 font-mono">日本の規制情報をAIがお答えします</div>
                  </div>
                  <div className="space-y-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="w-full text-left px-3 py-2 rounded-lg text-[10px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              backgroundColor: "rgba(26,154,138,0.15)",
                              border: "1px solid rgba(26,154,138,0.2)",
                              color: "rgba(255,255,255,0.85)",
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.7)",
                            }
                      }
                    >
                      {msg.content || (msg.streaming && (
                        <span className="flex items-center gap-1.5 text-white/30">
                          <Loader2 size={10} className="animate-spin" />
                          <span className="text-[9px]">考え中...</span>
                        </span>
                      ))}
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-1.5 h-3 bg-[#1a9a8a] ml-0.5 animate-pulse rounded-sm" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className="px-3 py-2.5 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="質問を入力..."
                  maxLength={500}
                  className="flex-1 bg-transparent text-[11px] text-white/80 placeholder-white/20 outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default"
                  style={{
                    color: input.trim() ? "#1a9a8a" : "rgba(255,255,255,0.15)",
                  }}
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
              <div className="text-[8px] text-white/15 text-center mt-1.5 font-mono">
                AI回答は参考情報です。法的助言ではありません。
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
