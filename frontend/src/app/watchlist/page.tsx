"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/universe");
  }, [router]);
  return null;
}
