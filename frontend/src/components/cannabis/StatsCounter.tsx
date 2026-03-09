"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatDef {
  label: string;
  value: number;
  suffix?: string;
}

const STATS: StatDef[] = [
  { label: "Active Regulations", value: 147 },
  { label: "Tracked Compounds", value: 86 },
  { label: "Research Papers", value: 2340, suffix: "+" },
  { label: "News Alerts", value: 53 },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let frame = 0;
          const total = 50;
          const step = () => {
            frame++;
            const p = Math.min(frame / total, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(eased * value));
            if (frame < total) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-white">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
          className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
        >
          <Counter value={stat.value} suffix={stat.suffix} />
          <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-gray-500">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
