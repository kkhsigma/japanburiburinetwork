"use client";

import { motion } from "framer-motion";
import { timelineEvents, type TimelineEvent } from "@/data/dashboard-mock";

const categoryStyles: Record<TimelineEvent["category"], { dot: string; label: string; labelStyle: string }> = {
  regulation:   { dot: "bg-teal-500",  label: "規制",  labelStyle: "text-teal-600 bg-teal-500/10" },
  enforcement:  { dot: "bg-red-500",   label: "執行",  labelStyle: "text-red-600 bg-red-500/10" },
  review:       { dot: "bg-amber-500", label: "審議",  labelStyle: "text-amber-600 bg-amber-500/10" },
  publication:  { dot: "bg-sky-500",   label: "公表",  labelStyle: "text-sky-600 bg-sky-500/10" },
};

export function RegulationTimeline() {
  return (
    <section id="timeline" className="pt-8">
      <div>
        <div className="mb-3">
          <span className="section-label font-mono">規制タイムライン</span>
        </div>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-black/[0.06]" />

          <div className="flex flex-col gap-0">
            {timelineEvents.map((event, i) => {
              const style = categoryStyles[event.category];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                  className="relative pl-6 pb-4 last:pb-0 group"
                >
                  <div className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 border-white ${style.dot}`} />

                  <div className="bg-white/70 backdrop-blur-sm border border-black/[0.06] rounded-lg p-3 hover:bg-white hover:border-black/[0.1] transition-all duration-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono text-gray-400">{event.date}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${style.labelStyle}`}>
                        {style.label}
                      </span>
                    </div>
                    <h3 className="text-[12px] font-semibold text-gray-900 leading-snug">{event.title}</h3>
                    <p className="mt-0.5 text-[11px] text-gray-500">{event.description}</p>
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
