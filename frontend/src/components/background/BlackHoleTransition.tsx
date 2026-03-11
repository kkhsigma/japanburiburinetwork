"use client";

import { useEffect, useRef } from "react";
import type { TransitionState } from "@/types";

interface BlackHoleTransitionProps {
  transitionState: TransitionState;
}

interface Streak {
  angle: number;
  length: number;
  speed: number;
  opacity: number;
  offset: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function easeInQuart(t: number): number {
  return t * t * t * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function BlackHoleTransition({ transitionState }: BlackHoleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<TransitionState>("idle");
  const stateStartRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const streaksRef = useRef<Streak[]>([]);

  // Initialize speed streaks and debris
  useEffect(() => {
    const streaks: Streak[] = [];
    for (let i = 0; i < 80; i++) {
      streaks.push({
        angle: Math.random() * Math.PI * 2,
        length: 40 + Math.random() * 180,
        speed: 1.5 + Math.random() * 4,
        opacity: 0.05 + Math.random() * 0.35,
        offset: Math.random() * 100,
      });
    }
    streaksRef.current = streaks;

  }, []);

  // Track state changes with timestamp
  useEffect(() => {
    if (stateRef.current !== transitionState) {
      stateRef.current = transitionState;
      stateStartRef.current = performance.now();
    }
  }, [transitionState]);

  useEffect(() => {
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
      const state = stateRef.current;
      const now = performance.now();
      const elapsed = now - stateStartRef.current;
      timeRef.current += 1;

      ctx.clearRect(0, 0, w, h);

      if (state === "idle") {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // ── COLLAPSING: vignette darkens, seed appears ──
      if (state === "collapsing") {
        const progress = Math.min(elapsed / 700, 1);

        // Vignette darkening from edges
        const vignetteRadius = Math.max(w, h) * (1.1 - progress * 0.3);
        const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vignetteRadius);
        vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${progress * 0.6})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);

        // Seed of singularity at end of collapse
        if (progress > 0.6) {
          const seedProgress = (progress - 0.6) / 0.4;
          const eased = easeOutCubic(seedProgress);
          const seedRadius = eased * 10;

          // Outer glow — layered for depth
          const outerR = seedRadius + 60 * eased;
          const glowGrad = ctx.createRadialGradient(
            cx, cy, seedRadius,
            cx, cy, outerR
          );
          glowGrad.addColorStop(0, `rgba(180, 255, 245, ${eased * 0.5})`);
          glowGrad.addColorStop(0.25, `rgba(26, 154, 138, ${eased * 0.4})`);
          glowGrad.addColorStop(0.55, `rgba(80, 40, 180, ${eased * 0.18})`);
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Inner hot ring
          const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, seedRadius + 5);
          innerGlow.addColorStop(0, `rgba(255, 255, 255, ${eased * 0.6})`);
          innerGlow.addColorStop(0.6, `rgba(26, 154, 138, ${eased * 0.3})`);
          innerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, seedRadius + 5, 0, Math.PI * 2);
          ctx.fillStyle = innerGlow;
          ctx.fill();

          // Dark seed
          ctx.beginPath();
          ctx.arc(cx, cy, seedRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#000";
          ctx.fill();
        }
      }

      // ── SINGULARITY: black hole grows, accretion disk ──
      if (state === "singularity") {
        const progress = Math.min(elapsed / 700, 1);
        const eased = easeOutCubic(progress);

        // Deep vignette
        const vignetteRadius = Math.max(w, h) * (0.8 - eased * 0.15);
        const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vignetteRadius);
        vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(0.3, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.6 + eased * 0.25})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);

        const holeRadius = 10 + eased * 50;
        const rotation = timeRef.current * 0.02;

        // Accretion disk rings (drawn as tilted ellipses)
        ctx.save();
        ctx.translate(cx, cy);

        for (let ring = 6; ring >= 0; ring--) {
          const diskRadius = holeRadius + 14 + ring * 9;
          const ringAlpha = (0.25 - ring * 0.03) * eased;
          const tilt = 0.25 + ring * 0.035;

          ctx.save();
          ctx.rotate(rotation + ring * 0.35);
          ctx.scale(1, tilt);

          ctx.beginPath();
          ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);

          // Color gradient: inner rings hot teal, outer rings purple
          const ringT = ring / 6;
          const r = Math.round(26 + ringT * 74);
          const g = Math.round(154 - ringT * 114);
          const b = Math.round(138 + ringT * 62);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringAlpha})`;
          ctx.lineWidth = 3 - ring * 0.3;
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();

        // Photon ring — bright thin ring at the edge of the event horizon
        const photonGrad = ctx.createRadialGradient(
          cx, cy, holeRadius - 2,
          cx, cy, holeRadius + 24
        );
        photonGrad.addColorStop(0, `rgba(255, 255, 255, ${eased * 0.5})`);
        photonGrad.addColorStop(0.1, `rgba(220, 255, 245, ${eased * 0.8})`);
        photonGrad.addColorStop(0.3, `rgba(26, 154, 138, ${eased * 0.5})`);
        photonGrad.addColorStop(0.6, `rgba(80, 40, 180, ${eased * 0.2})`);
        photonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius + 24, 0, Math.PI * 2);
        ctx.fillStyle = photonGrad;
        ctx.fill();

        // Event horizon — pure black
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      }

      // ── ZOOM: speed streaks, expanding darkness, ends in pure black ──
      if (state === "zoom") {
        const progress = Math.min(elapsed / 800, 1);
        const eased = easeInQuart(progress);

        // Dark overlay intensifying
        ctx.fillStyle = `rgba(0, 0, 0, ${0.85 + eased * 0.15})`;
        ctx.fillRect(0, 0, w, h);

        // Speed streaks radiating from center
        const streaks = streaksRef.current;
        if (progress < 0.85) {
          const streakIntensity = Math.min(progress * 3, 1) * (1 - progress * 0.8);
          for (const streak of streaks) {
            const innerDist = 20 + streak.offset * (1 - progress);
            const outerDist = innerDist + streak.length * (1 + progress * 3);

            const cos = Math.cos(streak.angle);
            const sin = Math.sin(streak.angle);

            const grad = ctx.createLinearGradient(
              cx + cos * innerDist, cy + sin * innerDist,
              cx + cos * outerDist, cy + sin * outerDist
            );
            const alpha = streak.opacity * streakIntensity;
            grad.addColorStop(0, `rgba(26, 154, 138, 0)`);
            grad.addColorStop(0.3, `rgba(26, 154, 138, ${alpha})`);
            grad.addColorStop(0.7, `rgba(100, 200, 190, ${alpha * 0.6})`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.beginPath();
            ctx.moveTo(cx + cos * innerDist, cy + sin * innerDist);
            ctx.lineTo(cx + cos * outerDist, cy + sin * outerDist);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1 + streak.speed * 0.3;
            ctx.stroke();
          }
        }

        // Brief bright flash at the moment of zoom
        if (progress < 0.15) {
          const flashAlpha = (1 - progress / 0.15) * 0.4;
          const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
          flashGrad.addColorStop(0, `rgba(200, 255, 240, ${flashAlpha})`);
          flashGrad.addColorStop(0.5, `rgba(26, 154, 138, ${flashAlpha * 0.3})`);
          flashGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, 120, 0, Math.PI * 2);
          ctx.fillStyle = flashGrad;
          ctx.fill();
        }

        // Expanding event horizon fills the screen
        const maxDim = Math.sqrt(w * w + h * h);
        const holeRadius = 55 + eased * maxDim;
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      }

      // ── WARP TUNNEL: hyperspace streaking star lines ──
      if (state === "warp") {
        const elapsed = now - stateStartRef.current;
        const duration = 2000; // 2s warp
        const progress = Math.min(elapsed / duration, 1);
        const maxDim = Math.sqrt(w * w + h * h);

        // Dark background — always present
        ctx.fillStyle = "#06090f";
        ctx.fillRect(0, 0, w, h);

        // Intensity curve: gentle ramp up from black → sustain → fade to dark
        let intensity: number;
        if (progress < 0.25) {
          // Slow emergence from darkness
          intensity = easeOutCubic(progress / 0.25);
        } else if (progress < 0.70) {
          intensity = 1;
        } else {
          // Smooth fade out
          intensity = 1 - easeInOutCubic((progress - 0.70) / 0.30);
        }

        // Streaks accelerate over time — speed ramps up then slows
        let speedMultiplier: number;
        if (progress < 0.2) {
          speedMultiplier = 0.3 + easeOutCubic(progress / 0.2) * 0.7;
        } else if (progress < 0.7) {
          speedMultiplier = 1.0 + (progress - 0.2) * 0.6; // gradually faster
        } else {
          speedMultiplier = 1.3 - easeInOutCubic((progress - 0.7) / 0.3) * 0.8;
        }

        if (intensity > 0.01) {
          // Subtle radial vignette (teal tint)
          const vigRadius = maxDim * 0.6;
          const vig = ctx.createRadialGradient(cx, cy, 0, cx, cy, vigRadius);
          vig.addColorStop(0, `rgba(26, 154, 138, ${0.05 * intensity})`);
          vig.addColorStop(0.4, `rgba(10, 60, 80, ${0.035 * intensity})`);
          vig.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, vigRadius, 0, Math.PI * 2);
          ctx.fillStyle = vig;
          ctx.fill();

          // Warp streaks — lines radiating from center
          const streakCount = 140;
          const time = elapsed * 0.001 * speedMultiplier;
          ctx.lineCap = "round";

          for (let i = 0; i < streakCount; i++) {
            const angle = (i / streakCount) * Math.PI * 2 + i * 0.618;
            const baseSpeed = 0.25 + (i % 7) * 0.1;
            const cycle = ((time * baseSpeed + i * 0.037) % 1);
            const dist = cycle * maxDim * 0.75;
            // Streaks get longer as speed increases
            const len = (25 + (i % 5) * 20) * intensity * (0.3 + cycle * 0.7) * speedMultiplier;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const x1 = cx + cos * dist;
            const y1 = cy + sin * dist;
            const x2 = cx + cos * (dist + len);
            const y2 = cy + sin * (dist + len);

            // Color: mix of white, teal, and blue
            const hue = i % 3;
            let r: number, g: number, b: number;
            if (hue === 0) { r = 220; g = 240; b = 255; }
            else if (hue === 1) { r = 80; g = 220; b = 200; }
            else { r = 100; g = 160; b = 255; }

            const flicker = 0.5 + (i * 7 + Math.floor(elapsed * 0.05)) % 3 * 0.17;
            const alpha = (0.12 + (1 - cycle) * 0.45) * intensity * flicker;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.7 + (1 - cycle) * 1.8 * speedMultiplier;
            ctx.stroke();
          }

          // Central vanishing point glow
          const coreR = Math.max(35 * intensity, 1);
          const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
          coreGlow.addColorStop(0, `rgba(200, 240, 255, ${0.35 * intensity})`);
          coreGlow.addColorStop(0.3, `rgba(26, 154, 138, ${0.12 * intensity})`);
          coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = coreGlow;
          ctx.fill();

          // Wider soft glow
          const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
          outerGlow.addColorStop(0, `rgba(26, 154, 138, ${0.05 * intensity})`);
          outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, 90, 0, Math.PI * 2);
          ctx.fillStyle = outerGlow;
          ctx.fill();
        }
      }

      // ── NAVIGATE: deep space (matches universe page bg) ──
      if (state === "navigate") {
        ctx.fillStyle = "#06090f";
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
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
}
