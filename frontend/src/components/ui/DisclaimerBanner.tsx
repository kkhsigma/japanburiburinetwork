"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

const SESSION_KEY = "jbn_disclaimer_dismissed";

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check sessionStorage so banner reappears each new browser session
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed !== "true") {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-20 md:pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-navy-700/95 backdrop-blur-sm border border-navy-500 rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-lg">
          <AlertTriangle size={14} className="text-alert-yellow flex-shrink-0" />
          <p className="text-xs text-gray-400 flex-1">
            This is not medical or legal advice. Always verify with{" "}
            <span className="text-gray-300">official sources</span>.
          </p>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label="Dismiss disclaimer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
