"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Bell, Eye, Globe, Info, Shield, Smartphone } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import type { NotificationPreference } from "@/types";

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`w-10 h-6 rounded-full relative transition-colors ${
        enabled ? "bg-accent-green" : "bg-navy-600"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function RadioOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-4 flex items-center justify-between text-left"
    >
      <div>
        <p className="text-sm text-white">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-accent-green" : "border-gray-600"
        }`}
      >
        {selected && (
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
        )}
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const setNotificationPreference = useSettingsStore(
    (s) => s.setNotificationPreference
  );

  const handleNotificationChange = (pref: NotificationPreference) => {
    setNotificationPreference(pref);
  };

  const handleIntroToggle = (enabled: boolean) => {
    updateSetting("intro_enabled", enabled);
    localStorage.setItem("jbn_intro_disabled", enabled ? "false" : "true");
  };

  const handlePushToggle = (enabled: boolean) => {
    updateSetting("push_enabled", enabled);
  };

  const handleLanguageChange = (lang: "technical" | "simplified") => {
    updateSetting("language", lang);
  };

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-1">Profile</h1>
        <p className="text-xs text-gray-400 mb-6">
          Safety & personalization
        </p>

        {/* Notification Settings */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Notification Settings
            </h2>
          </div>
          <Card className="divide-y divide-navy-600">
            <RadioOption
              selected={settings.notification_preference === "critical_only"}
              onSelect={() => handleNotificationChange("critical_only")}
              title="Critical Alerts Only"
              description="Only urgent regulatory changes"
            />
            <RadioOption
              selected={settings.notification_preference === "all"}
              onSelect={() => handleNotificationChange("all")}
              title="All Changes"
              description="Every regulatory update and watchlist change"
            />
          </Card>
        </section>

        {/* Push Notifications */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Push Notifications
            </h2>
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Enable push notifications</p>
                <p className="text-xs text-gray-400">
                  Receive alerts on your device
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.push_enabled}
                onToggle={handlePushToggle}
              />
            </div>
          </Card>
        </section>

        {/* Safety Filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Safety Filters
            </h2>
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Content Filtering</p>
                <p className="text-xs text-gray-400">
                  Hide flagged or unverified content
                </p>
              </div>
              <ToggleSwitch enabled={true} onToggle={() => {}} />
            </div>
          </Card>
        </section>

        {/* Intro Animation Toggle */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Intro Animation
            </h2>
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Show intro sequence</p>
                <p className="text-xs text-gray-400">
                  Data Grass animation on launch
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.intro_enabled}
                onToggle={handleIntroToggle}
              />
            </div>
          </Card>
        </section>

        {/* Language */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">
              Language Display
            </h2>
          </div>
          <Card className="divide-y divide-navy-600">
            <RadioOption
              selected={settings.language === "technical"}
              onSelect={() => handleLanguageChange("technical")}
              title="Technical"
              description="Full legal terminology"
            />
            <RadioOption
              selected={settings.language === "simplified"}
              onSelect={() => handleLanguageChange("simplified")}
              title="Simplified"
              description="Plain language summaries"
            />
          </Card>
        </section>

        {/* Account */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-white">Account</h2>
          </div>
          <Card className="p-4">
            <p className="text-sm text-gray-400">Anonymous (v0)</p>
            <p className="text-xs text-gray-500 mt-1">
              Account system coming in v1
            </p>
          </Card>
        </section>

        {/* Version */}
        <p className="text-center text-2xs text-gray-600">
          JBN v0.1.0 - Regulatory Intelligence System
        </p>
      </div>
    </AppShell>
  );
}
