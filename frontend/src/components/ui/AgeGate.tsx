"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";

const STORAGE_KEY = "jbn_age_verified";

export function AgeGate() {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(STORAGE_KEY);
    if (!verified) {
      setShowGate(true);
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowGate(false);
  };

  const handleNo = () => {
    // Redirect away from the site
    window.location.href = "https://www.google.com";
  };

  if (!showGate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-navy-700 border border-navy-500 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
        {/* Logo / Brand */}
        <div className="w-14 h-14 rounded-full bg-accent-green/10 border border-accent-green/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-accent-green">JBN</span>
        </div>

        <h2 className="text-lg font-bold text-white mb-2">Age Verification</h2>
        <p className="text-sm text-gray-400 mb-1">Japan Botanical Network</p>
        <p className="text-sm text-gray-300 mt-4 mb-6">
          Are you 20 years or older?
        </p>
        <p className="text-xs text-gray-500 mb-6">
          This service contains regulatory information about controlled and designated
          substances in Japan. You must be 20 years or older to access this content.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleNo}
          >
            No, I am under 20
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleYes}
          >
            Yes, I am 20+
          </Button>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-2xs text-gray-600">
          <a href="/terms" className="hover:text-gray-400 transition-colors">
            Terms of Service
          </a>
          <a href="/privacy" className="hover:text-gray-400 transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
