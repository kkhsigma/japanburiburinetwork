"use client";

import { ParticleField } from "@/components/background/ParticleField";
import { HeroSection } from "@/components/hero/HeroSection";
import { SignalFeed } from "@/components/hero/SignalFeed";
import { NotificationToast } from "@/components/notifications/NotificationToast";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-[#06090f]">
      <ParticleField />
      <HeroSection />
      <SignalFeed />
      <NotificationToast />
      <div className="fixed bottom-4 right-4 z-10">
        <span className="text-[10px] font-mono text-[#64748b]/30">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </span>
      </div>
    </div>
  );
}
