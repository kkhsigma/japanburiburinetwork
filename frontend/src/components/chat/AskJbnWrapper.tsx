"use client";

import dynamic from "next/dynamic";

const AskJbn = dynamic(() => import("./AskJbn").then((m) => m.AskJbn), {
  ssr: false,
});

export function AskJbnWrapper() {
  return <AskJbn />;
}
