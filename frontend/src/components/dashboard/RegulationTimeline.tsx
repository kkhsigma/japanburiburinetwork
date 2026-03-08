"use client";

import { motion } from "framer-motion";
import { timelineEvents, type TimelineEvent } from "@/data/dashboard-mock";

const categoryStyles: Record<TimelineEvent["category"], { dot: string; label: string }> = {
  regulation: { dot: "bg-teal-500", label: "規制" },
  enforcement: { dot: "bg-red-500", label: "執行" },
  review: { dot: "bg-amber-500", label: "審議" },
  publication: { dot: "bg-sky-500", label: "公表" },
};

export function RegulationTimeline() {
  return (
    <section id="timeline" className="px-4 pt-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-5"
        >
          <h2 className="text-lg font-semibold text-gray-900">規制タイムライン</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

          <div className="flex flex-col gap-0">
            {timelineEvents.map((event, i) => {
              const style = categoryStyles[event.category];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 + i * 0.06 }}
                  className="relative pl-7 pb-6 last:pb-0 group"
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-white ${style.dot}`}
                  />

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xs font-mono text-gray-400">{event.date}</span>
                      <span className="text-2xs text-gray-500 px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100">
                        {style.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{event.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
