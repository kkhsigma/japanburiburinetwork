"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CompoundCard } from "@/components/explore/CompoundCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Card } from "@/components/ui/Card";
import { CompoundCardSkeleton } from "@/components/ui/Skeleton";
import { mockCompounds } from "@/lib/mock-data";
import { useCompounds } from "@/hooks/useCompounds";
import { Beaker, Scale, Building2 } from "lucide-react";

type ExploreTab = "compounds" | "laws" | "agencies";

const LAWS_LINKS = [
  { title: "Cannabis Control Act (Amended)", description: "MHLW official page on the revised law", icon: Scale },
  { title: "Designated Substances List (PDF)", description: "Official list of all designated substances", icon: Beaker },
  { title: "THC Residual Limit Notice (PDF)", description: "Official THC limit values and analysis methods", icon: Beaker },
  { title: "CBD Import Manual (NCD)", description: "CBD product import verification procedures", icon: Building2 },
  { title: "Product Category Classification (PDF)", description: "Oil, powder, aqueous solution categories", icon: Beaker },
  { title: "e-Gov Public Comments", description: "Active and past public comment periods", icon: Scale },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>("compounds");
  const [searchQuery, setSearchQuery] = useState("");

  // React Query hook — fall back to mock data while backend is unavailable
  const compoundsQuery = useCompounds();
  const compoundsData = compoundsQuery.data?.data ?? mockCompounds;
  const isLoadingCompounds = compoundsQuery.isLoading;

  const filteredCompounds = searchQuery
    ? compoundsData.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : compoundsData;

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-1">Explore</h1>
        <p className="text-xs text-gray-400 mb-4">Entity verification hub</p>

        <SearchBar
          placeholder="Search compounds, laws, agencies..."
          onSearch={setSearchQuery}
          className="mb-6"
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-navy-800 rounded-lg p-1">
          {(
            [
              { id: "compounds", label: "Compounds", icon: Beaker },
              { id: "laws", label: "Laws & Docs", icon: Scale },
              { id: "agencies", label: "Agencies", icon: Building2 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors
                  ${activeTab === tab.id ? "bg-navy-600 text-white" : "text-gray-400 hover:text-gray-300"}
                `}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compounds tab */}
        {activeTab === "compounds" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoadingCompounds
              ? Array.from({ length: 6 }).map((_, i) => <CompoundCardSkeleton key={i} />)
              : filteredCompounds.map((compound) => (
                  <CompoundCard key={compound.id} compound={compound} />
                ))
            }
          </div>
        )}

        {/* Laws tab */}
        {activeTab === "laws" && (
          <div className="space-y-3">
            {LAWS_LINKS.map((law, i) => {
              const Icon = law.icon;
              return (
                <Card key={i} hoverable className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{law.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{law.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Agencies tab */}
        {activeTab === "agencies" && (
          <div className="space-y-3">
            {[
              { name: "MHLW", full: "Ministry of Health, Labour and Welfare", desc: "Primary regulatory body. Manages designated substances, THC limits, Cannabis Control Act." },
              { name: "NCD", full: "Narcotics Control Department", desc: "CBD import verification, non-correspondence forms, enforcement." },
              { name: "Consumer Affairs Agency", full: "Consumer Affairs Agency", desc: "Consumer safety alerts, product recalls, misleading labeling enforcement." },
              { name: "NPA", full: "National Police Agency", desc: "Drug enforcement, seizure reports, criminal statistics." },
            ].map((agency, i) => (
              <Card key={i} hoverable className="p-4">
                <h3 className="text-sm font-bold text-white">{agency.name}</h3>
                <p className="text-2xs text-gray-500 mb-1">{agency.full}</p>
                <p className="text-xs text-gray-400">{agency.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
