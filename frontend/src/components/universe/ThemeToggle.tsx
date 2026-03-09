"use client";

import { useRef, useEffect } from "react";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

const RAY_COUNT = 12;

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const burstRef = useRef<number | null>(null);
  const isDark = theme === "dark";

  const handleClick = () => {
    burstRef.current = performance.now();
    onToggle();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 120;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = SIZE / 2;
    const cy = SIZE / 2;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const now = performance.now();
      const burstStart = burstRef.current;
      let burstProgress = -1;
      if (burstStart !== null) {
        burstProgress = (now - burstStart) / 600;
        if (burstProgress > 1) {
          burstRef.current = null;
          burstProgress = -1;
        }
      }

      // Outer glow
      const glowRadius = isDark ? 28 : 32;
      const glowColor = isDark
        ? "rgba(100, 140, 255, 0.12)"
        : "rgba(255, 200, 60, 0.2)";
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays (light mode) or moon crescent shadow (dark mode)
      if (!isDark) {
        const t = now * 0.001;
        for (let i = 0; i < RAY_COUNT; i++) {
          const angle = (i / RAY_COUNT) * Math.PI * 2 + t * 0.15;
          const innerR = 16;
          const outerR = 24 + Math.sin(t * 2 + i) * 4;
          const rayWidth = 2;

          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const rayGrad = ctx.createLinearGradient(
            cx + cos * innerR, cy + sin * innerR,
            cx + cos * outerR, cy + sin * outerR
          );
          rayGrad.addColorStop(0, "rgba(255, 200, 60, 0.7)");
          rayGrad.addColorStop(1, "rgba(255, 200, 60, 0)");

          ctx.beginPath();
          ctx.moveTo(cx + cos * innerR, cy + sin * innerR);
          ctx.lineTo(cx + cos * outerR, cy + sin * outerR);
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = rayWidth;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // Main circle (sun or moon)
      const radius = 12;
      if (isDark) {
        // Moon
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#c8d6e5";
        ctx.fill();

        // Crescent shadow
        ctx.beginPath();
        ctx.arc(cx + 5, cy - 3, radius - 1, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1a2e";
        ctx.fill();
      } else {
        // Sun
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        sunGrad.addColorStop(0, "#fff8e0");
        sunGrad.addColorStop(0.7, "#ffc83d");
        sunGrad.addColorStop(1, "#f0a020");
        ctx.fillStyle = sunGrad;
        ctx.fill();
      }

      // Burst rays on toggle
      if (burstProgress >= 0) {
        const eased = 1 - Math.pow(1 - burstProgress, 3);
        const burstAlpha = 1 - burstProgress;
        const burstColor = isDark
          ? `rgba(100, 140, 255, ${burstAlpha * 0.6})`
          : `rgba(255, 200, 60, ${burstAlpha * 0.8})`;

        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const innerR = 14 + eased * 8;
          const outerR = 20 + eased * 30;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(cx + cos * innerR, cy + sin * innerR);
          ctx.lineTo(cx + cos * outerR, cy + sin * outerR);
          ctx.strokeStyle = burstColor;
          ctx.lineWidth = 2 * (1 - burstProgress);
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isDark]);

  return (
    <button
      onClick={handleClick}
      className="relative cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-none"
      style={{ width: 48, height: 48 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}
