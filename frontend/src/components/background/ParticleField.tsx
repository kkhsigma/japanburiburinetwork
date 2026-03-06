"use client";

import { useEffect, useRef, useCallback } from "react";

interface ParticleFieldProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  layer: number; // 0 = far/slow, 1 = mid, 2 = near/fast
  color: string;
}

interface SignalNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
  glowColor: string;
}

const PARTICLE_COUNT = 100;
const SIGNAL_NODE_COUNT = 4;
const CONNECTION_DISTANCE = 120;
const CURSOR_RADIUS = 150;
const CURSOR_FORCE = 0.3;

const LAYER_SPEEDS = [0.15, 0.3, 0.5];

const PARTICLE_COLORS = [
  "rgba(26, 154, 138,", // teal
  "rgba(26, 154, 138,", // teal
  "rgba(100, 200, 190,", // light cyan
  "rgba(180, 210, 210,", // muted white-cyan
  "rgba(255, 255, 255,", // white
];

const SIGNAL_CONFIGS = [
  { color: "#1a9a8a", glowColor: "rgba(26, 154, 138, 0.15)" },
  { color: "#1a9a8a", glowColor: "rgba(26, 154, 138, 0.12)" },
  { color: "#d4a72d", glowColor: "rgba(212, 167, 45, 0.10)" },
  { color: "#1a9a8a", glowColor: "rgba(26, 154, 138, 0.12)" },
];

export function ParticleField({ className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const particlesRef = useRef<Particle[]>([]);
  const signalNodesRef = useRef<SignalNode[]>([]);
  const timeRef = useRef(0);
  const dprRef = useRef(1);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const layer = i < 30 ? 0 : i < 70 ? 1 : 2;
      const colorBase =
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.4,
        layer,
        color: colorBase,
      });
    }
    particlesRef.current = particles;

    const signals: SignalNode[] = [];
    for (let i = 0; i < SIGNAL_NODE_COUNT; i++) {
      const config = SIGNAL_CONFIGS[i % SIGNAL_CONFIGS.length];
      signals.push({
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.15 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 3 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.006,
        color: config.color,
        glowColor: config.glowColor,
      });
    }
    signalNodesRef.current = signals;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += 1;
      const mouse = mouseRef.current;

      const particles = particlesRef.current;
      const signals = signalNodesRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const speed = LAYER_SPEEDS[p.layer];

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Cursor interaction — gentle repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS && dist > 0) {
            const force =
              (1 - dist / CURSOR_RADIUS) * CURSOR_FORCE * speed;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Dampen velocity
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Ensure minimum drift
        const totalV = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (totalV < 0.05) {
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }

        // Wrap around edges with padding
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.fill();
      }

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity =
              0.05 + 0.1 * (1 - dist / CONNECTION_DISTANCE);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(26, 154, 138, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw connections from signal nodes to nearby particles
      for (let s = 0; s < signals.length; s++) {
        const sn = signals[s];
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = sn.x - p.x;
          const dy = sn.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE * 1.5) {
            const opacity =
              0.04 + 0.08 * (1 - dist / (CONNECTION_DISTANCE * 1.5));
            ctx.beginPath();
            ctx.moveTo(sn.x, sn.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(26, 154, 138, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update and draw signal nodes
      for (let s = 0; s < signals.length; s++) {
        const sn = signals[s];
        sn.x += sn.vx;
        sn.y += sn.vy;

        // Bounce off edges softly
        if (sn.x < 50 || sn.x > w - 50) sn.vx *= -1;
        if (sn.y < 50 || sn.y > h - 50) sn.vy *= -1;

        sn.pulsePhase += sn.pulseSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(sn.pulsePhase);
        const glowRadius = sn.radius + 12 + pulse * 8;

        // Glow ring (radial gradient)
        const gradient = ctx.createRadialGradient(
          sn.x,
          sn.y,
          sn.radius,
          sn.x,
          sn.y,
          glowRadius
        );
        gradient.addColorStop(0, sn.glowColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, sn.radius + pulse * 1, 0, Math.PI * 2);
        ctx.fillStyle = sn.color;
        ctx.globalAlpha = 0.6 + pulse * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "linear-gradient(180deg, #06090f 0%, #0c1220 100%)",
        pointerEvents: "none",
      }}
    />
  );
}
