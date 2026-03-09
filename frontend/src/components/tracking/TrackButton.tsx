"use client";

import { useToggleTracking } from '@/hooks/useWatchlistSync';

interface TrackButtonProps {
  compound: { id: string; name: string };
  size?: 'sm' | 'md';
}

export function TrackButton({ compound, size = 'sm' }: TrackButtonProps) {
  const { isTracked, toggle, isLoading } = useToggleTracking(compound);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-1 font-mono tracking-wide
        rounded border transition-all duration-150 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
        disabled:cursor-not-allowed
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[12px]'}
        ${isLoading ? 'animate-pulse' : ''}
        ${
          isTracked
            ? 'bg-accent/20 text-accent-300 border-accent/40 hover:bg-accent/30'
            : 'bg-transparent text-text-muted border-border hover:border-border-hover hover:text-text-secondary'
        }
      `}
    >
      {isTracked ? (
        <>
          <span className="text-accent-300">&#10003;</span>
          <span>追跡中</span>
        </>
      ) : (
        <>
          <span>+</span>
          <span>追跡</span>
        </>
      )}
    </button>
  );
}
