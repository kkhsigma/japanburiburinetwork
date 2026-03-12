"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Leaf,
  Sparkles,
  FlaskConical,
  BookOpen,
  ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface CategoryCardsProps {
  theme?: "dark" | "light";
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
}

// ─── Main Component ──────────────────────────────────────

export function CategoryCards({ theme = "dark" }: CategoryCardsProps) {
  const isDark = theme === "dark";

  const categories: Category[] = [
    {
      id: "cannabis",
      name: "カンナビノイド",
      nameEn: "Cannabinoids",
      description: "CBD・CBN・CBGなど主要成分の規制動向と市場情報",
      href: "/cannabis",
      icon: <Leaf size={24} />,
      accentColor: "#22c55e",
      glowColor: "rgba(34, 197, 94, 0.15)",
    },
    {
      id: "psychedelics",
      name: "サイケデリクス",
      nameEn: "Psychedelics",
      description: "研究動向・法規制・医療応用に関する最新情報",
      href: "/psychedelics",
      icon: <Sparkles size={24} />,
      accentColor: "#a855f7",
      glowColor: "rgba(168, 85, 247, 0.15)",
    },
    {
      id: "others",
      name: "その他成分",
      nameEn: "Others",
      description: "新規成分・研究中物質の監視レポート",
      href: "/explore?category=others",
      icon: <FlaskConical size={24} />,
      accentColor: "#06b6d4",
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    {
      id: "community",
      name: "コミュニティ",
      nameEn: "Community",
      description: "業界ニュース・分析記事・ディスカッション",
      href: "/community",
      icon: <BookOpen size={24} />,
      accentColor: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
  ];

  // Theme styles
  const cardBg = isDark
    ? "bg-gradient-to-br from-gray-900/70 to-gray-950/70"
    : "bg-gradient-to-br from-white/90 to-gray-50/90";
  const cardBorder = isDark
    ? "border-gray-800/50"
    : "border-gray-200/80";
  const cardHoverBorder = isDark
    ? "hover:border-gray-700/60"
    : "hover:border-gray-300";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const textSubtle = isDark ? "text-gray-500" : "text-gray-400";
  const iconBg = isDark ? "bg-gray-800/50" : "bg-gray-100";

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className={`text-xs uppercase tracking-[0.2em] ${textMuted} font-medium`}>
            Explore Categories
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={category.href} className="block h-full group">
                <div
                  className={`
                    relative h-full rounded-xl overflow-hidden p-5
                    ${cardBg} border ${cardBorder} ${cardHoverBorder}
                    transition-all duration-300
                    hover:shadow-xl hover:-translate-y-1
                  `}
                  style={{
                    boxShadow: isDark ? `0 0 0 0 ${category.glowColor}` : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (isDark) {
                      e.currentTarget.style.boxShadow = `0 8px 32px ${category.glowColor}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) {
                      e.currentTarget.style.boxShadow = `0 0 0 0 ${category.glowColor}`;
                    }
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(90deg, transparent, ${category.accentColor}, transparent)` }}
                  />

                  {/* Icon */}
                  <div
                    className={`
                      inline-flex p-3 rounded-lg mb-4
                      ${iconBg}
                      transition-transform duration-500
                      group-hover:rotate-[360deg]
                    `}
                    style={{ color: category.accentColor }}
                  >
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div>
                      <h3 className={`text-base font-medium ${textPrimary} mb-0.5`}>
                        {category.name}
                      </h3>
                      <p className={`text-[10px] uppercase tracking-[0.1em] ${textSubtle}`}>
                        {category.nameEn}
                      </p>
                    </div>
                    <p className={`text-[12px] ${textMuted} leading-relaxed line-clamp-2`}>
                      {category.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`
                      absolute bottom-4 right-4
                      opacity-0 group-hover:opacity-100
                      translate-x-2 group-hover:translate-x-0
                      transition-all duration-300
                    `}
                    style={{ color: category.accentColor }}
                  >
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
