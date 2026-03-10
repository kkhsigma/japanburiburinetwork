"use client";

import { motion } from "framer-motion";
import { timelineEvents, type TimelineEvent } from "@/data/dashboard-mock";

const categoryStyles: Record<TimelineEvent["category"], { dot: string; label: string; labelStyle: string }> = {
  regulation:   { dot: "bg-teal-500",  label: "規制",  labelStyle: "text-teal-400 bg-teal-500/15" },
  enforcement:  { dot: "bg-red-500",   label: "執行",  labelStyle: "text-red-400 bg-red-500/15" },
  review:       { dot: "bg-amber-500", label: "審議",  labelStyle: "text-amber-400 bg-amber-500/15" },
  publication:  { dot: "bg-sky-500",   label: "公表",  labelStyle: "text-sky-400 bg-sky-500/15" },
};

export function RegulationTimeline() {
  return (
    <section id="timeline" className="pt-8">
      <div>
        <div className="mb-3">
          <span className="text-[11px] font-semibold font-mono tracking-widest uppercase text-gray-400">規制タイムライン</span>
        </div>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.06]" />

          <div className="flex flex-col gap-0">
            {timelineEvents.map((event, i) => {
              const style = categoryStyles[event.category];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -4 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  className="relative pl-6 pb-4 last:pb-0 group"
                >
                  <div className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2 border-[#080c14] ${style.dot} shadow-[0_0_6px_rgba(255,255,255,0.1)]`} />

                  <div className="border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm rounded-lg p-3 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono text-gray-500">{event.date}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${style.labelStyle}`}>
                        {style.label}
                      </span>
                    </div>
                    <h3 className="text-[12px] font-semibold text-gray-200 leading-snug">{event.title}</h3>
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
