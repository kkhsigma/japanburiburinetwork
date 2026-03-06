"use client";

import { useState, useCallback, useEffect } from "react";
import { TabBar } from "./TabBar";
import { Header } from "./Header";
import { IntroSequence } from "@/components/intro/IntroSequence";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [isShortVersion, setIsShortVersion] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    // Check localStorage for intro display logic
    const lastVisit = localStorage.getItem("jbn_last_visit");
    const introDisabled = localStorage.getItem("jbn_intro_disabled");
    const now = Date.now();

    if (introDisabled === "true") {
      setIntroChecked(true);
      return;
    }

    if (!lastVisit) {
      // First visit - show full version
      setShowIntro(true);
      setIsShortVersion(false);
    } else if (now - parseInt(lastVisit) > 86400000) {
      // More than 24 hours since last visit - show full version
      setShowIntro(true);
      setIsShortVersion(false);
    } else {
      // Within 24 hours - show short version
      setShowIntro(true);
      setIsShortVersion(true);
    }

    setIntroChecked(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem("jbn_last_visit", Date.now().toString());
  }, []);

  // Don't render until intro check is done to avoid flash
  if (!introChecked) return null;

  return (
    <>
      {showIntro && (
        <IntroSequence
          onComplete={handleIntroComplete}
          isShortVersion={isShortVersion}
        />
      )}

      <div className={showIntro ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Header />
        <div className="md:pl-64">
          <main className="pb-20 md:pb-0 min-h-screen">
            {children}
          </main>
        </div>
        <TabBar />
      </div>
    </>
  );
}
