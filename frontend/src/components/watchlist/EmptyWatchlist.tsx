"use client";

import Link from "next/link";

export function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-[#64748b] text-lg mb-4">
        まだ物質を追跡していません
      </p>
      <Link
        href="/explore"
        className="text-[#1a9a8a] hover:text-[#22b8a6] text-sm font-medium transition-colors"
      >
        探索ページで物質を見つける &rarr;
      </Link>
    </div>
  );
}
