"use client";

interface PaginationProps {
  page: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, hasMore, onPageChange }: PaginationProps) {
  const hasPrev = page > 1;

  return (
    <div className="flex items-center justify-center gap-3 font-mono text-[12px]">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className={`
          px-3 py-1 rounded border transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
          ${
            hasPrev
              ? 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
              : 'border-border/50 text-text-muted/40 cursor-not-allowed'
          }
        `}
      >
        &larr; 前へ
      </button>

      <span className="text-text-muted">
        ページ <span className="text-text-primary">{page}</span> / <span className="text-text-primary">{total}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore}
        className={`
          px-3 py-1 rounded border transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
          ${
            hasMore
              ? 'border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
              : 'border-border/50 text-text-muted/40 cursor-not-allowed'
          }
        `}
      >
        次へ &rarr;
      </button>
    </div>
  );
}
