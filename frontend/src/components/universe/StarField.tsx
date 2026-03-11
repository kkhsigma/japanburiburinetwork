"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight canvas-based star field + drifting particles.
 * Runs independently of the Three.js blackhole — no shared state.
 * Covers the full page as a fixed background layer.
 */
export function StarField({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    // Stars — tiny static dots
    const STAR_COUNT = 60;
    const stars: { x: number; y: number; r: number; brightness: number; twinkleSpeed: number }[] = [];

    // Particles — slowly drifting motes
    const PARTICLE_COUNT = 18;
    const particles: { x: number; y: number; r: number; vx: number; vy: number; opacity: number; hue: number }[] = [];

    function resize() {
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      canvas!.width = w;
      canvas!.height = h;
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          brightness: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.002 + 0.001,
        });
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.12 - 0.02, // gently rising
          opacity: Math.random() * 0.3 + 0.05,
          hue: Math.random() > 0.7 ? 170 : Math.random() > 0.5 ? 200 : 45, // teal, blue, or warm
        });
      }
    }

    resize();
    initStars();
    initParticles();

    const onResize = () => {
      resize();
      initStars();
      initParticles();
    };
    window.addEventListener("resize", onResize);

    // Observe document height changes (content loading, etc.)
    let lastH = h;
    const heightCheck = setInterval(() => {
      const newH = document.documentElement.scrollHeight;
      if (newH !== lastH) {
        lastH = newH;
        resize();
      }
    }, 2000);

    let t = 0;
    let lastDraw = 0;
    function draw(now: number) {
      // Throttle to ~20fps — stars don't need 60fps
      if (now - lastDraw < 50) { raf = requestAnimationFrame(draw); return; }
      lastDraw = now;
      t++;
      ctx!.clearRect(0, 0, w, h);

      const isDark = theme === "dark";

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(t * star.twinkleSpeed * 60) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle * (isDark ? 1 : 0.15);
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = isDark
          ? `rgba(200, 220, 255, ${alpha})`
          : `rgba(100, 120, 140, ${alpha})`;
        ctx!.fill();
      }

      // Draw & move particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const flickr = Math.sin(t * 0.02 + p.x * 0.01) * 0.15 + 0.85;
        const alpha = p.opacity * flickr * (isDark ? 1 : 0.2);

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = isDark
          ? `hsla(${p.hue}, 60%, 70%, ${alpha})`
          : `hsla(${p.hue}, 30%, 50%, ${alpha})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(heightCheck);
      window.removeEventListener("resize", onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
