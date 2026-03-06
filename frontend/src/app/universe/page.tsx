"use client";

import { UniverseCanvas } from "@/components/universe/UniverseCanvas";

export default function UniversePage() {
  return (
    <div className="relative min-h-screen bg-[#02060c] overflow-hidden">
      <UniverseCanvas />
    </div>
  );
}
