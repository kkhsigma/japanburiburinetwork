"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { SearchMode } from "@/types";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onAsk?: (query: string) => void;
  mode?: SearchMode;
  onModeChange?: (mode: SearchMode) => void;
  className?: string;
}

export function SearchBar({
  placeholder,
  onSearch,
  onAsk,
  mode = "search",
  onModeChange,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const defaultPlaceholder =
    mode === "ask"
      ? "Ask JBN about regulations..."
      : "Search compounds, alerts, products...";

  const handleChange = (value: string) => {
    setQuery(value);
    if (mode === "search") {
      onSearch?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      if (mode === "ask") {
        onAsk?.(query.trim());
      } else {
        onSearch?.(query.trim());
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        {mode === "ask" ? (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-sm select-none">
            ✦
          </span>
        ) : (
          <Search
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
              isFocused ? "text-accent" : "text-text-muted"
            }`}
          />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? defaultPlaceholder}
          className={`
            w-full pl-10 pr-10 py-2.5 rounded-xl
            bg-surface-elevated border
            text-sm text-text-primary placeholder-text-muted
            transition-all duration-200
            focus:outline-none
            ${
              isFocused
                ? mode === "ask"
                  ? "border-amber-500/40 shadow-[0_0_0_3px_rgba(212,167,45,0.1)]"
                  : "border-accent/40 shadow-[0_0_0_3px_rgba(26,154,138,0.1)]"
                : "border-border hover:border-border-hover"
            }
          `}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-150"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Mode toggle */}
      {onModeChange && (
        <div className="flex items-center bg-surface-elevated border border-border rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => onModeChange("search")}
            className={`px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
              mode === "search"
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onModeChange("ask")}
            className={`px-3 py-2.5 text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
              mode === "ask"
                ? "bg-amber-500/15 text-amber-400"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <span className="text-[10px]">✦</span>
            Ask JBN
          </button>
        </div>
      )}
    </div>
  );
}
