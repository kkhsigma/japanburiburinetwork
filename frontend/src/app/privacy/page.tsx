"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-500 mb-8">Last updated: March 6, 2026</p>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              1. Information We Collect
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>JBN collects minimal personal information:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>
                  <strong className="text-gray-300">Device identifier:</strong> A randomly generated
                  anonymous ID stored locally on your device for session continuity
                </li>
                <li>
                  <strong className="text-gray-300">Preferences:</strong> Notification settings,
                  language preferences, watchlist selections (stored locally and optionally synced)
                </li>
                <li>
                  <strong className="text-gray-300">Usage data:</strong> Page views and feature
                  usage for service improvement (anonymized)
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              2. Information We Do Not Collect
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>JBN does not collect:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Real names, email addresses, or phone numbers (in v0)</li>
                <li>Location data or GPS coordinates</li>
                <li>Purchase or transaction history</li>
                <li>Health or medical information</li>
                <li>Browsing history outside of the JBN service</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              3. How We Use Information
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Provide personalized watchlist alerts and notification preferences</li>
                <li>Improve the accuracy and relevance of regulatory alerts</li>
                <li>Maintain and improve service performance</li>
                <li>Detect and prevent abuse of the service</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              4. Data Storage
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Most user preferences are stored locally on your device using browser localStorage.
              When syncing is enabled, data is stored on secure servers. All data transmission uses
              HTTPS encryption. We do not sell, rent, or share personal information with third parties.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              5. Cookies and Local Storage
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              JBN uses browser localStorage to store your preferences, age verification status,
              and session data. We do not use third-party tracking cookies. Essential storage items
              include: age verification (jbn_age_verified), last visit timestamp (jbn_last_visit),
              user preferences, and watchlist data.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              6. Your Rights
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Access any personal data we hold about you</li>
                <li>Request deletion of your data</li>
                <li>Clear all local data by clearing your browser storage</li>
                <li>Opt out of any data syncing features</li>
                <li>Disable push notifications at any time</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              7. Japanese Data Protection
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              JBN complies with the Act on the Protection of Personal Information (APPI) of Japan.
              We process data in accordance with Japanese data protection regulations and ensure
              appropriate safeguards are in place for any cross-border data transfers.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              8. Changes to This Policy
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              9. Contact
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              For privacy-related inquiries, please contact us through the application&apos;s feedback
              mechanism or reach out to our support team.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
