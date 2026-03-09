"use client";

import { useState } from "react";
import { HeroSection } from "@/components/community/HeroSection";
import { FeaturedBlogs } from "@/components/community/FeaturedBlogs";
import { TrendingTopics } from "@/components/community/TrendingTopics";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { ExpertContributors } from "@/components/community/ExpertContributors";
import { KnowledgeCollections } from "@/components/community/KnowledgeCollections";
import { CommunityGuidelines } from "@/components/community/CommunityGuidelines";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { ReportModal } from "@/components/community/ReportModal";

export default function CommunityPage() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<"blog" | "discussion">("blog");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  const openCreateBlog = () => {
    setCreateModalType("blog");
    setCreateModalOpen(true);
  };

  const openCreateDiscussion = () => {
    setCreateModalType("discussion");
    setCreateModalOpen(true);
  };

  const openReport = (postId: string) => {
    setReportPostId(postId);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#020810] text-gray-100">
      {/* Back to universe link */}
      <div className="fixed top-4 left-4 z-50">
        <a
          href="/universe"
          className="inline-flex items-center gap-2 text-[11px] font-mono text-gray-500 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#020810]/80 backdrop-blur-sm"
        >
          ← Universe
        </a>
      </div>

      <HeroSection onCreateBlog={openCreateBlog} onStartDiscussion={openCreateDiscussion} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <FeaturedBlogs />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <TrendingTopics activeTopic={activeTopic} onTopicClick={setActiveTopic} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <CommunityFeed topicFilter={activeTopic} onReport={openReport} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <ExpertContributors />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <KnowledgeCollections />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <CommunityGuidelines />

      <footer className="px-6 py-12 text-center">
        <p className="text-[10px] font-mono text-gray-600 tracking-wide">
          JBN Community — 教育・研究・政策議論のためのプラットフォーム
        </p>
      </footer>

      {/* Modals */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultType={createModalType}
      />
      <ReportModal
        isOpen={reportModalOpen}
        postId={reportPostId}
        onClose={() => {
          setReportModalOpen(false);
          setReportPostId(null);
        }}
      />
    </div>
  );
}
