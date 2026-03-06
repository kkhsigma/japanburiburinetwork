"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search compounds, alerts, products...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
          isFocused ? "text-accent" : "text-text-muted"
        }`}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-10 py-2.5 rounded-xl
          bg-surface-elevated border
          text-sm text-text-primary placeholder-text-muted
          transition-all duration-200
          focus:outline-none
          ${
            isFocused
              ? "border-accent/40 shadow-[0_0_0_3px_rgba(26,154,138,0.1)]"
              : "border-border hover:border-border-hover"
          }
        `}
      />
      {query && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-150"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
