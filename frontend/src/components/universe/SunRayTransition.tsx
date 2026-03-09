"use client";

import { useEffect, useRef } from "react";

interface SunRayTransitionProps {
  active: boolean;
  toTheme: "dark" | "light";
  originX: number;
  originY: number;
  onComplete: () => void;
}

const DURATION = 900;
const RAY_COUNT = 24;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function SunRayTransition({
  active,
  toTheme,
  originX,
  originY,
  onComplete,
}: SunRayTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    startRef.current = performance.now();

    const cx = originX || w / 2;
    const cy = originY || 60;
    const maxDist = Math.sqrt(
      Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2
    ) * 1.2;

    const toLight = toTheme === "light";

    const draw = () => {
      const elapsed = performance.now() - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, w, h);

      if (progress >= 1) {
        cancelAnimationFrame(animRef.current);
        onComplete();
        return;
      }

      const eased = easeOutQuart(progress);

      // Expanding radial fill
      const fillRadius = eased * maxDist;
      const fillGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fillRadius);

      if (toLight) {
        const alpha = Math.min(eased * 1.5, 1) * (1 - Math.max(0, (progress - 0.6) / 0.4));
        fillGrad.addColorStop(0, `rgba(255, 248, 220, ${alpha})`);
        fillGrad.addColorStop(0.4, `rgba(255, 230, 160, ${alpha * 0.8})`);
        fillGrad.addColorStop(0.7, `rgba(255, 255, 255, ${alpha * 0.6})`);
        fillGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
      } else {
        const alpha = Math.min(eased * 1.5, 1) * (1 - Math.max(0, (progress - 0.6) / 0.4));
        fillGrad.addColorStop(0, `rgba(30, 40, 80, ${alpha})`);
        fillGrad.addColorStop(0.4, `rgba(10, 15, 40, ${alpha * 0.8})`);
        fillGrad.addColorStop(0.7, `rgba(2, 6, 12, ${alpha * 0.6})`);
        fillGrad.addColorStop(1, `rgba(2, 6, 12, 0)`);
      }
      ctx.beginPath();
      ctx.arc(cx, cy, fillRadius, 0, Math.PI * 2);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // God rays radiating from origin
      const rayFade = progress < 0.3
        ? progress / 0.3
        : Math.max(0, 1 - (progress - 0.3) / 0.7);

      for (let i = 0; i < RAY_COUNT; i++) {
        const angle = (i / RAY_COUNT) * Math.PI * 2 + i * 0.3;
        const innerR = 10 + eased * 20;
        const outerR = innerR + (80 + Math.sin(i * 1.7) * 40) * (1 + eased * 4);

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const grad = ctx.createLinearGradient(
          cx + cos * innerR, cy + sin * innerR,
          cx + cos * outerR, cy + sin * outerR
        );

        const alpha = rayFade * (0.3 + Math.sin(i * 2.1) * 0.15);

        if (toLight) {
          grad.addColorStop(0, `rgba(255, 220, 80, ${alpha})`);
          grad.addColorStop(0.4, `rgba(255, 200, 60, ${alpha * 0.6})`);
          grad.addColorStop(1, "rgba(255, 200, 60, 0)");
        } else {
          grad.addColorStop(0, `rgba(100, 140, 255, ${alpha})`);
          grad.addColorStop(0.4, `rgba(60, 80, 200, ${alpha * 0.6})`);
          grad.addColorStop(1, "rgba(40, 60, 160, 0)");
        }

        ctx.beginPath();
        ctx.moveTo(cx + cos * innerR, cy + sin * innerR);
        ctx.lineTo(cx + cos * outerR, cy + sin * outerR);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3 + Math.sin(i * 1.3) * 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, toTheme, originX, originY, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
}
