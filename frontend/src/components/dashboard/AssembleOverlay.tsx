"use client";

import { useEffect, useRef, useState } from "react";

interface Mote {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  delay: number;
}

/**
 * Full-screen overlay that starts white, spawns particles that scatter
 * and fade out — like atoms dispersing to reveal the page beneath.
 */
export function AssembleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
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

    // Create motes — densely packed particles that scatter outward
    const motes: Mote[] = [];
    const count = 350;
    const colors = [
      "rgba(148, 163, 184,",  // slate
      "rgba(26, 154, 138,",   // teal
      "rgba(200, 210, 220,",  // light gray
      "rgba(100, 200, 230,",  // sky
      "rgba(255, 255, 255,",  // white
    ];

    for (let i = 0; i < count; i++) {
      // Start positions — clustered around center with some spread
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(w, h) * 0.3;
      const startX = w / 2 + Math.cos(angle) * dist;
      const startY = h / 2 + Math.sin(angle) * dist;

      // Scatter outward
      const scatterAngle = angle + (Math.random() - 0.5) * 1.2;
      const scatterSpeed = 1 + Math.random() * 3;

      motes.push({
        x: startX,
        y: startY,
        targetX: 0,
        targetY: 0,
        vx: Math.cos(scatterAngle) * scatterSpeed,
        vy: Math.sin(scatterAngle) * scatterSpeed,
        size: 1 + Math.random() * 3.5,
        opacity: 0.4 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 400,
      });
    }

    const startTime = performance.now();
    const totalDuration = 2000;
    let animId: number;

    const draw = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      ctx.clearRect(0, 0, w, h);

      // White background that fades out
      const bgAlpha = progress < 0.3
        ? 1
        : Math.max(0, 1 - ((progress - 0.3) / 0.4));
      if (bgAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw and update motes
      let activeCount = 0;
      for (const mote of motes) {
        const moteProgress = Math.max(0, (elapsed - mote.delay) / (totalDuration - mote.delay));
        if (moteProgress <= 0) {
          activeCount++;
          continue;
        }

        // Scatter motion with deceleration
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.vx *= 0.985;
        mote.vy *= 0.985;

        // Fade out
        const fadeStart = 0.2;
        const alpha = moteProgress < fadeStart
          ? mote.opacity
          : mote.opacity * Math.max(0, 1 - (moteProgress - fadeStart) / (1 - fadeStart));

        if (alpha < 0.005) continue;
        activeCount++;

        const size = mote.size * (1 - moteProgress * 0.5);

        // Draw mote with soft glow
        const glowSize = size * 3;
        const glow = ctx.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, glowSize);
        glow.addColorStop(0, `${mote.color} ${alpha * 0.4})`);
        glow.addColorStop(1, `${mote.color} 0)`);
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `${mote.color} ${alpha})`;
        ctx.fill();
      }

      if (progress >= 1 || activeCount === 0) {
        setDone(true);
        return;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, []);

  if (done) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}
