"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ──────────────────────────────────────────────

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface NovaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rgb: string;
}

interface PlanetColors {
  highlight: string; // "r, g, b"
  base: string;
  shadow: string;
  glow: string;
  ring?: string;
}

interface PlanetDef {
  id: string;
  label: string;
  sublabel: string;
  baseRadius: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
  hasRings: boolean;
  colors: PlanetColors;
}

// ─── Planet definitions ─────────────────────────────────

const PLANETS: PlanetDef[] = [
  {
    id: "cannabis",
    label: "カンナビス",
    sublabel: "Cannabis",
    baseRadius: 58,
    orbitRadius: 195,
    orbitSpeed: 0.12,
    orbitOffset: -Math.PI / 6,
    hasRings: false,
    colors: {
      highlight: "150, 245, 170",
      base: "34, 140, 60",
      shadow: "10, 55, 22",
      glow: "34, 197, 94",
    },
  },
  {
    id: "psychedelics",
    label: "サイケデリクス",
    sublabel: "Psychedelics",
    baseRadius: 50,
    orbitRadius: 330,
    orbitSpeed: 0.08,
    orbitOffset: (Math.PI * 2) / 3 - Math.PI / 6,
    hasRings: true,
    colors: {
      highlight: "210, 160, 255",
      base: "120, 58, 230",
      shadow: "40, 16, 90",
      glow: "150, 100, 255",
      ring: "185, 145, 255",
    },
  },
  {
    id: "others",
    label: "その他の物質",
    sublabel: "Other Substances",
    baseRadius: 44,
    orbitRadius: 455,
    orbitSpeed: 0.055,
    orbitOffset: (Math.PI * 4) / 3 - Math.PI / 6,
    hasRings: false,
    colors: {
      highlight: "140, 240, 255",
      base: "15, 150, 180",
      shadow: "8, 48, 68",
      glow: "40, 215, 240",
    },
  },
];

const STAR_COUNT = 300;
const NOVA_COUNT = 150;

// ─── Easing ─────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// ─── Component ──────────────────────────────────────────

export function UniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const startRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const novaRef = useRef<NovaParticle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const planetPosRef = useRef<
    Map<string, { x: number; y: number; r: number }>
  >(new Map());
  const routerRef = useRef<ReturnType<typeof useRouter> | null>(null);
  const router = useRouter();
  routerRef.current = router;

  useEffect(() => {
    startRef.current = performance.now();

    // ── Init stars ──
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

    // ── Init nova particles ──
    const particles: NovaParticle[] = [];
    for (let i = 0; i < NOVA_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 14;
      const isWarm = Math.random() > 0.35;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.8 + Math.random() * 2.5,
        opacity: 0.4 + Math.random() * 0.6,
        rgb: isWarm ? "255, 240, 220" : "200, 220, 255",
      });
    }
    novaRef.current = particles;

    // ── Canvas setup ──
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

    // ── Event listeners ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) mouseRef.current = { x: t.clientX, y: t.clientY };
    };

    const onClick = (e: MouseEvent | TouchEvent) => {
      let cx: number, cy: number;
      if ("touches" in e) {
        const t = (e as TouchEvent).changedTouches[0];
        if (!t) return;
        cx = t.clientX;
        cy = t.clientY;
      } else {
        cx = (e as MouseEvent).clientX;
        cy = (e as MouseEvent).clientY;
      }
      for (const [id, pos] of planetPosRef.current) {
        const dx = cx - pos.x;
        const dy = cy - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < pos.r + 18) {
          routerRef.current?.push(`/explore?category=${id}`);
          return;
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchend", onClick);

    // ── Draw loop ──
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const elapsed = performance.now() - startRef.current;
      const scale = Math.min(w, h) / 800;
      const orbitTilt = w > 768 ? 0.35 : 0.5;

      // Background
      ctx.fillStyle = "#02060c";
      ctx.fillRect(0, 0, w, h);

      // ── STARS (fade in from 700ms) ────────────────────
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

      // ── SUBTLE NEBULA ─────────────────────────────────
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

      // ── NOVA PARTICLES (80ms – 2800ms) ────────────────
      if (elapsed > 80 && elapsed < 2800) {
        for (const p of novaRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.984;
          p.vy *= 0.984;
          p.opacity *= 0.992;
          if (p.opacity < 0.01) continue;

          const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (vel > 0.5) {
            const len = Math.min(vel * 2.5, 25);
            const nx = p.vx / vel;
            const ny = p.vy / vel;
            ctx.beginPath();
            ctx.moveTo(cx + p.x - nx * len, cy + p.y - ny * len);
            ctx.lineTo(cx + p.x, cy + p.y);
            ctx.strokeStyle = `rgba(${p.rgb}, ${p.opacity * 0.4})`;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.rgb}, ${p.opacity})`;
          ctx.fill();
        }
      }

      // ── SUPERNOVA FLASH (0 – 900ms) ───────────────────
      if (elapsed < 900) {
        const t = elapsed / 900;
        const flashAlpha =
          t < 0.18
            ? easeOutCubic(t / 0.18) * 0.95
            : Math.max(0, 0.95 * (1 - (t - 0.18) / 0.82));
        const flashR = t * Math.max(w, h) * 0.9;

        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        fg.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        fg.addColorStop(0.12, `rgba(255, 250, 235, ${flashAlpha * 0.85})`);
        fg.addColorStop(0.35, `rgba(255, 240, 210, ${flashAlpha * 0.4})`);
        fg.addColorStop(0.65, `rgba(200, 220, 255, ${flashAlpha * 0.12})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fillStyle = fg;
        ctx.fill();

        // Primary shockwave
        if (t > 0.08) {
          const rt = (t - 0.08) / 0.92;
          const rr = easeOutCubic(rt) * Math.max(w, h) * 0.85;
          const ra = Math.max(0, (1 - rt) * 0.45);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 240, 255, ${ra})`;
          ctx.lineWidth = 2 + (1 - rt) * 6;
          ctx.stroke();
        }

        // Secondary shockwave (warm)
        if (t > 0.22) {
          const rt = (t - 0.22) / 0.78;
          const rr = easeOutCubic(rt) * Math.max(w, h) * 0.6;
          const ra = Math.max(0, (1 - rt) * 0.22);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 225, 190, ${ra})`;
          ctx.lineWidth = 1 + (1 - rt) * 3;
          ctx.stroke();
        }
      }

      // ── PLANETS (appear from 1500ms) ──────────────────
      const planetProgress =
        elapsed < 1500 ? 0 : Math.min((elapsed - 1500) / 1000, 1);

      if (planetProgress > 0) {
        const time = elapsed * 0.001;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        let newHovered: string | null = null;
        const alpha = easeOutCubic(planetProgress);

        // Central glow (JBN core)
        const coreA = alpha * 0.18;
        const cg = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, 65 * scale
        );
        cg.addColorStop(0, `rgba(26, 154, 138, ${coreA * 2.5})`);
        cg.addColorStop(0.4, `rgba(26, 154, 138, ${coreA})`);
        cg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, 65 * scale, 0, Math.PI * 2);
        ctx.fill();

        // JBN text at center
        const ta = alpha * 0.45;
        ctx.font = `bold ${Math.round(22 * scale)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(26, 154, 138, ${ta})`;
        ctx.fillText("JBN", cx, cy);

        // ── Render each planet ──
        for (const planet of PLANETS) {
          const orbitR = planet.orbitRadius * scale;
          const angle = time * planet.orbitSpeed + planet.orbitOffset;
          const px = cx + Math.cos(angle) * orbitR;
          const py = cy + Math.sin(angle) * orbitR * orbitTilt;
          const scaleIn = easeOutBack(Math.min(planetProgress * 1.4, 1));
          const pr = Math.max(planet.baseRadius * scale, 22) * scaleIn;

          planetPosRef.current.set(planet.id, { x: px, y: py, r: pr });

          // Hit test
          const dx = mx - px;
          const dy = my - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const isHovered = dist < pr + 18;
          if (isHovered) newHovered = planet.id;

          // Orbit path
          ctx.beginPath();
          ctx.ellipse(cx, cy, orbitR, orbitR * orbitTilt, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.025 * alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          const hm = isHovered ? 1.12 : 1;
          const er = pr * hm;

          // Atmosphere glow
          const glowR = er * (isHovered ? 2.8 : 1.9);
          const glowA = (isHovered ? 0.28 : 0.1) * alpha;
          const gg = ctx.createRadialGradient(
            px, py, er * 0.6,
            px, py, glowR
          );
          gg.addColorStop(0, `rgba(${planet.colors.glow}, ${glowA})`);
          gg.addColorStop(0.4, `rgba(${planet.colors.glow}, ${glowA * 0.2})`);
          gg.addColorStop(1, `rgba(${planet.colors.glow}, 0)`);
          ctx.beginPath();
          ctx.arc(px, py, glowR, 0, Math.PI * 2);
          ctx.fillStyle = gg;
          ctx.fill();

          // Rings — back half (behind planet body)
          if (planet.hasRings && planet.colors.ring) {
            drawRingHalf(ctx, px, py, er, planet.colors, alpha, false);
          }

          // Planet body — 3D gradient sphere
          const lx = px - er * 0.3;
          const ly = py - er * 0.3;
          const bg = ctx.createRadialGradient(
            lx, ly, er * 0.05,
            px + er * 0.15, py + er * 0.15, er
          );
          bg.addColorStop(0, `rgba(${planet.colors.highlight}, ${alpha})`);
          bg.addColorStop(0.5, `rgba(${planet.colors.base}, ${alpha})`);
          bg.addColorStop(1, `rgba(${planet.colors.shadow}, ${alpha})`);
          ctx.beginPath();
          ctx.arc(px, py, er, 0, Math.PI * 2);
          ctx.fillStyle = bg;
          ctx.fill();

          // Specular highlight
          const sg = ctx.createRadialGradient(
            lx, ly, 0,
            lx + er * 0.15, ly + er * 0.15, er * 0.5
          );
          sg.addColorStop(0, `rgba(255, 255, 255, ${0.32 * alpha})`);
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.beginPath();
          ctx.arc(px, py, er, 0, Math.PI * 2);
          ctx.fillStyle = sg;
          ctx.fill();

          // Rings — front half (over planet body)
          if (planet.hasRings && planet.colors.ring) {
            drawRingHalf(ctx, px, py, er, planet.colors, alpha, true);
          }

          // Label
          if (alpha > 0.25) {
            const la = ((alpha - 0.25) / 0.75) * (isHovered ? 1 : 0.7);
            const fs = Math.max(scale, 0.75);
            const labelY = py + er + 18;

            ctx.font = `600 ${Math.round(13 * fs)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = `rgba(232, 236, 241, ${la * 0.85})`;
            ctx.fillText(planet.label, px, labelY);

            ctx.font = `${Math.round(10 * fs)}px ui-monospace, monospace`;
            ctx.fillStyle = `rgba(232, 236, 241, ${la * 0.35})`;
            ctx.fillText(planet.sublabel, px, labelY + 18 * fs);
          }
        }

        // Update cursor
        canvas.style.cursor = newHovered ? "pointer" : "default";
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchend", onClick);
      cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

// ─── Ring drawing helper ────────────────────────────────

function drawRingHalf(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  er: number,
  colors: PlanetColors,
  alpha: number,
  isFront: boolean
) {
  if (!colors.ring) return;

  ctx.save();
  ctx.translate(px, py);

  // Clip to top (back) or bottom (front) half
  ctx.beginPath();
  if (isFront) {
    ctx.rect(-er * 3, 0, er * 6, er * 3);
  } else {
    ctx.rect(-er * 3, -er * 3, er * 6, er * 3);
  }
  ctx.clip();

  ctx.scale(1, 0.28);

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, er * 1.95, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${colors.ring}, ${(isFront ? 0.28 : 0.18) * alpha})`;
  ctx.lineWidth = er * 0.16;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(0, 0, er * 1.55, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${colors.highlight}, ${(isFront ? 0.18 : 0.1) * alpha})`;
  ctx.lineWidth = er * 0.07;
  ctx.stroke();

  ctx.restore();
}
