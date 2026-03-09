"use client";

import { motion } from "framer-motion";
import { BadgeCheck, FileText } from "lucide-react";

interface Expert {
  name: string;
  role: string;
  roleJa: string;
  posts: number;
  color: string;
}

const EXPERTS: Expert[] = [
  {
    name: "Dr. 田中 美咲",
    role: "Researcher",
    roleJa: "神経科学研究者",
    posts: 47,
    color: "#14b8a6",
  },
  {
    name: "Dr. 佐藤 健一",
    role: "Doctor",
    roleJa: "精神科医",
    posts: 32,
    color: "#0ea5e9",
  },
  {
    name: "山本 翔太",
    role: "Policy Analyst",
    roleJa: "薬事政策アナリスト",
    posts: 58,
    color: "#a855f7",
  },
  {
    name: "Dr. 鈴木 陽子",
    role: "Researcher",
    roleJa: "薬理学研究者",
    posts: 41,
    color: "#22c55e",
  },
  {
    name: "中村 大輔",
    role: "Policy Analyst",
    roleJa: "法規制専門家",
    posts: 29,
    color: "#f59e0b",
  },
  {
    name: "Dr. 渡辺 理恵",
    role: "Doctor",
    roleJa: "緩和医療専門医",
    posts: 23,
    color: "#ec4899",
  },
];

export function ExpertContributors() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60 mb-2">
            Experts
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">認定コントリビューター</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPERTS.map((expert, i) => (
            <motion.div
              key={expert.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${expert.color}, ${expert.color}80)`,
                  }}
                >
                  {expert.name.charAt(expert.name.indexOf(" ") + 1) || expert.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[13px] font-bold text-gray-100">{expert.name}</h3>
                    <BadgeCheck
                      size={14}
                      className="shrink-0"
                      style={{ color: expert.color }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">{expert.roleJa}</p>
                  <div className="flex items-center gap-1.5">
                    <FileText size={10} className="text-gray-600" />
                    <span className="text-[10px] font-mono text-gray-500">
                      {expert.posts} 投稿
                    </span>
                    <span
                      className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ml-2"
                      style={{
                        color: expert.color,
                        backgroundColor: `${expert.color}15`,
                      }}
                    >
                      {expert.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
