"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-navy-700/60 ${className}`}
    />
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="bg-surface-elevated rounded-xl border border-border p-4 border-l-4 border-l-navy-500">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function CompoundCardSkeleton() {
  return (
    <div className="bg-surface-elevated rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}
