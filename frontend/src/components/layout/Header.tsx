"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-navy-800/90 backdrop-blur-sm border-b border-navy-600 md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent-green rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">JBN</span>
          </div>
          <span className="text-white font-bold text-sm">Japan Botanical Network</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/explore" className="text-gray-400 hover:text-white transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/alerts" className="relative text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-alert-red rounded-full text-2xs text-white flex items-center justify-center font-bold">
              3
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
