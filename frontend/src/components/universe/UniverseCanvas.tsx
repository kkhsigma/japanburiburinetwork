"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const STAR_COUNT = 300;

export function UniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const startRef = useRef(0);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    startRef.current = performance.now();

    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.3 + Math.random() * 1.8,
        brightness: 0.12 + Math.random() * 0.65,
        twinkleSpeed: 0.003 + Math.random() * 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const elapsed = performance.now() - startRef.current;
      const scale = Math.min(w, h) / 800;

      // Background
      ctx.fillStyle = "#02060c";
      ctx.fillRect(0, 0, w, h);

      // Stars
      const starAlpha =
        elapsed < 700 ? 0 : Math.min((elapsed - 700) / 1000, 1);
      if (starAlpha > 0) {
        for (const star of starsRef.current) {
          star.twinklePhase += star.twinkleSpeed;
          const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
          const a = star.brightness * twinkle * starAlpha;
          ctx.beginPath();
          ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.fill();
        }
      }

      // Subtle nebula
      if (starAlpha > 0) {
        const nebA = starAlpha * 0.035;
        const n1 = ctx.createRadialGradient(
          cx * 0.65, cy * 0.55, 0,
          cx * 0.65, cy * 0.55, 300 * scale
        );
        n1.addColorStop(0, `rgba(100, 50, 200, ${nebA})`);
        n1.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = n1;
        ctx.fillRect(0, 0, w, h);

        const n2 = ctx.createRadialGradient(
          cx * 1.35, cy * 1.25, 0,
          cx * 1.35, cy * 1.25, 250 * scale
        );
        n2.addColorStop(0, `rgba(26, 154, 138, ${nebA * 0.6})`);
        n2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = n2;
        ctx.fillRect(0, 0, w, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "#02060c",
      }}
    />
  );
}
