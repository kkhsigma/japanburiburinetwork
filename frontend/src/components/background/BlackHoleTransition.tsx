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

interface Debris {
  angle: number;
  speed: number;
  size: number;
  opacity: number;
  decay: number;
  hue: number; // 0 = white, 1 = teal, 2 = blue
  spin: number;
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
  const debrisRef = useRef<Debris[]>([]);

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

    const debris: Debris[] = [];
    for (let i = 0; i < 200; i++) {
      debris.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 4,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
        decay: 0.985 + Math.random() * 0.012,
        hue: Math.floor(Math.random() * 3),
        spin: (Math.random() - 0.5) * 0.02,
      });
    }
    debrisRef.current = debris;
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

      // ── SUPERNOVA: multi-phase white explosion ──
      if (state === "supernova") {
        const duration = 2200;
        const progress = Math.min(elapsed / duration, 1);
        const maxDim = Math.sqrt(w * w + h * h);
        const streaks = streaksRef.current;
        const debris = debrisRef.current;

        // Base: start from black
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);

        // ─── Phase 1 (0–15%): Core compression & ignition ───
        if (progress < 0.15) {
          const p = progress / 0.15;
          const compress = 1 - easeInQuart(p) * 0.5; // shrinks then rebounds
          const coreR = 8 * compress;
          const intensity = easeOutCubic(p);

          // Hot teal-white core
          const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR + 30 * intensity);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
          coreGrad.addColorStop(0.3, `rgba(180, 255, 245, ${intensity * 0.8})`);
          coreGrad.addColorStop(0.6, `rgba(26, 154, 138, ${intensity * 0.4})`);
          coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, coreR + 30 * intensity, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
          ctx.fill();
        }

        // ─── Phase 2 (10–50%): Blast wave + god rays ───
        if (progress >= 0.10 && progress < 0.50) {
          const p = (progress - 0.10) / 0.40;
          const blastEased = easeOutQuint(p);

          // Primary shockwave ring
          const ringRadius = blastEased * maxDim * 0.55;
          const ringWidth = 3 + (1 - p) * 12;
          const ringAlpha = (1 - p) * 0.9;
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
          ctx.lineWidth = ringWidth;
          ctx.stroke();

          // Secondary shockwave (delayed, teal-tinted)
          if (p > 0.15) {
            const p2 = (p - 0.15) / 0.85;
            const ring2Radius = easeOutQuint(p2) * maxDim * 0.45;
            const ring2Alpha = (1 - p2) * 0.4;
            ctx.beginPath();
            ctx.arc(cx, cy, ring2Radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(26, 154, 138, ${ring2Alpha})`;
            ctx.lineWidth = 2 + (1 - p2) * 6;
            ctx.stroke();
          }

          // Third shockwave (faint, wider)
          if (p > 0.3) {
            const p3 = (p - 0.3) / 0.7;
            const ring3Radius = easeOutQuint(p3) * maxDim * 0.35;
            const ring3Alpha = (1 - p3) * 0.2;
            ctx.beginPath();
            ctx.arc(cx, cy, ring3Radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 230, 255, ${ring3Alpha})`;
            ctx.lineWidth = 1 + (1 - p3) * 4;
            ctx.stroke();
          }

          // God rays — volumetric light streaks
          const rayFade = p < 0.3 ? p / 0.3 : Math.max(0, 1 - (p - 0.3) / 0.7);
          for (const streak of streaks) {
            const innerDist = 5 + blastEased * 20;
            const outerDist = innerDist + streak.length * (1.5 + blastEased * 6);
            const rayAngle = streak.angle + streak.speed * 0.005 * elapsed;
            const cos = Math.cos(rayAngle);
            const sin = Math.sin(rayAngle);

            const grad = ctx.createLinearGradient(
              cx + cos * innerDist, cy + sin * innerDist,
              cx + cos * outerDist, cy + sin * outerDist
            );
            const alpha = streak.opacity * rayFade * 0.7;
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.2})`);
            grad.addColorStop(0.2, `rgba(220, 255, 248, ${alpha})`);
            grad.addColorStop(0.5, `rgba(26, 154, 138, ${alpha * 0.4})`);
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.beginPath();
            ctx.moveTo(cx + cos * innerDist, cy + sin * innerDist);
            ctx.lineTo(cx + cos * outerDist, cy + sin * outerDist);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5 + streak.speed * 0.6;
            ctx.stroke();
          }

          // Expanding hot core behind the rays
          const coreRadius = 10 + blastEased * 80;
          const coreAlpha = (1 - p * 0.6);
          const hotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
          hotGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
          hotGrad.addColorStop(0.4, `rgba(200, 255, 245, ${coreAlpha * 0.7})`);
          hotGrad.addColorStop(0.7, `rgba(26, 154, 138, ${coreAlpha * 0.25})`);
          hotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
          ctx.fillStyle = hotGrad;
          ctx.fill();
        }

        // ─── Phase 3 (20–70%): Debris field ───
        if (progress >= 0.20 && progress < 0.70) {
          const p = (progress - 0.20) / 0.50;
          const debrisFade = p < 0.3 ? p / 0.3 : Math.max(0, 1 - (p - 0.3) / 0.7);

          for (const d of debris) {
            const dist = d.speed * easeOutCubic(p) * maxDim * 0.35;
            const angle = d.angle + d.spin * elapsed;
            const dx = cx + Math.cos(angle) * dist;
            const dy = cy + Math.sin(angle) * dist;

            // Skip if offscreen
            if (dx < -20 || dx > w + 20 || dy < -20 || dy > h + 20) continue;

            const alpha = d.opacity * debrisFade;
            if (alpha < 0.01) continue;

            const colors = [
              `rgba(255, 255, 255, ${alpha})`,
              `rgba(26, 154, 138, ${alpha * 0.8})`,
              `rgba(100, 200, 230, ${alpha * 0.7})`,
            ];

            // Draw debris particle with trail
            const trailLen = d.speed * 4 * (1 - p);
            if (trailLen > 1) {
              const tx = cx + Math.cos(angle) * (dist - trailLen);
              const ty = cy + Math.sin(angle) * (dist - trailLen);
              const trailGrad = ctx.createLinearGradient(tx, ty, dx, dy);
              trailGrad.addColorStop(0, "rgba(255,255,255,0)");
              trailGrad.addColorStop(1, colors[d.hue]);
              ctx.beginPath();
              ctx.moveTo(tx, ty);
              ctx.lineTo(dx, dy);
              ctx.strokeStyle = trailGrad;
              ctx.lineWidth = d.size * 0.6;
              ctx.stroke();
            }

            // Particle dot
            ctx.beginPath();
            ctx.arc(dx, dy, d.size * (1 - p * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = colors[d.hue];
            ctx.fill();
          }
        }

        // ─── Phase 4 (15–45%): Anamorphic lens flare (horizontal streak) ───
        if (progress >= 0.15 && progress < 0.45) {
          const p = (progress - 0.15) / 0.30;
          const flareAlpha = p < 0.3 ? easeOutCubic(p / 0.3) : (1 - (p - 0.3) / 0.7);
          const flareWidth = maxDim * 0.8 * easeOutQuint(p);
          const flareHeight = 2 + (1 - p) * 8;

          const flareGrad = ctx.createLinearGradient(
            cx - flareWidth / 2, cy,
            cx + flareWidth / 2, cy
          );
          flareGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          flareGrad.addColorStop(0.2, `rgba(180, 240, 255, ${flareAlpha * 0.3})`);
          flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flareAlpha * 0.8})`);
          flareGrad.addColorStop(0.8, `rgba(180, 240, 255, ${flareAlpha * 0.3})`);
          flareGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = flareGrad;
          ctx.fillRect(cx - flareWidth / 2, cy - flareHeight / 2, flareWidth, flareHeight);

          // Vertical cross flare (dimmer)
          const vFlareWidth = 1.5 + (1 - p) * 4;
          const vFlareHeight = maxDim * 0.4 * easeOutQuint(p);
          const vGrad = ctx.createLinearGradient(
            cx, cy - vFlareHeight / 2,
            cx, cy + vFlareHeight / 2
          );
          vGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          vGrad.addColorStop(0.5, `rgba(255, 255, 255, ${flareAlpha * 0.4})`);
          vGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = vGrad;
          ctx.fillRect(cx - vFlareWidth / 2, cy - vFlareHeight / 2, vFlareWidth, vFlareHeight);
        }

        // ─── Phase 5 (40–100%): Cinematic wash — teal flash → white → fade to deep space ───
        if (progress > 0.40) {
          const p = (progress - 0.40) / 0.60;
          const washEased = easeInOutCubic(Math.min(p * 1.3, 1));

          // Stage A (0–40%): Teal-white energy flood expanding from center
          if (p < 0.4) {
            const sp = p / 0.4;
            const floodRadius = easeOutQuint(sp) * maxDim * 0.8;
            const floodGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, floodRadius);
            floodGrad.addColorStop(0, `rgba(255, 255, 255, ${sp})`);
            floodGrad.addColorStop(0.3, `rgba(200, 255, 245, ${sp * 0.9})`);
            floodGrad.addColorStop(0.6, `rgba(26, 154, 138, ${sp * 0.5})`);
            floodGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.beginPath();
            ctx.arc(cx, cy, floodRadius, 0, Math.PI * 2);
            ctx.fillStyle = floodGrad;
            ctx.fill();
          }

          // Stage B (30–65%): Full white bloom
          if (p >= 0.30 && p < 0.65) {
            const sp = (p - 0.30) / 0.35;
            const whiteAlpha = sp < 0.5 ? easeOutCubic(sp * 2) : 1;
            ctx.fillStyle = `rgba(255, 255, 255, ${whiteAlpha})`;
            ctx.fillRect(0, 0, w, h);
          }

          // Stage C (60–100%): White fades through teal to deep space
          if (p >= 0.60) {
            const sp = (p - 0.60) / 0.40;
            const fadeEased = easeInOutCubic(sp);

            // Interpolate: white → teal tint → deep space dark
            const r = Math.round(255 - fadeEased * 249); // 255 → 6
            const g = Math.round(255 - fadeEased * 246); // 255 → 9
            const b = Math.round(255 - fadeEased * 240); // 255 → 15
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(0, 0, w, h);

            // Subtle teal vignette during the fade
            if (sp > 0.2 && sp < 0.8) {
              const tealP = sp < 0.5 ? (sp - 0.2) / 0.3 : (0.8 - sp) / 0.3;
              const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.5);
              vigGrad.addColorStop(0, `rgba(26, 154, 138, ${tealP * 0.08})`);
              vigGrad.addColorStop(0.5, `rgba(26, 154, 138, ${tealP * 0.04})`);
              vigGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.beginPath();
              ctx.arc(cx, cy, maxDim * 0.5, 0, Math.PI * 2);
              ctx.fillStyle = vigGrad;
              ctx.fill();
            }
          }
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
