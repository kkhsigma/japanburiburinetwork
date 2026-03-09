"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PenLine, MessageSquare } from "lucide-react";

/* ─── Particle background ─── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  hue: number;
}

function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let w = (cvs.width = cvs.offsetWidth * 2);
    let h = (cvs.height = cvs.offsetHeight * 2);
    ctx.scale(2, 2);

    const particles: Particle[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * w * 0.5,
      y: Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      hue: 35 + Math.random() * 25,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w * 0.5) p.vx *= -1;
        if (p.y < 0 || p.y > h * 0.5) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = cvs.width = cvs.offsetWidth * 2;
      h = cvs.height = cvs.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─── Animated counter ─── */
function Counter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
        {count.toLocaleString()}+
      </p>
      <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

interface HeroSectionProps {
  onCreateBlog: () => void;
  onStartDiscussion: () => void;
}

export function HeroSection({ onCreateBlog, onStartDiscussion }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #020810 0%, #0d0a04 40%, #020810 100%)",
        }}
      />
      <ParticleBg />

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500/60 mb-4">
            JBN Community
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #d4a72d 0%, #f59e0b 50%, #d97706 100%)",
              }}
            >
              Community Knowledge Network
            </span>
          </h1>
          <p className="text-gray-400 text-[14px] sm:text-[16px] mt-4 max-w-2xl mx-auto leading-relaxed">
            物質科学、政策、ハームリダクションに関するリサーチ・分析・ディスカッション
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={onCreateBlog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-mono font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50 transition-all duration-200"
          >
            <PenLine size={14} />
            ブログを書く
          </button>
          <button
            onClick={onStartDiscussion}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-mono font-medium bg-white/[0.04] text-gray-300 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
          >
            <MessageSquare size={14} />
            ディスカッション
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-12 mt-12"
        >
          <Counter target={1240} label="Total Posts" />
          <Counter target={386} label="Contributors" />
          <Counter target={214} label="Blogs Published" />
        </motion.div>
      </div>
    </section>
  );
}
