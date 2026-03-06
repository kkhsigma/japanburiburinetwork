"use client";

import { useEffect, useRef, useCallback } from "react";

interface GrassCanvasProps {
  progress: number; // 0-100
  splitting: boolean;
  splitProgress: number; // 0-1
}

interface GrassBlade {
  x: number;
  height: number;
  maxHeight: number;
  width: number;
  hue: number;
  swayOffset: number;
  swaySpeed: number;
}

export function GrassCanvas({ progress, splitting, splitProgress }: GrassCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grassRef = useRef<GrassBlade[]>([]);
  const animFrameRef = useRef<number>(0);

  const initGrass = useCallback((width: number) => {
    const isMobile = width < 768;
    const count = isMobile ? 200 : 500;
    const blades: GrassBlade[] = [];

    for (let i = 0; i < count; i++) {
      blades.push({
        x: Math.random() * width,
        height: 0,
        maxHeight: 30 + Math.random() * 80,
        width: 1.5 + Math.random() * 2,
        hue: 100 + Math.random() * 40, // green range
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 1.5,
      });
    }
    grassRef.current = blades;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (grassRef.current.length === 0) {
        initGrass(canvas.width);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a1628");
      gradient.addColorStop(1, "#0f1f38");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.016;
      const growthFactor = Math.min(progress / 100, 1);
      const centerX = canvas.width / 2;

      grassRef.current.forEach((blade) => {
        const currentHeight = blade.maxHeight * growthFactor;
        if (currentHeight <= 0) return;

        const sway = Math.sin(time * blade.swaySpeed + blade.swayOffset) * 3 * growthFactor;

        let drawX = blade.x;
        if (splitting) {
          // Split left/right from center
          const offset = (blade.x < centerX ? -1 : 1) * splitProgress * canvas.width * 0.6;
          drawX = blade.x + offset;
        }

        const baseY = canvas.height;

        ctx.beginPath();
        ctx.moveTo(drawX, baseY);

        // Quadratic curve for natural grass look
        const cp1x = drawX + sway * 0.5;
        const cp1y = baseY - currentHeight * 0.5;
        const tipX = drawX + sway;
        const tipY = baseY - currentHeight;

        ctx.quadraticCurveTo(cp1x, cp1y, tipX, tipY);

        const saturation = 60 + growthFactor * 30;
        const lightness = 25 + growthFactor * 15;
        ctx.strokeStyle = `hsl(${blade.hue}, ${saturation}%, ${lightness}%)`;
        ctx.lineWidth = blade.width;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // Data points (before grass grows)
      if (progress < 30) {
        const pointOpacity = 1 - progress / 30;
        ctx.fillStyle = `rgba(58, 125, 68, ${pointOpacity * 0.6})`;
        for (let i = 0; i < 50; i++) {
          const px = ((i * 137.5) % canvas.width);
          const py = ((i * 89.3) % canvas.height);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [progress, splitting, splitProgress, initGrass]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
    />
  );
}
