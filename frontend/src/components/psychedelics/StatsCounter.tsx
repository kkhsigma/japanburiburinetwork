"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "規制物質", value: 134, suffix: "" },
  { label: "臨床試験", value: 420, suffix: "+" },
  { label: "研究論文", value: 3100, suffix: "+" },
  { label: "治療承認", value: 12, suffix: "" },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            setCount(Math.round(easeOutCubic(t) * value));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {STATS.map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
            <Counter value={s.value} suffix={s.suffix} />
          </p>
          <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
