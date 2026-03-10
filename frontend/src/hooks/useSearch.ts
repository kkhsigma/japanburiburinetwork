import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { fetchSearch, getAskJbnStreamUrl } from '@/lib/api';
import { useSearchStore } from '@/stores/searchStore';
import type { HybridSearchResult } from '@/types';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const result = await fetchSearch(query);
      return result.data;
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}

export function useAskJbn() {
  const abortRef = useRef<AbortController | null>(null);
  const { appendAiText, setAiStreaming, setAiError, resetAi, setResults } = useSearchStore();

  const ask = useCallback(async (query: string, language: 'en' | 'ja' = 'ja') => {
    abortRef.current?.abort();
    resetAi();
    setAiStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = getAskJbnStreamUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language, stream: true }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.total_count !== undefined) {
                setResults(data as HybridSearchResult);
              } else if (data.text) {
                appendAiText(data.text);
              }
            } catch { /* skip unparseable */ }
          }
          if (line.startsWith('event: error')) {
            setAiError('An error occurred while generating the answer.');
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setAiError(err.message || 'Failed to get AI response');
      }
    } finally {
      setAiStreaming(false);
    }
  }, [appendAiText, setAiStreaming, setAiError, resetAi, setResults]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setAiStreaming(false);
  }, [setAiStreaming]);

  return { ask, cancel };
}
