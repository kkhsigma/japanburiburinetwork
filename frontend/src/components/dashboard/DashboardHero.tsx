"use client";

import { motion } from "framer-motion";

export function DashboardHero() {
  return (
    <section className="pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Japan Buriburi Network
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            日本のカンナビノイド市場の規制変化・指定薬物・製品動向を監視
          </p>
          <p className="mt-1.5 text-xs text-gray-400 max-w-xl mx-auto">
            ニュースではなく、差分とリスクを追うためのインテリジェンスハブ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mt-8"
        >
          <a
            href="#alerts"
            className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            最新アラートを見る
          </a>
          <a
            href="#substances"
            className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm"
          >
            追跡物質を見る
          </a>
        </motion.div>
      </div>
    </section>
  );
}
