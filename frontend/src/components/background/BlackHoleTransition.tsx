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

function easeInQuart(t: number): number {
  return t * t * t * t;
}

export function BlackHoleTransition({ transitionState }: BlackHoleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<TransitionState>("idle");
  const stateStartRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const streaksRef = useRef<Streak[]>([]);

  // Initialize speed streaks
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

          // Outer glow
          const glowGrad = ctx.createRadialGradient(
            cx, cy, seedRadius,
            cx, cy, seedRadius + 40 * eased
          );
          glowGrad.addColorStop(0, `rgba(26, 154, 138, ${eased * 0.4})`);
          glowGrad.addColorStop(0.5, `rgba(80, 40, 180, ${eased * 0.15})`);
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, seedRadius + 40 * eased, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
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

        const holeRadius = 10 + eased * 45;
        const rotation = timeRef.current * 0.025;

        // Accretion disk rings (drawn as tilted ellipses)
        ctx.save();
        ctx.translate(cx, cy);

        for (let ring = 4; ring >= 0; ring--) {
          const diskRadius = holeRadius + 12 + ring * 10;
          const ringAlpha = (0.2 - ring * 0.035) * eased;
          const tilt = 0.28 + ring * 0.04;

          ctx.save();
          ctx.rotate(rotation + ring * 0.4);
          ctx.scale(1, tilt);

          ctx.beginPath();
          ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);

          const isTeal = ring < 3;
          ctx.strokeStyle = isTeal
            ? `rgba(26, 154, 138, ${ringAlpha})`
            : `rgba(100, 50, 200, ${ringAlpha * 0.7})`;
          ctx.lineWidth = 2.5 - ring * 0.3;
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();

        // Photon ring — bright thin ring at the edge of the event horizon
        const photonGrad = ctx.createRadialGradient(
          cx, cy, holeRadius - 1,
          cx, cy, holeRadius + 18
        );
        photonGrad.addColorStop(0, `rgba(220, 255, 245, ${eased * 0.7})`);
        photonGrad.addColorStop(0.2, `rgba(26, 154, 138, ${eased * 0.5})`);
        photonGrad.addColorStop(0.5, `rgba(80, 40, 180, ${eased * 0.2})`);
        photonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius + 18, 0, Math.PI * 2);
        ctx.fillStyle = photonGrad;
        ctx.fill();

        // Event horizon — pure black
        ctx.beginPath();
        ctx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      }

      // ── ZOOM: speed streaks, expanding darkness ──
      if (state === "zoom") {
        const progress = Math.min(elapsed / 600, 1);
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

      // ── NAVIGATE: full black ──
      if (state === "navigate") {
        ctx.fillStyle = "#000";
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
