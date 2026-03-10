"use client";

import { useEffect, useRef, useCallback } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { AskJbnPanel } from "@/components/search/AskJbnPanel";
import { useSearchStore } from "@/stores/searchStore";
import { useSearch, useAskJbn } from "@/hooks/useSearch";
import type { SearchMode } from "@/types";

export default function HybridSearch() {
  const {
    query,
    mode,
    results,
    isSearching,
    setQuery,
    setMode,
    setResults,
    setSearching,
    setError,
    clearSearch,
  } = useSearchStore();

  const { ask } = useAskJbn();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use store query for react-query (debounced via handleSearch)
  const searchQuery = useSearch(
    mode === "search" && query.length >= 2 ? query : ""
  );

  // Sync search results to store
  useEffect(() => {
    if (searchQuery.data) {
      setResults(searchQuery.data);
    }
  }, [searchQuery.data, setResults]);

  useEffect(() => {
    setSearching(searchQuery.isLoading);
  }, [searchQuery.isLoading, setSearching]);

  useEffect(() => {
    if (searchQuery.error) {
      setError(searchQuery.error instanceof Error ? searchQuery.error.message : "Search failed");
    }
  }, [searchQuery.error, setError]);

  const handleSearch = useCallback(
    (value: string) => {
      // Debounce the query update
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value) {
        clearSearch();
        return;
      }

      debounceRef.current = setTimeout(() => {
        setQuery(value);
      }, 300);
    },
    [setQuery, clearSearch]
  );

  const handleAsk = useCallback(
    (value: string) => {
      setQuery(value);
      ask(value);
    },
    [setQuery, ask]
  );

  const handleModeChange = useCallback(
    (newMode: SearchMode) => {
      setMode(newMode);
    },
    [setMode]
  );

  const hasResults = results && results.total_count > 0;
  const noResults = results && results.total_count === 0 && query.length >= 2;
  const showSearchResults = mode === "search" && hasResults;
  const showAskPanel = mode === "ask";

  return (
    <div className="space-y-4">
      <SearchBar
        mode={mode}
        onModeChange={handleModeChange}
        onSearch={handleSearch}
        onAsk={handleAsk}
      />

      {/* Loading indicator */}
      {isSearching && mode === "search" && (
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-text-muted">Searching...</span>
        </div>
      )}

      {/* Search mode: show results */}
      {showSearchResults && <SearchResults results={results} />}

      {/* Search mode: no results */}
      {mode === "search" && noResults && !isSearching && (
        <div className="text-center py-8">
          <p className="text-[#94a3b8] text-sm mb-1">
            「{query}」の検索結果はありません
          </p>
          <p className="text-[#64748b] text-xs">
            Try a different keyword, or switch to Ask JBN for AI-powered answers.
          </p>
        </div>
      )}

      {/* Ask mode: show AI panel + collapsed results */}
      {showAskPanel && (
        <div className="space-y-4">
          <AskJbnPanel />
          {hasResults && <SearchResults results={results} collapsed />}
        </div>
      )}
    </div>
  );
}
