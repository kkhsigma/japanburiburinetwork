"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

export function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
        <Eye size={20} className="text-[#64748b]" />
      </div>
      <p className="text-[#94a3b8] text-base font-medium mb-2">
        まだ物質を追跡していません
      </p>
      <p className="text-[#64748b] text-xs mb-5 max-w-xs">
        Track compounds to get notified about regulatory changes, enforcement actions, and status updates.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a9a8a]/10 border border-[#1a9a8a]/30 text-[#1a9a8a] hover:bg-[#1a9a8a]/20 text-sm font-medium transition-colors"
      >
        探索ページで物質を見つける &rarr;
      </Link>
    </div>
  );
}
