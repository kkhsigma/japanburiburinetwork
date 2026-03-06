"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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

        <h1 className="text-2xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-xs text-gray-500 mb-8">Last updated: March 6, 2026</p>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              By accessing or using the Japan Buriburi Network (JBN) service, you agree to be bound
              by these Terms of Service. If you do not agree to these terms, you may not use the service.
              JBN is intended for individuals who are 20 years of age or older under Japanese law.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              2. Service Description
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              JBN is a regulatory intelligence platform that tracks legal status changes, enforcement
              timelines, and compliance risks related to cannabinoid regulations in Japan. The service
              aggregates publicly available information from official government sources and provides
              analysis and alerts.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              3. Disclaimer of Advice
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              The information provided by JBN is for informational purposes only and does not constitute
              legal, medical, financial, or professional advice of any kind. You should always consult
              with qualified professionals and verify information with official government sources before
              making any decisions based on information from this service. JBN does not guarantee the
              accuracy, completeness, or timeliness of any information presented.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              4. Prohibited Uses
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>You agree NOT to use JBN to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Facilitate the purchase, sale, or distribution of illegal substances</li>
                <li>Evade law enforcement or regulatory compliance</li>
                <li>Provide medical or dosage advice to others</li>
                <li>Reproduce or redistribute content without attribution</li>
                <li>Attempt to reverse-engineer or interfere with the service</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              5. Content Policy
            </h2>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2">
              <p>The following types of content are strictly prohibited on JBN:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Dosage advice or consumption guidance for any substance</li>
                <li>Methods or strategies for evading drug detection or testing</li>
                <li>Medical claims about any compound or product</li>
                <li>Guidance on illegal use, procurement, or distribution of controlled substances</li>
                <li>Content that promotes non-compliance with Japanese regulations</li>
              </ul>
              <p className="text-gray-400">
                JBN reserves the right to remove any content that violates this policy without notice.
                Users who repeatedly violate these guidelines may be restricted from accessing the service.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              6. Source Attribution
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              JBN provides source tier ratings and primary source links for all regulatory information.
              Users are responsible for verifying information with the original official sources.
              Source tiers range from Tier 1 (official government publications) to Tier 5 (unverified reports).
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              JBN and its operators shall not be liable for any direct, indirect, incidental, special,
              consequential, or punitive damages resulting from your use of or inability to use the
              service. This includes, but is not limited to, damages arising from reliance on any
              information obtained through the service.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              8. Changes to Terms
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be posted on this
              page with an updated revision date. Continued use of the service after changes constitutes
              acceptance of the revised terms.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-accent-green uppercase tracking-wider mb-3">
              9. Governing Law
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of Japan.
              Any disputes arising from or relating to these terms shall be subject to the exclusive
              jurisdiction of the courts of Tokyo, Japan.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
