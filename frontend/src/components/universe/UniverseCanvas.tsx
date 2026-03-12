"use client";

import { useRef, useMemo, useState, useEffect, createContext, useContext, Fragment, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { mockCompounds } from "@/lib/mock-data";

// ─── Intro Animation Context ────────────────────────────
const IntroContext = createContext({ skipIntro: false });

// ─── Procedural Noise ───────────────────────────────────

function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise2d(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function noise3d(x: number, y: number, z: number): number {
  return (noise2d(x + z * 31.7, y) + noise2d(y + x * 17.3, z) + noise2d(z + y * 23.1, x)) / 3;
}

function fbm3d(x: number, y: number, z: number, octaves: number): number {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * noise3d(x * freq, y * freq, z * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return v;
}

// ─── Equirectangular Planet Texture ─────────────────────

function generatePlanetMap(worldId: string): HTMLCanvasElement {
  const W = 256, H = 128;
  const cvs = document.createElement("canvas");
  cvs.width = W;
  cvs.height = H;
  const ctx = cvs.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const d = img.data;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const u = px / W;
      const v = py / H;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = Math.sin(phi) * Math.sin(theta);

      let cr: number, cg: number, cb: number;

      if (worldId === "cannabis") {
        const cont = fbm3d(sx * 3.5 + 1.2, sy * 3.5, sz * 3.5, 4);
        const det = fbm3d(sx * 9 + 3.7, sy * 9 + 1.2, sz * 9, 3);
        const mst = fbm3d(sx * 5 + 7.1, sy * 5 + 4.4, sz * 5, 2);
        const cld = fbm3d(sx * 2.5 + 0.3, sy * 2.5 + 0.7, sz * 2.5, 3);
        if (cont > 0.4) {
          const el = (cont - 0.4) * 3.5;
          if (el < 0.25) {
            cr = 28 + det * 30 + mst * 15;
            cg = 110 + det * 40 + mst * 25;
            cb = 22 + det * 18;
          } else if (el < 0.55) {
            cr = 15 + det * 20;
            cg = 80 + det * 30;
            cb = 12 + det * 12;
          } else if (el < 0.8) {
            const t = (el - 0.55) / 0.25;
            cr = 60 + t * 40 + det * 35;
            cg = 55 + t * 35 + det * 30;
            cb = 40 + t * 30 + det * 25;
          } else {
            const t = Math.min((el - 0.8) * 5, 1);
            cr = 100 + t * 140;
            cg = 95 + t * 145;
            cb = 90 + t * 150;
          }
        } else {
          const dp = (0.4 - cont) * 5;
          cr = 6;
          cg = 30 + dp * 15 + det * 20;
          cb = 80 + dp * 40 + det * 25;
          if (dp < 0.3) { cg += (1 - dp / 0.3) * 40; }
        }
        if (cld > 0.5) {
          const ca = Math.min((cld - 0.5) * 3.5, 1);
          cr = cr * (1 - ca) + 235 * ca;
          cg = cg * (1 - ca) + 240 * ca;
          cb = cb * (1 - ca) + 245 * ca;
        }
      } else if (worldId === "psychedelics") {
        const turb = fbm3d(sx * 4.5 + 1.5, sy * 8 + 0.8, sz * 4.5, 4);
        const flow = fbm3d(sx * 2 + turb * 2.5, sy * 4, sz * 2, 3);
        const storm = fbm3d(sx * 1.8 + 7.3, sy * 1.8 + 2.1, sz * 1.8, 4);
        const bandBase = sy * 7;
        const band = Math.sin(bandBase + turb * 3.5 + flow * 1.5) * 0.5 + 0.5;
        const swirl = Math.sin(sx * 12 + turb * 5 + sy * 4) * 0.5 + 0.5;
        const mix1 = band * 0.55 + turb * 0.35 + swirl * 0.1;
        cr = 65 + mix1 * 120 + flow * 25;
        cg = 15 + mix1 * 45 + flow * 15;
        cb = 110 + mix1 * 100 + flow * 20;
        const hotBand = Math.pow(Math.max(0, Math.sin(bandBase * 0.7 + turb * 2)), 8);
        cr += hotBand * 90;
        cg += hotBand * 50;
        cb += hotBand * 40;
        const sDist = Math.sqrt((sx - 0.3) ** 2 + (sy + 0.2) ** 2 + (sz - 0.4) ** 2);
        if (sDist < 0.5) {
          const eye = 1 - sDist / 0.5;
          const esw = fbm3d(sx * 15, sy * 8, sz * 15, 3);
          cr += eye * 80 * esw;
          cg += eye * 30 * esw;
          cb += eye * 50 * esw;
        }
        if (storm > 0.6) {
          const vi = Math.pow((storm - 0.6) * 3.5, 2);
          cr += vi * 100;
          cg += vi * 30;
          cb += vi * 70;
        }
      } else {
        const ice = fbm3d(sx * 3 + 0.5, sy * 3, sz * 3, 4);
        const crk = fbm3d(sx * 11, sy * 5.5, sz * 11, 3);
        const crys = fbm3d(sx * 7 + 5.5, sy * 3.5 + 3.3, sz * 7, 3);
        const sub = fbm3d(sx * 4 + 9.1, sy * 2 + 6.7, sz * 4, 2);
        if (ice > 0.32) {
          const iv = crys * 0.6 + sub * 0.4;
          cr = 120 + iv * 80;
          cg = 195 + iv * 45;
          cb = 225 + iv * 25;
          const fn = fbm3d(sx * 20, sy * 10, sz * 20, 2);
          if (fn > 0.62) {
            const sp = Math.pow((fn - 0.62) * 4, 2);
            cr += sp * 60;
            cg += sp * 50;
            cb += sp * 40;
          }
          const cl = Math.abs(Math.sin(crk * 18 + ice * 5));
          if (cl < 0.06) {
            const dd = 1 - cl / 0.06;
            cr -= dd * 60;
            cg -= dd * 30;
            cb += dd * 10;
          }
        } else {
          const gw = sub * 0.7 + crk * 0.3;
          cr = 4 + gw * 18;
          cg = 45 + gw * 50;
          cb = 90 + gw * 55;
          if (sub > 0.55) {
            const bio = (sub - 0.55) * 4;
            cg += bio * 40;
            cb += bio * 25;
          }
        }
        const frost = hash(Math.floor(sx * 40 + 50), Math.floor(sy * 40 + 50));
        if (frost > 0.93 && ice > 0.32) {
          cr = Math.min(cr + 80, 255);
          cg = Math.min(cg + 70, 255);
          cb = Math.min(cb + 60, 255);
        }
      }

      const idx = (py * W + px) * 4;
      d[idx] = Math.min(255, Math.max(0, cr));
      d[idx + 1] = Math.min(255, Math.max(0, cg));
      d[idx + 2] = Math.min(255, Math.max(0, cb));
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cvs;
}

// ─── World Definitions ──────────────────────────────────

interface WorldDef {
  id: string;
  label: string;
  sublabel: string;
  position: [number, number, number];
  radius: number;
  glowColor: string;
  hasRings: boolean;
  bobPhase: number;
}

const WORLDS: WorldDef[] = [
  {
    id: "cannabis",
    label: "Cannabis",
    sublabel: "Cannabis Regulations",
    position: [-9, 0.5, 3],
    radius: 1.4,
    glowColor: "#22c55e",
    hasRings: false,
    bobPhase: 0,
  },
  {
    id: "psychedelics",
    label: "Psychedelics",
    sublabel: "Psychedelic Regulations",
    position: [7, 2.8, -5],
    radius: 1.3,
    glowColor: "#a855f7",
    hasRings: true,
    bobPhase: 2.1,
  },
  {
    id: "others",
    label: "Others",
    sublabel: "Other Regulated Substances",
    position: [8, -2.2, 2],
    radius: 1.15,
    glowColor: "#22d3ee",
    hasRings: false,
    bobPhase: 4.2,
  },
];

const ORIGIN: [number, number, number] = [0, 0, 0];

// ─── Planet Stats (computed from real compound data) ─────

const CANNABIS_FAMILIES = new Set(["Cannabinoid"]);
const PSYCHEDELIC_FAMILIES = new Set(["Lysergamide", "Tryptamine", "Isoxazole", "Indole Alkaloid", "Phenethylamine"]);

function getPlanetFamilies(planetId: string): Set<string> {
  if (planetId === "cannabis") return CANNABIS_FAMILIES;
  if (planetId === "psychedelics") return PSYCHEDELIC_FAMILIES;
  // "others" = everything not in cannabis or psychedelics
  return new Set(
    mockCompounds
      .map((c) => c.chemical_family ?? "Other")
      .filter((f) => !CANNABIS_FAMILIES.has(f) && !PSYCHEDELIC_FAMILIES.has(f))
  );
}

interface PlanetStats {
  total: number;
  banned: number;   // effective status
  underReview: number;
  legal: number;    // unknown/recalled
}

const planetStatsCache: Record<string, PlanetStats> = {};
function getPlanetStats(planetId: string): PlanetStats {
  if (planetStatsCache[planetId]) return planetStatsCache[planetId];
  const families = getPlanetFamilies(planetId);
  const compounds = mockCompounds.filter((c) => families.has(c.chemical_family ?? "Other"));
  const stats: PlanetStats = {
    total: compounds.length,
    banned: compounds.filter((c) => c.legal_status_japan === "effective" || c.legal_status_japan === "promulgated").length,
    underReview: compounds.filter((c) => c.legal_status_japan === "under_review" || c.legal_status_japan === "pending").length,
    legal: compounds.filter((c) => c.legal_status_japan === "unknown" || c.legal_status_japan === "recalled").length,
  };
  planetStatsCache[planetId] = stats;
  return stats;
}

// ─── Easing ─────────────────────────────────────────────

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ─── Nova Shared Assets ─────────────────────────────────

function makeGlowMap(): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.08, "rgba(255,255,255,0.9)");
  g.addColorStop(0.25, "rgba(255,255,255,0.35)");
  g.addColorStop(0.5, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

const NOVA_PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  uniform float uScale;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale * (250.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const NOVA_PARTICLE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = smoothstep(0.12, 0.0, d);
    float glow = smoothstep(0.5, 0.02, d);
    float a = (glow * 0.35 + core * 0.65) * uOpacity;
    vec3 col = mix(uColor, vec3(1.0), core * 0.5);
    gl_FragColor = vec4(col, a);
  }
`;

const RAY_VERT = /* glsl */ `
  attribute float aFade;
  varying float vFade;
  void main() {
    vFade = aFade;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RAY_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    gl_FragColor = vec4(uColor * (0.6 + vFade * 0.8), vFade * vFade * uOpacity);
  }
`;

function buildRayBurstGeo(count: number, minLen: number, maxLen: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const fades: number[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    );
    const len = minLen + Math.random() * (maxLen - minLen);
    const w = len * (0.012 + Math.random() * 0.018);
    const up = Math.abs(dir.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const p1 = new THREE.Vector3().crossVectors(dir, up).normalize().multiplyScalar(w);
    const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize().multiplyScalar(w);
    const tip = dir.clone().multiplyScalar(len);
    // Two cross-shaped triangles per ray (visible from all angles)
    positions.push(p1.x, p1.y, p1.z, -p1.x, -p1.y, -p1.z, tip.x, tip.y, tip.z);
    positions.push(p2.x, p2.y, p2.z, -p2.x, -p2.y, -p2.z, tip.x, tip.y, tip.z);
    fades.push(1, 1, 0, 1, 1, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aFade", new THREE.Float32BufferAttribute(fades, 1));
  return geo;
}

function buildNovaParticles(count: number, minSpd: number, maxSpd: number) {
  const pos = new Float32Array(count * 3);
  const vels = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = minSpd + Math.random() * (maxSpd - minSpd);
    vels[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    vels[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    vels[i * 3 + 2] = Math.cos(phi) * speed;
    sizes[i] = 0.6 + Math.random() * 2.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  return { geo, vels };
}

// ─── Golden Path (animated growth) ──────────────────────

function GoldenPath({
  start,
  end,
  delay = 0,
  growDuration = 1.2,
}: {
  start: [number, number, number];
  end: [number, number, number];
  delay?: number;
  growDuration?: number;
}) {
  const { skipIntro } = useContext(IntroContext);
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number | null>(null);

  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(s, e, 0.5);
    mid.y += Math.max(1.2, s.distanceTo(e) * 0.1);
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    const geo = new THREE.TubeGeometry(curve, 40, 0.045, 6, false);
    // Start with nothing drawn
    geo.setDrawRange(0, 0);
    return geo;
  }, [start, end]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (skipIntro) {
      const totalIndices = geometry.index ? geometry.index.count : geometry.attributes.position.count;
      geometry.setDrawRange(0, totalIndices);
      return;
    }
    if (startTime.current === null) startTime.current = t + delay;
    const elapsed = t - startTime.current;
    if (elapsed < 0) return;

    const p = Math.min(elapsed / growDuration, 1);
    const eased = easeInOutCubic(p);
    const totalIndices = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    geometry.setDrawRange(0, Math.floor(totalIndices * eased));
  });

  return (
    <>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          color={new THREE.Color(2.5, 1.8, 0.4)}
          toneMapped={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      <PathDots start={start} end={end} delay={delay + growDuration * 0.3} />
    </>
  );
}

// ─── Drifting Path Particles ────────────────────────────

function PathDots({
  start,
  end,
  delay = 0,
}: {
  start: [number, number, number];
  end: [number, number, number];
  delay?: number;
}) {
  const { skipIntro } = useContext(IntroContext);
  const count = 10;
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef<number | null>(null);
  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(s, e, 0.5);
    mid.y += Math.max(1.2, s.distanceTo(e) * 0.1);
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3)
    );
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (skipIntro) {
      if (pointsRef.current) pointsRef.current.visible = true;
      const pos = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const prog = (t * 0.04 + i / count) % 1;
        const pt = curve.getPoint(prog);
        pos[i * 3] = pt.x;
        pos[i * 3 + 1] = pt.y;
        pos[i * 3 + 2] = pt.z;
      }
      geo.attributes.position.needsUpdate = true;
      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.opacity = 0.6;
      }
      return;
    }
    if (startTime.current === null) startTime.current = t + delay;
    const elapsed = t - startTime.current;

    if (elapsed < 0) {
      if (pointsRef.current) pointsRef.current.visible = false;
      return;
    }
    if (pointsRef.current) pointsRef.current.visible = true;

    const fadeIn = Math.min(elapsed / 0.5, 1);
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const prog = (t * 0.04 + i / count) % 1;
      const pt = curve.getPoint(prog);
      pos[i * 3] = pt.x;
      pos[i * 3 + 1] = pt.y;
      pos[i * 3 + 2] = pt.z;
    }
    geo.attributes.position.needsUpdate = true;
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.6 * fadeIn;
    }
  });

  return (
    <points ref={pointsRef} geometry={geo} visible={false}>
      <pointsMaterial
        size={0.12}
        color={new THREE.Color(2, 1.5, 0.3)}
        toneMapped={false}
        transparent
        opacity={0}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Energy Pulse (travels along golden paths) ──────────

function EnergyPulse({
  start,
  end,
  color = "#ffc830",
  interval = 4,
  travelTime = 2.5,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  interval?: number;
  travelTime?: number;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const trailRef = useRef<THREE.Points>(null);
  const glowMap = useMemo(() => makeGlowMap(), []);
  const pulseColor = useMemo(() => new THREE.Color(color), [color]);

  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(s, e, 0.5);
    mid.y += Math.max(1.2, s.distanceTo(e) * 0.1);
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  // Trail particles behind the pulse
  const trailCount = 8;
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(trailCount * 3), 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const cycle = t % (interval + travelTime);
    const traveling = cycle >= interval;

    if (!traveling) {
      if (spriteRef.current) spriteRef.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }

    const progress = (cycle - interval) / travelTime;
    const pt = curve.getPoint(progress);

    // Main glow
    if (spriteRef.current) {
      spriteRef.current.visible = true;
      spriteRef.current.position.copy(pt);
      const fadeEdge = progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
      const pulse = 0.8 + Math.sin(t * 12) * 0.2; // subtle shimmer
      spriteRef.current.scale.setScalar(1.2 * fadeEdge * pulse);
      (spriteRef.current.material as THREE.SpriteMaterial).opacity = 0.4 * fadeEdge;
    }

    // Trail behind
    if (trailRef.current) {
      trailRef.current.visible = true;
      const pos = trailGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < trailCount; i++) {
        const trailProg = Math.max(0, progress - (i + 1) * 0.015);
        const tp = curve.getPoint(trailProg);
        pos[i * 3] = tp.x;
        pos[i * 3 + 1] = tp.y;
        pos[i * 3 + 2] = tp.z;
      }
      trailGeo.attributes.position.needsUpdate = true;
      const fadeEdge = progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1;
      (trailRef.current.material as THREE.PointsMaterial).opacity = 0.35 * fadeEdge;
    }
  });

  return (
    <>
      <sprite ref={spriteRef} visible={false}>
        <spriteMaterial
          map={glowMap}
          color={pulseColor}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <points ref={trailRef} geometry={trailGeo} visible={false}>
        <pointsMaterial
          size={0.08}
          color={pulseColor}
          transparent
          opacity={0}
          sizeAttenuation
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// ─── Atmosphere Glow ────────────────────────────────────

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float ndv = abs(dot(vNormal, vViewDir));
    // Layered Fresnel — tight rim + soft outer haze
    float rimTight = pow(1.0 - ndv, 5.0);
    float rimSoft = pow(1.0 - ndv, 2.5);
    float fresnel = rimTight * 0.7 + rimSoft * 0.3;
    // Color shift — hotter (brighter) at edge, base color further out
    vec3 hotColor = uColor * uIntensity * 1.6 + vec3(0.15, 0.12, 0.08);
    vec3 baseColor = uColor * uIntensity;
    vec3 col = mix(baseColor, hotColor, rimTight);
    gl_FragColor = vec4(col, fresnel * 0.75);
  }
`;

function Atmosphere({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 2.2 },
    }),
    [color]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius * 1.35, 24, 12]} />
      <shaderMaterial
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={ATMO_VERT}
        fragmentShader={ATMO_FRAG}
      />
    </mesh>
  );
}

// ─── Planet Rings (Psychedelics) — Icy texture ──────────

function generateIceRingTexture(): THREE.CanvasTexture {
  const W = 256, H = 64;
  const cvs = document.createElement("canvas");
  cvs.width = W;
  cvs.height = H;
  const ctx = cvs.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const d = img.data;

  for (let py = 0; py < H; py++) {
    // v: 0 = inner edge, 1 = outer edge
    const v = py / H;
    // Density falloff — thicker in the middle bands, fading at edges
    const edgeFade = Math.sin(v * Math.PI);
    const bandFade = edgeFade * edgeFade;

    for (let px = 0; px < W; px++) {
      const u = px / W;
      const angle = u * Math.PI * 2;

      // Large-scale ice structure
      const n1 = fbm3d(Math.cos(angle) * 4 + 1.2, Math.sin(angle) * 4, v * 6, 3);
      // Fine cracks
      const crack = fbm3d(Math.cos(angle) * 12, Math.sin(angle) * 12, v * 15 + 3.7, 3);
      const crackLine = Math.abs(Math.sin(crack * 18 + n1 * 5));
      // Crystal sparkle
      const sparkle = hash(Math.floor(px * 0.7 + py * 31.3), Math.floor(py * 0.9 + px * 17.7));
      // Subsurface glow bands
      const band = fbm3d(Math.cos(angle) * 2 + 5.5, Math.sin(angle) * 2, v * 3 + 1.1, 3);

      // Base ice color — pale blue-white
      let cr = 160 + n1 * 60;
      let cg = 195 + n1 * 40;
      let cb = 235 + n1 * 20;

      // Subtle purple/violet tint in deeper ice
      const purpleTint = band * 0.4;
      cr += purpleTint * 40;
      cg -= purpleTint * 15;
      cb += purpleTint * 20;

      // Dark cracks — deep blue fissures
      if (crackLine < 0.08) {
        const dd = 1 - crackLine / 0.08;
        cr -= dd * 80;
        cg -= dd * 50;
        cb += dd * 15;
      }

      // Bright crystal sparkle highlights
      if (sparkle > 0.94 && n1 > 0.3) {
        const sp = (sparkle - 0.94) * 16;
        cr = Math.min(cr + sp * 90, 255);
        cg = Math.min(cg + sp * 85, 255);
        cb = Math.min(cb + sp * 70, 255);
      }

      // Frost deposits — bright patches
      const frost = fbm3d(Math.cos(angle) * 8 + 9.1, Math.sin(angle) * 8 + 2.3, v * 10, 3);
      if (frost > 0.55) {
        const ft = (frost - 0.55) * 3;
        cr = Math.min(cr + ft * 50, 255);
        cg = Math.min(cg + ft * 55, 255);
        cb = Math.min(cb + ft * 45, 255);
      }

      // Ring density gaps — darker bands where particles are sparse
      const gap = Math.sin(v * Math.PI * 7 + n1 * 3) * 0.5 + 0.5;
      const gapDarken = gap < 0.15 ? gap / 0.15 : 1;

      // Alpha: edge fade + density gaps + overall transparency
      const alpha = bandFade * gapDarken * (0.35 + n1 * 0.25);

      const idx = (py * W + px) * 4;
      d[idx] = Math.min(255, Math.max(0, cr));
      d[idx + 1] = Math.min(255, Math.max(0, cg));
      d[idx + 2] = Math.min(255, Math.max(0, cb));
      d[idx + 3] = Math.min(255, Math.max(0, alpha * 255));
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function PlanetRings({ radius }: { radius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => generateIceRingTexture(), []);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[1.2, 0.15, 0]}>
      <ringGeometry args={[radius * 1.5, radius * 2.4, 48, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Planet Node ────────────────────────────────────────

function PlanetNode({
  world,
  onSelect,
}: {
  world: WorldDef;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const spinAngle = useRef(0);
  const spinSpeed = useRef(0.08);
  const burstRemaining = useRef(0);
  const clickStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const texture = useMemo(() => {
    const canvas = generatePlanetMap(world.id);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [world.id]);

  useFrame(({ clock }, delta) => {
    // Half-second burst sets a high speed, then smoothly decay back to idle
    burstRemaining.current = Math.max(0, burstRemaining.current - delta);
    const target = burstRemaining.current > 0 ? 3 * (burstRemaining.current / 0.5) : 0.08;
    spinSpeed.current += (target - spinSpeed.current) * Math.min(delta * 3, 1);
    spinAngle.current += spinSpeed.current * delta * 60;

    if (meshRef.current) {
      meshRef.current.rotation.y = spinAngle.current;
    }
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y =
        world.position[1] +
        Math.sin(t * 0.8 + world.bobPhase) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={world.position}>
      <Atmosphere radius={world.radius} color={world.glowColor} />

      <mesh
        ref={meshRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          const start = clickStart.current;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const elapsed = Date.now() - start.time;
          if (dist < 6 && elapsed < 500) {
            onSelect(world.id);
          }
          clickStart.current = null;
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!hovered) burstRemaining.current = 0.5;
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[world.radius, 32, 16]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.45}
          metalness={0.12}
          envMapIntensity={0.6}
        />
      </mesh>

      {world.hasRings && <PlanetRings radius={world.radius} />}

      {/* Orbiting debris field */}
      <DebrisField
        planetRadius={world.radius}
        color={world.glowColor}
        bobPhase={world.bobPhase}
      />

      {/* 3D Text Labels - respects depth */}
      <Billboard position={[0, -world.radius - 0.9, 0]} follow={true}>
        <Text
          fontSize={0.35}
          color={hovered ? "#ffffff" : "#e8ecf1"}
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.02}
          outlineColor="#000000"
        >
          {world.label}
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.18}
          color={hovered ? "rgba(232,236,241,0.6)" : "rgba(232,236,241,0.35)"}
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.01}
          outlineColor="#000000"
        >
          {world.sublabel}
        </Text>
      </Billboard>

      {/* Hover preview card - kept as Html for complex layout */}
      {hovered && (
        <Html
          position={[0, -world.radius - 1.8, 0]}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          {(() => {
            const stats = getPlanetStats(world.id);
            return (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(6,9,15,0.9)",
                  border: `1px solid ${world.glowColor}30`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 15px ${world.glowColor}15`,
                  backdropFilter: "blur(8px)",
                  minWidth: "130px",
                }}
              >
                {/* Total count */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px",
                }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    backgroundColor: world.glowColor,
                    boxShadow: `0 0 6px ${world.glowColor}80`,
                  }} />
                  <span style={{
                    fontSize: "9px", fontFamily: "ui-monospace, monospace",
                    color: world.glowColor, letterSpacing: "0.05em",
                  }}>
                    {stats.total} compounds
                  </span>
                </div>
                {/* Status breakdown dots */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px",
                }}>
                  {stats.banned > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                      <span style={{ fontSize: "8px", fontFamily: "ui-monospace, monospace", color: "#ef4444" }}>
                        {stats.banned}
                      </span>
                    </div>
                  )}
                  {stats.underReview > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                      <span style={{ fontSize: "8px", fontFamily: "ui-monospace, monospace", color: "#eab308" }}>
                        {stats.underReview}
                      </span>
                    </div>
                  )}
                  {stats.legal > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#38bdf8" }} />
                      <span style={{ fontSize: "8px", fontFamily: "ui-monospace, monospace", color: "#38bdf8" }}>
                        {stats.legal}
                      </span>
                    </div>
                  )}
                </div>
                {/* Click hint */}
                <div style={{
                  fontSize: "7px", fontFamily: "ui-monospace, monospace",
                  color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em",
                }}>
                  Click for details
                </div>
              </div>
            );
          })()}
        </Html>
      )}
    </group>
  );
}

// ─── Debris Field ───────────────────────────────────────

interface DebrisInfo {
  dist: number;
  angle: number;
  tilt: number;
  speed: number;
  yOff: number;
  size: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  tumbleSpeed: [number, number, number];
}

function DebrisField({
  planetRadius,
  color,
  bobPhase,
}: {
  planetRadius: number;
  color: string;
  bobPhase: number;
}) {
  const count = 10;
  const groupRef = useRef<THREE.Group>(null);

  // Pre-generate debris orbits with varied parameters
  const debris = useMemo<DebrisInfo[]>(() => {
    const items: DebrisInfo[] = [];
    for (let i = 0; i < count; i++) {
      const band = i < 5 ? 0 : i < 11 ? 1 : 2; // inner, mid, outer
      const baseDist = planetRadius * (1.6 + band * 0.5);
      items.push({
        dist: baseDist + (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.6, // orbit tilt
        speed: (0.15 + Math.random() * 0.35) * (band === 0 ? 1.4 : band === 1 ? 1 : 0.7),
        yOff: (Math.random() - 0.5) * 0.5,
        size: 0.02 + Math.random() * 0.06 + (band === 2 ? 0.03 : 0),
        scaleX: 0.6 + Math.random() * 0.8,
        scaleY: 0.4 + Math.random() * 0.6,
        scaleZ: 0.5 + Math.random() * 0.9,
        tumbleSpeed: [
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
        ],
      });
    }
    return items;
  }, [planetRadius]);

  // Rocks use instanced mesh for performance
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Irregular rock geometry
  const rockGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    // Distort vertices for irregular asteroid shape
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const noise = 0.7 + hash(x * 10 + i, y * 10 + i * 0.3) * 0.6;
      pos.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const d = debris[i];
      const a = t * d.speed + d.angle + bobPhase;

      dummy.position.set(
        Math.cos(a) * d.dist,
        d.yOff + Math.sin(a * 0.6 + d.tilt) * 0.25,
        Math.sin(a) * d.dist
      );
      dummy.rotation.set(
        t * d.tumbleSpeed[0],
        t * d.tumbleSpeed[1],
        t * d.tumbleSpeed[2]
      );
      dummy.scale.set(
        d.size * d.scaleX,
        d.size * d.scaleY,
        d.size * d.scaleZ
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Dust ring (flat particle ring around planet)
  const dustCount = 18;
  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    const sizes = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = planetRadius * 1.4 + Math.random() * planetRadius * 1.2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(a) * r;
      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    return g;
  }, [planetRadius]);

  const dustRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Instanced asteroid rocks */}
      <instancedMesh
        ref={meshRef}
        args={[rockGeo, undefined, count]}
      >
        <meshStandardMaterial
          color="#888888"
          roughness={0.9}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Dust particle ring */}
      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial
          size={0.04}
          color={color}
          transparent
          opacity={0.35}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// ─── Floating Book (Community / Blog) ────────────────────
// Premium magical book with full-page glow and fine dust particles

const BOOK_POSITION: [number, number, number] = [-6, -0.5, -4];

// Procedural leather texture shader for book covers
function useLeatherMaterial(baseColor: string, emissiveColor: string) {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: new THREE.Color(baseColor) },
        uEmissiveColor: { value: new THREE.Color(emissiveColor) },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uEmissiveColor;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        // Simplex noise for leather grain
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          // Multi-scale leather grain
          float grain1 = snoise(vUv * 40.0) * 0.5 + 0.5;
          float grain2 = snoise(vUv * 80.0 + 100.0) * 0.5 + 0.5;
          float grain3 = snoise(vUv * 15.0 + 50.0) * 0.5 + 0.5;
          float leather = grain1 * 0.5 + grain2 * 0.3 + grain3 * 0.2;

          // Worn edges effect
          float edgeWear = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
          edgeWear *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

          // Color variation
          vec3 color = uBaseColor;
          color = mix(color * 0.7, color * 1.1, leather);
          color = mix(color * 1.2, color, edgeWear); // lighter at edges (worn)

          // Fresnel rim lighting
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          color += fresnel * 0.15;

          // Subtle emissive
          color += uEmissiveColor * 0.25;

          // Specular highlights
          vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
          vec3 halfVec = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfVec), 0.0), 32.0);
          color += spec * 0.2 * (1.0 - leather * 0.5); // less spec in grain

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [baseColor, emissiveColor]);
}

// Procedural aged pages material with glow on open
function usePagesMaterial() {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpenAmount: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpenAmount;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          // Base cream color
          vec3 pageColor = vec3(0.96, 0.93, 0.86);

          // Age spots and variation
          float spots = rand(floor(vUv * 50.0)) * 0.08;
          float foxing = rand(floor(vUv * 20.0 + 100.0)) * 0.05;

          // Yellowing at edges
          float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float yellowing = smoothstep(0.0, 0.3, edgeDist);
          vec3 yellowTint = vec3(0.92, 0.85, 0.7);

          pageColor = mix(yellowTint, pageColor, yellowing);
          pageColor -= spots;
          pageColor -= foxing * vec3(0.3, 0.25, 0.1);

          // Page lines (horizontal striations)
          float lines = sin(vUv.y * 200.0) * 0.02 + 0.98;
          pageColor *= lines;

          // Base subtle golden emissive
          vec3 emissive = vec3(0.85, 0.7, 0.3) * 0.08;

          // === BRIGHT GLOW WHEN HOVERED ===
          // The entire page block glows golden-white when open
          vec3 glowColor = vec3(1.0, 0.92, 0.7); // warm golden-white
          float glowIntensity = uOpenAmount * 3.0;

          // Uniform glow across entire surface
          emissive += glowColor * glowIntensity;

          // Final color - pages become bright golden when open
          vec3 finalColor = mix(pageColor, glowColor * 1.5, uOpenAmount * 0.7) + emissive;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      toneMapped: false, // Allow HDR glow
    });
  }, []);
}

function FloatingBook({ onSelect }: { onSelect: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const coverRef = useRef<THREE.Group>(null);
  const pagesRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const openAmount = useRef(0);
  const hoverStartTime = useRef(0);

  const bookW = 2.0;
  const bookH = 2.5;
  const bookD = 0.4;
  const coverThick = 0.05;

  // Premium materials
  const coverMaterial = useLeatherMaterial("#1a0a1e", "#2a1535");
  const spineMaterial = useLeatherMaterial("#251030", "#351545");
  const pagesMaterial = usePagesMaterial();

  // Wormhole portal shader - swirling vortex effect
  const wormholeRef = useRef<THREE.Mesh>(null);
  const wormholeUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0 },
  }), []);

  const wormholeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: wormholeUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 uv = vUv - center;

          // Use elliptical distance for rectangular shape
          vec2 scaled = uv * vec2(1.0, 1.25); // Adjust for aspect ratio
          float dist = length(scaled);
          float angle = atan(uv.y, uv.x);

          // Swirling vortex - faster and more dramatic
          float spiral = angle + dist * 12.0 - uTime * 4.0;
          float arms = sin(spiral * 6.0) * 0.5 + 0.5;

          // Multiple spiral layers
          float spiral2 = angle - dist * 8.0 + uTime * 2.5;
          float arms2 = sin(spiral2 * 4.0) * 0.5 + 0.5;

          // Event horizon - rectangular fade
          vec2 edgeDist = abs(uv) * 2.0;
          float rectDist = max(edgeDist.x, edgeDist.y);
          float core = smoothstep(1.0, 0.0, rectDist);
          float ring = smoothstep(0.8, 0.5, rectDist) * smoothstep(0.2, 0.4, rectDist);

          // Pulsing energy waves
          float pulse = sin(uTime * 5.0 - dist * 15.0) * 0.4 + 0.6;
          float pulse2 = sin(uTime * 3.0 + dist * 10.0) * 0.3 + 0.7;

          // Color gradient - bright golden core to warm amber edge
          vec3 coreColor = vec3(1.0, 0.95, 0.7) * 2.5;
          vec3 midColor = vec3(1.0, 0.7, 0.3) * 2.0;
          vec3 edgeColor = vec3(0.9, 0.5, 0.1);

          vec3 color = mix(edgeColor, midColor, core);
          color = mix(color, coreColor, core * core * core);

          // Add spiral arms - layered golden
          color += arms * ring * vec3(1.0, 0.8, 0.4) * 1.2;
          color += arms2 * ring * vec3(1.0, 0.7, 0.3) * 0.6;

          // Bright center vortex
          float centerGlow = smoothstep(0.3, 0.0, dist) * pulse;
          color += centerGlow * vec3(2.0, 1.5, 1.0);

          // Energy tendrils
          float tendril = sin(angle * 8.0 + uTime * 6.0 + dist * 20.0);
          tendril = pow(max(0.0, tendril), 4.0) * ring * pulse2;
          color += tendril * vec3(1.0, 0.7, 0.3) * 1.5;

          // Sparkles and stars
          float sparkle = fract(sin(dot(uv * 80.0, vec2(12.9898, 78.233)) + uTime * 2.0) * 43758.5453);
          sparkle = pow(sparkle, 25.0) * core * 4.0;
          color += sparkle * vec3(1.0, 0.95, 0.8);

          // Edge glow - warm golden
          float edgeGlow = smoothstep(1.0, 0.7, rectDist) * (1.0 - smoothstep(0.7, 0.5, rectDist));
          color += edgeGlow * vec3(1.0, 0.6, 0.2) * pulse * 0.8;

          // Alpha - visible across the page
          float alpha = core * uIntensity;
          alpha = max(alpha, edgeGlow * 0.5 * uIntensity);

          gl_FragColor = vec4(color * 1.3, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [wormholeUniforms]);

  // Front cover geometry (pivots at spine)
  const frontCoverGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(bookW, bookH, coverThick, 8, 8, 1);
    geo.translate(bookW / 2, 0, 0);
    return geo;
  }, []);

  // 3D Orbiting puzzle pieces - 4 shapes
  const puzzleCount = 8;
  const puzzleMeshRef0 = useRef<THREE.InstancedMesh>(null);
  const puzzleMeshRef1 = useRef<THREE.InstancedMesh>(null);
  const puzzleMeshRef2 = useRef<THREE.InstancedMesh>(null);
  const puzzleMeshRef3 = useRef<THREE.InstancedMesh>(null);
  const puzzleMeshRefs = useMemo(() => [puzzleMeshRef0, puzzleMeshRef1, puzzleMeshRef2, puzzleMeshRef3], []);
  const puzzleDummy = useMemo(() => new THREE.Object3D(), []);

  // Orbit data for each puzzle piece (mutable for regeneration)
  const puzzleOrbits = useRef<Array<{
    dist: number;
    angle: number;
    tilt: number;
    speed: number;
    yOff: number;
    size: number;
    tumbleSpeed: number[];
    px: number;
    py: number;
    pz: number;
    beingSucked: boolean;
    suckProgress: number;
    suckStartPos: THREE.Vector3;
    shapeIndex: number; // Which of the 4 shapes
    instanceIndex: number; // Index within that shape's instanced mesh
  }>>([]);

  // Count pieces per shape for instanced mesh sizing
  const piecesPerShape = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < puzzleCount; i++) {
      counts[i % 4]++;
    }
    return counts;
  }, []);

  // Initialize orbits
  if (puzzleOrbits.current.length === 0) {
    const instanceCounters = [0, 0, 0, 0];
    for (let i = 0; i < puzzleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 2.5 + Math.random() * 2.0;
      const shapeIndex = i % 4; // Distribute evenly among 4 shapes
      puzzleOrbits.current.push({
        dist,
        angle,
        tilt: (Math.random() - 0.5) * 0.8,
        speed: 0.2 + Math.random() * 0.3,
        yOff: (Math.random() - 0.5) * 1.0,
        size: 0.35 + Math.random() * 0.2,
        tumbleSpeed: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 1.5,
        ],
        px: Math.cos(angle) * dist,
        py: (Math.random() - 0.5) * 1.0,
        pz: Math.sin(angle) * dist,
        beingSucked: false,
        suckProgress: 0,
        suckStartPos: new THREE.Vector3(),
        shapeIndex,
        instanceIndex: instanceCounters[shapeIndex]++,
      });
    }
  }

  // Create 4 different puzzle piece shapes
  const puzzleGeos = useMemo(() => {
    const s = 0.5; // half-size of main square
    const nubR = 0.28; // nub radius - bigger!
    const nubD = 0.25; // how far nub sticks out - bigger!

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    // Helper to create nub (outward bump)
    const addNub = (shape: THREE.Shape, x1: number, y1: number, x2: number, y2: number, outX: number, outY: number) => {
      shape.lineTo(x1, y1);
      shape.bezierCurveTo(x1 + outX, y1 + outY, x2 + outX, y2 + outY, x2, y2);
    };

    // Helper to create hole (inward indent)
    const addHole = (shape: THREE.Shape, x1: number, y1: number, x2: number, y2: number, inX: number, inY: number) => {
      shape.lineTo(x1, y1);
      shape.bezierCurveTo(x1 - inX * 0.8, y1 - inY * 0.8, x2 - inX * 0.8, y2 - inY * 0.8, x2, y2);
    };

    const geos: THREE.ExtrudeGeometry[] = [];

    // Shape 0: nub right & bottom, hole left & top
    const shape0 = new THREE.Shape();
    shape0.moveTo(-s, -s);
    addNub(shape0, -nubR, -s, nubR, -s, 0, -nubD); // bottom nub
    shape0.lineTo(s, -s);
    addNub(shape0, s, -nubR, s, nubR, nubD, 0); // right nub
    shape0.lineTo(s, s);
    addHole(shape0, nubR, s, -nubR, s, 0, nubD); // top hole
    shape0.lineTo(-s, s);
    addHole(shape0, -s, nubR, -s, -nubR, -nubD, 0); // left hole
    shape0.lineTo(-s, -s);
    const geo0 = new THREE.ExtrudeGeometry(shape0, extrudeSettings);
    geo0.center();
    geos.push(geo0);

    // Shape 1: nub top & left, hole right & bottom
    const shape1 = new THREE.Shape();
    shape1.moveTo(-s, -s);
    addHole(shape1, -nubR, -s, nubR, -s, 0, -nubD); // bottom hole
    shape1.lineTo(s, -s);
    addHole(shape1, s, -nubR, s, nubR, nubD, 0); // right hole
    shape1.lineTo(s, s);
    addNub(shape1, nubR, s, -nubR, s, 0, nubD); // top nub
    shape1.lineTo(-s, s);
    addNub(shape1, -s, nubR, -s, -nubR, -nubD, 0); // left nub
    shape1.lineTo(-s, -s);
    const geo1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings);
    geo1.center();
    geos.push(geo1);

    // Shape 2: nubs on all sides (corner piece)
    const shape2 = new THREE.Shape();
    shape2.moveTo(-s, -s);
    addNub(shape2, -nubR, -s, nubR, -s, 0, -nubD);
    shape2.lineTo(s, -s);
    addNub(shape2, s, -nubR, s, nubR, nubD, 0);
    shape2.lineTo(s, s);
    addNub(shape2, nubR, s, -nubR, s, 0, nubD);
    shape2.lineTo(-s, s);
    addNub(shape2, -s, nubR, -s, -nubR, -nubD, 0);
    shape2.lineTo(-s, -s);
    const geo2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings);
    geo2.center();
    geos.push(geo2);

    // Shape 3: holes on all sides
    const shape3 = new THREE.Shape();
    shape3.moveTo(-s, -s);
    addHole(shape3, -nubR, -s, nubR, -s, 0, -nubD);
    shape3.lineTo(s, -s);
    addHole(shape3, s, -nubR, s, nubR, nubD, 0);
    shape3.lineTo(s, s);
    addHole(shape3, nubR, s, -nubR, s, 0, nubD);
    shape3.lineTo(-s, s);
    addHole(shape3, -s, nubR, -s, -nubR, -nubD, 0);
    shape3.lineTo(-s, -s);
    const geo3 = new THREE.ExtrudeGeometry(shape3, extrudeSettings);
    geo3.center();
    geos.push(geo3);

    return geos;
  }, []);

  // Glowing material for puzzle pieces - emissive + lit by point light
  const puzzleGlowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#fff0c0"),
      emissive: new THREE.Color("#ffcc44"),
      emissiveIntensity: 3,
      metalness: 0.1,
      roughness: 0.3,
      toneMapped: false,
    });
  }, []);

  // Light rays (shooting star style) that get sucked into the book
  const rayCount = 10;
  const RAY_SEGMENTS = 14;
  const raysGroupRef = useRef<THREE.Group>(null);

  // Shader for rays with gradient alpha - brighter glow
  const rayVertShader = /* glsl */ `
    attribute float aAlpha;
    varying float vAlpha;
    void main() {
      vAlpha = aAlpha;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const rayFragShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    void main() {
      float glow = vAlpha * vAlpha; // Exponential glow at head
      vec3 brightColor = uColor * (3.0 + glow * 5.0); // Ultra bright
      float alpha = vAlpha * uOpacity * 2.0; // Double opacity
      gl_FragColor = vec4(brightColor, alpha);
    }
  `;

  // Create geometries and materials for each ray
  const rayGeos = useMemo(() => {
    return Array.from({ length: rayCount }, () => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(RAY_SEGMENTS * 3);
      const alphas = new Float32Array(RAY_SEGMENTS);
      for (let i = 0; i < RAY_SEGMENTS; i++) {
        alphas[i] = i / (RAY_SEGMENTS - 1); // 0 at tail, 1 at head
      }
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alphas, 1));
      return geo;
    });
  }, []);

  const rayUniforms = useMemo(() => {
    return Array.from({ length: rayCount }, () => ({
      uColor: { value: new THREE.Color(1.5, 1.4, 1.0) }, // white golden
      uOpacity: { value: 0 },
    }));
  }, []);

  const rayMats = useMemo(() => {
    return rayUniforms.map((u) =>
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: rayVertShader,
        fragmentShader: rayFragShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
  }, [rayUniforms, rayVertShader, rayFragShader]);

  // Ray state
  interface BookRay {
    active: boolean;
    startPos: THREE.Vector3;
    progress: number;
    speed: number;
    length: number;
  }

  const rayStates = useRef<BookRay[]>([]);

  // Initialize ray states
  if (rayStates.current.length === 0) {
    for (let i = 0; i < rayCount; i++) {
      rayStates.current.push({
        active: false,
        startPos: new THREE.Vector3(),
        progress: 0,
        speed: 0.8 + Math.random() * 0.6,
        length: 0.8 + Math.random() * 0.6,
      });
    }
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle bobbing
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5 + 5.5) * 0.15;
      groupRef.current.rotation.z = Math.sin(t * 0.35 + 1.2) * 0.025;
      groupRef.current.rotation.x = Math.sin(t * 0.25 + 3.0) * 0.015;
    }

    // Smooth open/close
    const target = hovered ? 1 : 0;
    openAmount.current += (target - openAmount.current) * 0.1;

    if (coverRef.current) {
      coverRef.current.rotation.y = -openAmount.current * Math.PI * 0.5;
    }

    // Update material uniforms
    if (coverMaterial.uniforms) coverMaterial.uniforms.uTime.value = t;
    if (spineMaterial.uniforms) spineMaterial.uniforms.uTime.value = t;
    if (pagesMaterial.uniforms) {
      pagesMaterial.uniforms.uTime.value = t;
      pagesMaterial.uniforms.uOpenAmount.value = openAmount.current;
    }

    // Update wormhole portal - only visible when book is open
    wormholeUniforms.uTime.value = t;
    wormholeUniforms.uIntensity.value = openAmount.current;

    // Update orbiting puzzle pieces - absorption when passing in front of open page
    if (openAmount.current > 0.1) {
      const pageTarget = new THREE.Vector3(0.15, 0, 0.15);
      const suckSpeed = 0.006;

      for (let i = 0; i < puzzleCount; i++) {
        const orb = puzzleOrbits.current[i];
        const meshRef = puzzleMeshRefs[orb.shapeIndex];
        if (!meshRef.current) continue;

        const a = t * orb.speed + orb.angle;
        const normalizedAngle = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        const orbitX = Math.cos(a) * orb.dist;
        const orbitY = orb.yOff + Math.sin(a * 0.6 + orb.tilt) * 0.3;
        const orbitZ = Math.sin(a) * orb.dist;

        if (!orb.beingSucked) {
          orb.px = orbitX;
          orb.py = orbitY;
          orb.pz = orbitZ;

          const inFrontArc = normalizedAngle > Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75;
          if (inFrontArc) {
            orb.beingSucked = true;
            orb.suckProgress = 0;
            orb.suckStartPos.set(orb.px, orb.py, orb.pz);
          }
        }

        let scale = orb.size * openAmount.current;

        if (orb.beingSucked) {
          orb.suckProgress += suckSpeed * (1 + orb.suckProgress * 0.5);
          const progress = Math.min(1, orb.suckProgress);
          const easeIn = progress * progress;

          const spiralAngle = progress * Math.PI * 2;
          const spiralRadius = (1 - easeIn) * 0.4;

          orb.px = orb.suckStartPos.x + (pageTarget.x - orb.suckStartPos.x) * easeIn + Math.cos(spiralAngle) * spiralRadius;
          orb.py = orb.suckStartPos.y + (pageTarget.y - orb.suckStartPos.y) * easeIn + Math.sin(spiralAngle) * spiralRadius;
          orb.pz = orb.suckStartPos.z + (pageTarget.z - orb.suckStartPos.z) * easeIn;

          scale = orb.size * openAmount.current * (1 - easeIn);

          if (orb.suckProgress >= 1) {
            orb.beingSucked = false;
            orb.suckProgress = 0;
            orb.angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8;
            orb.dist = 2.2 + Math.random() * 2.0;
            orb.tilt = (Math.random() - 0.5) * 0.8;
            orb.yOff = (Math.random() - 0.5) * 1.0;
            orb.speed = 0.2 + Math.random() * 0.3;
            orb.px = Math.cos(orb.angle) * orb.dist;
            orb.py = orb.yOff;
            orb.pz = Math.sin(orb.angle) * orb.dist;
            scale = 0.02;
          }
        }

        puzzleDummy.position.set(orb.px, orb.py, orb.pz);
        const tumbleMult = orb.beingSucked ? 1.5 : 1;
        puzzleDummy.rotation.set(
          t * orb.tumbleSpeed[0] * tumbleMult,
          t * orb.tumbleSpeed[1] * tumbleMult,
          t * orb.tumbleSpeed[2] * tumbleMult
        );
        puzzleDummy.scale.setScalar(Math.max(0.01, scale));
        puzzleDummy.updateMatrix();
        meshRef.current.setMatrixAt(orb.instanceIndex, puzzleDummy.matrix);
      }

      // Update all mesh instance matrices
      puzzleMeshRefs.forEach(ref => {
        if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
      });

      // Update shooting-star style light rays with wormhole spiral
      for (let i = 0; i < rayCount; i++) {
        const ray = rayStates.current[i];

        // Spawn new rays randomly
        if (!ray.active && Math.random() < 0.025) {
          ray.active = true;
          ray.progress = 0;
          ray.speed = 0.5 + Math.random() * 0.4;
          ray.length = 0.5 + Math.random() * 0.4;
          // Start from random position in FRONT of the book only (toward camera)
          // Angle range: -PI/2 to PI/2 (front 180 degrees, positive Z side)
          const angle = (Math.random() - 0.5) * Math.PI;
          const dist = 4.0 + Math.random() * 2.5;
          const yOff = (Math.random() - 0.5) * 2.5;
          ray.startPos.set(
            Math.cos(angle) * dist,
            yOff,
            Math.abs(Math.sin(angle) * dist) // Force positive Z (front of book)
          );
        }

        if (ray.active) {
          ray.progress += 0.012 * ray.speed;

          if (ray.progress >= 1) {
            ray.active = false;
            rayUniforms[i].uOpacity.value = 0;
          } else {
            // Build trail segments from tail to head with wormhole spiral
            const pos = rayGeos[i].attributes.position.array as Float32Array;
            for (let seg = 0; seg < RAY_SEGMENTS; seg++) {
              const frac = seg / (RAY_SEGMENTS - 1); // 0=tail, 1=head
              const segProgress = Math.max(0, ray.progress - ray.length * (1 - frac) * 0.12);
              const segEase = segProgress * segProgress * segProgress; // Cubic ease for acceleration

              // Base position moving towards target
              let baseX = ray.startPos.x + (pageTarget.x - ray.startPos.x) * segEase;
              let baseY = ray.startPos.y + (pageTarget.y - ray.startPos.y) * segEase;
              let baseZ = ray.startPos.z + (pageTarget.z - ray.startPos.z) * segEase;

              // Add spiral/wormhole effect - tighter spiral as it gets closer
              const spiralIntensity = segEase * segEase * 1.2; // Increases near target
              const spiralAngle = segProgress * Math.PI * 6 + i * 0.5; // Multiple rotations
              const spiralRadius = (1 - segEase) * 0.8 * spiralIntensity;

              baseX += Math.cos(spiralAngle) * spiralRadius;
              baseY += Math.sin(spiralAngle) * spiralRadius * 0.6;
              baseZ += Math.sin(spiralAngle * 0.7) * spiralRadius * 0.4;

              pos[seg * 3] = baseX;
              pos[seg * 3 + 1] = baseY;
              pos[seg * 3 + 2] = baseZ;
            }
            rayGeos[i].attributes.position.needsUpdate = true;

            // Ultra bright glow, fade in/out
            const fadeIn = Math.min(1, ray.progress * 4);
            const fadeOut = 1 - Math.pow(ray.progress, 3.0);
            rayUniforms[i].uOpacity.value = fadeIn * fadeOut * openAmount.current * 2.5;
          }
        }
      }
    } else {
      // Book closed - hide all pieces and rays
      puzzleMeshRefs.forEach((ref, shapeIdx) => {
        if (!ref.current) return;
        for (let j = 0; j < piecesPerShape[shapeIdx]; j++) {
          puzzleDummy.scale.setScalar(0.01);
          puzzleDummy.updateMatrix();
          ref.current.setMatrixAt(j, puzzleDummy.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
      });

      // Hide rays when book closed
      for (let i = 0; i < rayCount; i++) {
        rayUniforms[i].uOpacity.value = 0;
      }
    }
  });

  const handlePointerOver = (e: THREE.Event & { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!hovered) hoverStartTime.current = performance.now() / 1000;
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };

  return (
    <group ref={groupRef}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect("blog"); }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={hovered ? 1.06 : 1}
        rotation={[0.1, 0.3, 0]}
      >
        {/* Back cover - premium leather */}
        <mesh position={[0, 0, -bookD / 2]}>
          <boxGeometry args={[bookW, bookH, coverThick, 8, 8, 1]} />
          <primitive object={coverMaterial} attach="material" />
        </mesh>

        {/* Spine - premium leather */}
        <mesh position={[-bookW / 2, 0, 0]}>
          <boxGeometry args={[coverThick, bookH, bookD, 1, 8, 4]} />
          <primitive object={spineMaterial} attach="material" />
        </mesh>

        {/* Pages block - aged paper with glow */}
        <mesh ref={pagesRef} position={[0, 0, 0]}>
          <boxGeometry args={[bookW * 0.9, bookH * 0.92, bookD * 0.7, 4, 4, 4]} />
          <primitive object={pagesMaterial} attach="material" />
        </mesh>


        {/* Point light inside book - creates real glow when open */}
        <pointLight
          position={[0.2, 0, 0.2]}
          color="#ffe4a0"
          intensity={hovered ? 8 : 0}
          distance={4}
          decay={2}
        />

        {/* Front cover — pivots open */}
        <group ref={coverRef} position={[-bookW / 2, 0, bookD / 2]}>
          <mesh geometry={frontCoverGeo}>
            <primitive object={coverMaterial} attach="material" />
          </mesh>

          {/* Gold foil title - ornate */}
          <mesh position={[bookW / 2, bookH * 0.2, coverThick / 2 + 0.008]}>
            <planeGeometry args={[bookW * 0.55, bookH * 0.08]} />
            <meshStandardMaterial
              color="#d4a72d"
              emissive="#b8941f"
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[bookW / 2, bookH * 0.05, coverThick / 2 + 0.008]}>
            <planeGeometry args={[bookW * 0.4, bookH * 0.05]} />
            <meshStandardMaterial
              color="#c9962a"
              emissive="#a87d1a"
              emissiveIntensity={0.5}
              metalness={0.85}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          {/* Decorative corner accents */}
          <mesh position={[bookW * 0.15, bookH * 0.4, coverThick / 2 + 0.006]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#d4a72d" emissive="#b8941f" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[bookW * 0.85, bookH * 0.4, coverThick / 2 + 0.006]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#d4a72d" emissive="#b8941f" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[bookW * 0.15, -bookH * 0.4, coverThick / 2 + 0.006]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#d4a72d" emissive="#b8941f" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[bookW * 0.85, -bookH * 0.4, coverThick / 2 + 0.006]}>
            <circleGeometry args={[0.08, 16]} />
            <meshStandardMaterial color="#d4a72d" emissive="#b8941f" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Orbiting 3D glowing puzzle pieces - 4 different shapes */}
      {puzzleGeos.map((geo, idx) => (
        <instancedMesh
          key={idx}
          ref={puzzleMeshRefs[idx]}
          args={[geo, puzzleGlowMaterial, piecesPerShape[idx]]}
          rotation={[0.1, 0.3, 0]}
        />
      ))}

      {/* Light rays (shooting star style) getting sucked into the book */}
      <group ref={raysGroupRef}>
        {rayGeos.map((geo, idx) => (
          <lineSegments key={idx} geometry={geo}>
            <primitive object={rayMats[idx]} attach="material" />
          </lineSegments>
        ))}
      </group>

      {/* 3D Text Labels - respects depth */}
      <Billboard position={[0, -1.8, 0]} follow={true}>
        <Text
          fontSize={0.35}
          color={hovered ? "#ffffff" : "#e8ecf1"}
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.02}
          outlineColor="#000000"
        >
          Community
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.18}
          color="rgba(232,236,241,0.4)"
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.01}
          outlineColor="#000000"
        >
          Blog & Connect
        </Text>
      </Billboard>
    </group>
  );
}

// BookParticles removed - dust particles now integrated into FloatingBook

// ─── Nova Spawn Effect ──────────────────────────────────

function NovaSpawn({
  children,
  delay,
  color,
  position,
}: {
  children: React.ReactNode;
  delay: number;
  color: string;
  position: [number, number, number];
}) {
  const { skipIntro } = useContext(IntroContext);
  const groupRef = useRef<THREE.Group>(null);
  const glow0 = useRef<THREE.Sprite>(null);
  const glow1 = useRef<THREE.Sprite>(null);
  const glow2 = useRef<THREE.Sprite>(null);
  const rayRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number | null>(null);
  const duration = 1.8;

  const glowMap = useMemo(() => makeGlowMap(), []);

  const rayGeo = useMemo(() => buildRayBurstGeo(10, 1.5, 5), []);
  const rayUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 0 },
  }), [color]);

  const { pGeo, pVels, pCount } = useMemo(() => {
    const cnt = 20;
    const { geo, vels } = buildNovaParticles(cnt, 2, 5);
    return { pGeo: geo, pVels: vels, pCount: cnt };
  }, []);
  const pUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 0 },
    uScale: { value: 1 },
  }), [color]);

  const novaColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (skipIntro) {
      if (groupRef.current) groupRef.current.scale.setScalar(1);
      [glow0.current, glow1.current, glow2.current].forEach((g) => { if (g) g.visible = false; });
      if (rayRef.current) rayRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }
    const t = clock.getElapsedTime();
    if (startTime.current === null) startTime.current = t + delay;
    const elapsed = t - startTime.current;

    if (elapsed < 0) {
      if (groupRef.current) groupRef.current.scale.setScalar(0);
      return;
    }

    const p = Math.min(elapsed / duration, 1);

    // Scale content in
    if (groupRef.current) {
      let s: number;
      if (p < 0.35) { s = easeInOutCubic(p / 0.35) * 1.2; }
      else if (p < 0.55) { s = 1.2 - ((p - 0.35) / 0.2) * 0.2; }
      else { s = 1; }
      groupRef.current.scale.setScalar(s);
    }

    // Glow sprites
    const glows = [glow0.current, glow1.current, glow2.current];
    const glowCfg = [
      { end: 0.45, maxS: 8, peak: 0.12 },   // bright flash
      { end: 0.55, maxS: 5, peak: 0.18 },   // warm glow
      { end: 0.35, maxS: 3.5, peak: 0.08 }, // hot core
    ];
    for (let i = 0; i < 3; i++) {
      const ref = glows[i];
      if (!ref) continue;
      const cfg = glowCfg[i];
      if (p > cfg.end) { ref.visible = false; continue; }
      ref.visible = true;
      const fadeIn = Math.min(p / cfg.peak, 1);
      const fadeOut = p > cfg.peak ? 1 - (p - cfg.peak) / (cfg.end - cfg.peak) : 1;
      const intensity = Math.sin(fadeIn * Math.PI * 0.5) * fadeOut;
      ref.scale.setScalar(cfg.maxS * easeOutCubic(Math.min(p / cfg.end, 1)));
      (ref.material as THREE.SpriteMaterial).opacity = intensity * 0.8;
    }

    // Rays
    if (rayRef.current) {
      if (p < 0.6) {
        rayRef.current.visible = true;
        const rp = p / 0.6;
        rayRef.current.scale.setScalar(easeOutCubic(Math.min(rp / 0.4, 1)));
        rayUniforms.uOpacity.value = (rp < 0.25 ? rp / 0.25 : 1 - (rp - 0.25) / 0.75) * 0.65;
      } else { rayRef.current.visible = false; }
    }

    // Particles
    if (particleRef.current && p < 0.8) {
      const pp = Math.min(elapsed / (duration * 0.65), 1);
      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3] = pVels[i * 3] * pp;
        positions[i * 3 + 1] = pVels[i * 3 + 1] * pp;
        positions[i * 3 + 2] = pVels[i * 3 + 2] * pp;
      }
      pGeo.attributes.position.needsUpdate = true;
      pUniforms.uOpacity.value = (1 - pp) * 0.85;
    }

    // Ring
    if (ringRef.current) {
      if (p < 0.55) {
        ringRef.current.visible = true;
        const rp = p / 0.55;
        ringRef.current.scale.setScalar(1 + rp * 6);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - rp) * 0.35;
      } else { ringRef.current.visible = false; }
    }
  });

  const brightColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(1.5);
    return c;
  }, [color]);

  return (
    <group position={position}>
      {/* Glow sprites — soft volumetric light, no visible geometry */}
      <sprite ref={glow0} visible={false}>
        <spriteMaterial map={glowMap} color={brightColor} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glow1} visible={false}>
        <spriteMaterial map={glowMap} color={novaColor} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glow2} visible={false}>
        <spriteMaterial map={glowMap} color={new THREE.Color(1, 1, 1)} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Light rays — tapered energy filaments */}
      <mesh ref={rayRef} geometry={rayGeo} visible={false}>
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide} uniforms={rayUniforms}
          vertexShader={RAY_VERT} fragmentShader={RAY_FRAG} />
      </mesh>

      {/* Particles — custom shader for soft glowing circles */}
      <points ref={particleRef} geometry={pGeo}>
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={pUniforms} vertexShader={NOVA_PARTICLE_VERT} fragmentShader={NOVA_PARTICLE_FRAG} />
      </points>

      {/* Shockwave ring — very thin torus */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[1, 0.012, 6, 36]} />
        <meshBasicMaterial color={novaColor} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={groupRef}>{children}</group>
    </group>
  );
}

// ─── Sun Nova (sun appears with cinematic supernova) ────

function SunNova({ children }: { children: React.ReactNode }) {
  const { skipIntro } = useContext(IntroContext);
  const groupRef = useRef<THREE.Group>(null);
  const glow0 = useRef<THREE.Sprite>(null);
  const glow1 = useRef<THREE.Sprite>(null);
  const glow2 = useRef<THREE.Sprite>(null);
  const glow3 = useRef<THREE.Sprite>(null);
  const rayRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const startTime = useRef<number | null>(null);
  const duration = 2.2;

  const glowMap = useMemo(() => makeGlowMap(), []);

  const rayGeo = useMemo(() => buildRayBurstGeo(16, 2, 10), []);
  const rayUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(3, 2.2, 0.6) },
    uOpacity: { value: 0 },
  }), []);

  const { pGeo, pVels, pCount } = useMemo(() => {
    const cnt = 30;
    const { geo, vels } = buildNovaParticles(cnt, 3, 9);
    return { pGeo: geo, pVels: vels, pCount: cnt };
  }, []);
  const pUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(3, 2.2, 0.6) },
    uOpacity: { value: 0 },
    uScale: { value: 1 },
  }), []);

  useFrame(({ clock }) => {
    if (skipIntro) {
      if (groupRef.current) groupRef.current.scale.setScalar(1);
      [glow0.current, glow1.current, glow2.current, glow3.current].forEach((g) => { if (g) g.visible = false; });
      if (rayRef.current) rayRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      if (ring2Ref.current) ring2Ref.current.visible = false;
      return;
    }
    const t = clock.getElapsedTime();
    if (startTime.current === null) startTime.current = t + 0.15;
    const elapsed = t - startTime.current;

    if (elapsed < 0) {
      if (groupRef.current) groupRef.current.scale.setScalar(0);
      return;
    }

    const p = Math.min(elapsed / duration, 1);

    // Scale sun in with overshoot
    if (groupRef.current) {
      let s: number;
      if (p < 0.22) { s = easeInOutCubic(p / 0.22) * 1.4; }
      else if (p < 0.4) { s = 1.4 - ((p - 0.22) / 0.18) * 0.4; }
      else { s = 1; }
      groupRef.current.scale.setScalar(s);
    }

    // 4 glow layers — stacked for volumetric overexposed look
    const glows = [glow0.current, glow1.current, glow2.current, glow3.current];
    const glowCfg = [
      { end: 0.50, maxS: 14, peak: 0.12 },  // big warm flash
      { end: 0.45, maxS: 9, peak: 0.10 },   // golden glow
      { end: 0.60, maxS: 18, peak: 0.18 },  // wide soft halo
      { end: 0.30, maxS: 5, peak: 0.06 },   // nuclear bright core
    ];
    for (let i = 0; i < 4; i++) {
      const ref = glows[i];
      if (!ref) continue;
      const cfg = glowCfg[i];
      if (p > cfg.end) { ref.visible = false; continue; }
      ref.visible = true;
      const fadeIn = Math.min(p / cfg.peak, 1);
      const fadeOut = p > cfg.peak ? 1 - (p - cfg.peak) / (cfg.end - cfg.peak) : 1;
      const intensity = Math.sin(fadeIn * Math.PI * 0.5) * fadeOut;
      ref.scale.setScalar(cfg.maxS * easeOutCubic(Math.min(p / cfg.end, 1)));
      (ref.material as THREE.SpriteMaterial).opacity = intensity * 0.85;
    }

    // Ray burst
    if (rayRef.current) {
      if (p < 0.65) {
        rayRef.current.visible = true;
        const rp = p / 0.65;
        rayRef.current.scale.setScalar(easeOutCubic(Math.min(rp / 0.4, 1)));
        rayUniforms.uOpacity.value = (rp < 0.2 ? rp / 0.2 : 1 - (rp - 0.2) / 0.8) * 0.75;
      } else { rayRef.current.visible = false; }
    }

    // Particles
    if (particleRef.current && p < 0.75) {
      const pp = Math.min(elapsed / (duration * 0.6), 1);
      const positions = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3] = pVels[i * 3] * pp;
        positions[i * 3 + 1] = pVels[i * 3 + 1] * pp;
        positions[i * 3 + 2] = pVels[i * 3 + 2] * pp;
      }
      pGeo.attributes.position.needsUpdate = true;
      pUniforms.uOpacity.value = (1 - pp) * 0.9;
    }

    // Rings
    if (ringRef.current) {
      if (p < 0.55) {
        ringRef.current.visible = true;
        const rp = p / 0.55;
        ringRef.current.scale.setScalar(1 + rp * 10);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - rp) * 0.4;
      } else { ringRef.current.visible = false; }
    }
    if (ring2Ref.current) {
      if (p > 0.06 && p < 0.6) {
        ring2Ref.current.visible = true;
        const rp = (p - 0.06) / 0.54;
        ring2Ref.current.scale.setScalar(1 + rp * 7);
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - rp) * 0.25;
      } else { ring2Ref.current.visible = false; }
    }
  });

  const sunColor = new THREE.Color(3, 2.2, 0.6);
  const warmWhite = new THREE.Color(2, 1.8, 1.2);
  const softWarm = new THREE.Color(1.5, 1.2, 0.7);
  const hotCore = new THREE.Color(4, 3.5, 2);

  return (
    <group>
      {/* Glow sprites — soft volumetric light layers */}
      <sprite ref={glow0} visible={false}>
        <spriteMaterial map={glowMap} color={warmWhite} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glow1} visible={false}>
        <spriteMaterial map={glowMap} color={sunColor} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glow2} visible={false}>
        <spriteMaterial map={glowMap} color={softWarm} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glow3} visible={false}>
        <spriteMaterial map={glowMap} color={hotCore} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Light rays — 3D tapered filaments */}
      <mesh ref={rayRef} geometry={rayGeo} visible={false}>
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide} uniforms={rayUniforms}
          vertexShader={RAY_VERT} fragmentShader={RAY_FRAG} />
      </mesh>

      {/* Particles — soft glowing circles */}
      <points ref={particleRef} geometry={pGeo}>
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={pUniforms} vertexShader={NOVA_PARTICLE_VERT} fragmentShader={NOVA_PARTICLE_FRAG} />
      </points>

      {/* Shockwave rings */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[1.2, 0.012, 6, 36]} />
        <meshBasicMaterial color={sunColor} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0.4, 0]} visible={false}>
        <torusGeometry args={[1, 0.01, 6, 36]} />
        <meshBasicMaterial color={warmWhite} transparent opacity={0}
          toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={groupRef}>{children}</group>
    </group>
  );
}

// ─── Central Hub ────────────────────────────────────────

function CentralHub() {
  const [hovered, setHovered] = useState(false);

  return (
    <group>
      {/* Core golden sun — brighter, more intense */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = "/";
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshBasicMaterial
          color={new THREE.Color(4, 2.8, 0.8)}
          toneMapped={false}
        />
      </mesh>

      {/* Inner corona — hot white-gold */}
      <mesh>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(2.5, 1.8, 0.5)}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer corona — wider, softer glow */}
      <mesh>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(1.2, 0.9, 0.2)}
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Pulsing concentric rings */}
      {[0, 1, 2].map((i) => (
        <PulsingRing key={i} index={i} />
      ))}

      {/* 3D Text Labels - respects depth */}
      <Billboard position={[0, -1.4, 0]} follow={true}>
        <Text
          fontSize={0.4}
          color="#fff0c8"
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.02}
          outlineColor="#000000"
        >
          JBN
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.16}
          color="rgba(255,240,200,0.5)"
          anchorX="center"
          anchorY="top"
                    outlineWidth={0.01}
          outlineColor="#000000"
        >
          Central Hub
        </Text>
      </Billboard>
    </group>
  );
}

function PulsingRing({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const t = clock.getElapsedTime();
    const phase = (t * 0.3 + index * 0.4) % 2;
    const s = 1 + phase * 0.9;
    meshRef.current.scale.set(s, s, s);
    matRef.current.opacity = Math.max(0, 1 - phase / 2) * 0.25;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.5, 0.02, 6, 36]} />
      <meshBasicMaterial
        ref={matRef}
        color={new THREE.Color(2, 1.4, 0.3)}
        transparent
        opacity={0.25}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Orbital Paths ──────────────────────────────────────

function OrbitPath({ target, color }: { target: [number, number, number]; color: string }) {
  const lineRef = useRef<THREE.LineLoop>(null);

  const geo = useMemo(() => {
    const dist = Math.sqrt(target[0] ** 2 + target[2] ** 2);
    const points: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [target]);

  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.06, depthWrite: false }), [color]);

  return <primitive ref={lineRef} object={new THREE.LineLoop(geo, mat)} />;
}

// ─── Shooting Stars (glowing head + fading tail) ────────

const METEOR_VERT = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const METEOR_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor * (0.5 + vAlpha * 1.5), vAlpha * uOpacity);
  }
`;

interface ShootingStar {
  startX: number; startY: number; startZ: number;
  dx: number; dy: number; dz: number;
  speed: number; life: number; maxLife: number;
  length: number;
  warm: boolean; // golden vs blue-white
}

function ShootingStars() {
  const MAX_STARS = 3;
  const SEGMENTS = 12; // segments per trail for smooth gradient
  const starsRef = useRef<ShootingStar[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  // Pre-create geometries + materials with alpha gradient
  const geos = useMemo(() => {
    return Array.from({ length: MAX_STARS }, () => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(SEGMENTS * 3);
      const alphas = new Float32Array(SEGMENTS);
      // Alpha gradient: 0 at tail → 1 at head
      for (let i = 0; i < SEGMENTS; i++) {
        alphas[i] = i / (SEGMENTS - 1);
      }
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alphas, 1));
      return geo;
    });
  }, []);

  const uniforms = useMemo(() => {
    return Array.from({ length: MAX_STARS }, () => ({
      uColor: { value: new THREE.Color(0.8, 0.9, 1.0) },
      uOpacity: { value: 0 },
    }));
  }, []);

  const mats = useMemo(() => {
    return uniforms.map((u) =>
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: METEOR_VERT,
        fragmentShader: METEOR_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
  }, [uniforms]);

  // Glow sprites at meteor heads
  const glowMap = useMemo(() => makeGlowMap(), []);
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame((_, delta) => {
    const stars = starsRef.current;

    // Spawn
    if (stars.length < MAX_STARS && Math.random() < 0.004) {
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * 0.4 + 0.2;
      const dist = 40 + Math.random() * 30;
      const warm = Math.random() < 0.25; // 25% golden meteors
      stars.push({
        startX: Math.cos(angle) * dist,
        startY: elevation * dist * 0.5 + 5,
        startZ: Math.sin(angle) * dist,
        dx: -Math.cos(angle) * 0.6 + (Math.random() - 0.5) * 0.3,
        dy: -0.3 - Math.random() * 0.2,
        dz: -Math.sin(angle) * 0.6 + (Math.random() - 0.5) * 0.3,
        speed: 15 + Math.random() * 20,
        life: 0,
        maxLife: 0.8 + Math.random() * 1.2,
        length: 3 + Math.random() * 5,
        warm,
      });
    }

    // Update
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.life += delta;
      if (s.life > s.maxLife) {
        stars.splice(i, 1);
        uniforms[i].uOpacity.value = 0;
        if (spriteRefs.current[i]) spriteRefs.current[i]!.visible = false;
        continue;
      }

      const t = s.life * s.speed;
      const headX = s.startX + s.dx * t;
      const headY = s.startY + s.dy * t;
      const headZ = s.startZ + s.dz * t;

      // Build trail segments from tail to head
      const pos = geos[i].attributes.position.array as Float32Array;
      for (let seg = 0; seg < SEGMENTS; seg++) {
        const frac = seg / (SEGMENTS - 1); // 0=tail, 1=head
        const segT = Math.max(0, t - s.length * (1 - frac));
        pos[seg * 3] = s.startX + s.dx * segT;
        pos[seg * 3 + 1] = s.startY + s.dy * segT;
        pos[seg * 3 + 2] = s.startZ + s.dz * segT;
      }
      geos[i].attributes.position.needsUpdate = true;

      // Fade
      const progress = s.life / s.maxLife;
      const fadeIn = Math.min(progress * 5, 1);
      const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
      const opacity = fadeIn * fadeOut * 0.8;
      uniforms[i].uOpacity.value = opacity;

      // Color
      if (s.warm) {
        uniforms[i].uColor.value.setRGB(1.5, 1.1, 0.4);
      } else {
        uniforms[i].uColor.value.setRGB(0.8, 0.9, 1.2);
      }

      // Glow sprite at head
      const sprite = spriteRefs.current[i];
      if (sprite) {
        sprite.visible = true;
        sprite.position.set(headX, headY, headZ);
        const glowScale = (s.warm ? 2.5 : 1.8) * opacity;
        sprite.scale.setScalar(glowScale);
        (sprite.material as THREE.SpriteMaterial).opacity = opacity * 0.5;
        (sprite.material as THREE.SpriteMaterial).color.copy(uniforms[i].uColor.value);
      }
    }

    // Hide unused slots
    for (let i = stars.length; i < MAX_STARS; i++) {
      uniforms[i].uOpacity.value = 0;
      if (spriteRefs.current[i]) spriteRefs.current[i]!.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      {geos.map((geo, i) => (
        <Fragment key={i}>
          <primitive object={new THREE.Line(geo, mats[i])} />
          <sprite
            ref={(el: THREE.Sprite | null) => { spriteRefs.current[i] = el; }}
            visible={false}
          >
            <spriteMaterial
              map={glowMap}
              transparent
              opacity={0}
              toneMapped={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </Fragment>
      ))}
    </group>
  );
}

// ─── Cinematic Spiral Galaxy ──────────────────────────────

const GALAXY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GALAXY_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  // === PREMIUM HASH FUNCTIONS ===
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
  }

  // === QUINTIC SMOOTH NOISE ===
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // === MULTI-OCTAVE FBM VARIANTS ===
  float fbm(vec2 p, int octaves) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      v += a * noise(p);
      p = rot * p * 2.1 + 100.0;
      a *= 0.5;
    }
    return v;
  }

  // Ultra-fine detail FBM
  float fbmUltra(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.707, 0.707, -0.707, 0.707);
    for (int i = 0; i < 10; i++) {
      v += a * noise(p);
      p = rot * p * 2.2 + 37.0;
      a *= 0.47;
    }
    return v;
  }

  // Ridged turbulence for filaments
  float ridgedFbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 6; i++) {
      float n = abs(noise(p) * 2.0 - 1.0);
      n = 1.0 - n;
      n = n * n;
      v += a * n;
      p = rot * p * 2.0 + 50.0;
      a *= 0.5;
    }
    return v;
  }

  // === SHARP INDIVIDUAL STARS ===
  // Crisp pinpoint stars with spectral colors
  vec4 starField(vec2 uv, float density, float sizeBase, float threshold) {
    vec2 gv = fract(uv * density) - 0.5;
    vec2 id = floor(uv * density);
    vec3 starColor = vec3(0.0);
    float starAlpha = 0.0;

    // Check neighboring cells for larger stars
    for (float y = -1.0; y <= 1.0; y++) {
      for (float x = -1.0; x <= 1.0; x++) {
        vec2 offset = vec2(x, y);
        vec2 cellId = id + offset;
        vec2 rand = hash22(cellId);

        if (rand.x > threshold) {
          vec2 starPos = offset + rand - 0.5;
          float d = length(gv - starPos);

          // Star size based on hash
          float magnitude = pow(rand.x - threshold, 0.4) / (1.0 - threshold);
          float size = sizeBase * (0.2 + magnitude * 0.5);

          // SHARP star core - steep exponential falloff
          float core = exp(-d * d / (size * size * 0.08));

          // Tiny spike/diffraction for bright stars only
          float spikes = 0.0;
          if (magnitude > 0.6) {
            float spike1 = exp(-abs(gv.x - starPos.x) * 80.0) * exp(-abs(gv.y - starPos.y) * 8.0);
            float spike2 = exp(-abs(gv.y - starPos.y) * 80.0) * exp(-abs(gv.x - starPos.x) * 8.0);
            spikes = (spike1 + spike2) * 0.15 * (magnitude - 0.6) * 2.5;
          }

          float intensity = core + spikes;

          // Subtle twinkling
          float twinkle = 0.9 + 0.1 * sin(uTime * (2.0 + rand.y * 4.0) + rand.x * 20.0);
          intensity *= twinkle;

          // Star color temperature (spectral class)
          vec3 col;
          float temp = rand.y;
          if (temp < 0.15) {
            col = vec3(1.0, 0.7, 0.5);       // M - Red
          } else if (temp < 0.35) {
            col = vec3(1.0, 0.85, 0.7);      // K - Orange
          } else if (temp < 0.6) {
            col = vec3(1.0, 0.98, 0.95);     // G - Yellow-white
          } else if (temp < 0.8) {
            col = vec3(0.95, 0.97, 1.0);     // F - White
          } else if (temp < 0.92) {
            col = vec3(0.85, 0.92, 1.0);     // A - Blue-white
          } else {
            col = vec3(0.7, 0.8, 1.0);       // B/O - Blue
          }

          starColor += col * intensity * magnitude * 1.5;
          starAlpha += intensity * magnitude;
        }
      }
    }
    return vec4(starColor, starAlpha);
  }

  // === ORBITING DEBRIS SYSTEM ===
  // Sharp debris particles with crisp edges
  float debrisParticle(vec2 uv, float time, float orbitA, float orbitB, float phase, float speed, float size) {
    float angle = time * speed + phase;
    // Elliptical orbit
    vec2 pos = vec2(cos(angle) * orbitA, sin(angle) * orbitB);
    // Add slight wobble
    pos += vec2(sin(time * 0.7 + phase * 2.0), cos(time * 0.5 + phase * 3.0)) * 0.006;

    float d = length(uv - pos);
    // SHARP exponential falloff - crisp pinpoint
    float brightness = exp(-d * d / (size * size * 0.04));
    return brightness;
  }

  float debrisRing(vec2 uv, float time, float baseRadius, float width, int count, float speedMult, float seed) {
    float debris = 0.0;

    for (int i = 0; i < 24; i++) {
      if (i >= count) break;
      float fi = float(i);
      float h1 = hash(fi + seed);
      float h2 = hash(fi + seed + 100.0);
      float h3 = hash(fi + seed + 200.0);

      float orbitA = baseRadius + (h1 - 0.5) * width;
      float orbitB = orbitA * (0.85 + h2 * 0.3); // Eccentricity
      float phase = h1 * TAU;
      float speed = (0.15 + h2 * 0.25) * speedMult * (h3 > 0.5 ? 1.0 : -1.0);
      float size = 0.0015 + h3 * 0.003;

      debris += debrisParticle(uv, time, orbitA, orbitB, phase, speed, size) * (0.4 + h2 * 0.6);
    }
    return debris;
  }

  // Complete debris field with multiple concentric rings
  float debrisField(vec2 uv, float time) {
    float debris = 0.0;

    // Inner fast debris
    debris += debrisRing(uv, time, 0.06, 0.02, 18, 2.0, 0.0) * 0.9;
    debris += debrisRing(uv, time, 0.10, 0.025, 20, 1.5, 50.0) * 0.8;

    // Mid-range debris
    debris += debrisRing(uv, time, 0.15, 0.03, 22, 1.0, 100.0) * 0.7;
    debris += debrisRing(uv, time, 0.20, 0.035, 24, 0.8, 150.0) * 0.6;
    debris += debrisRing(uv, time, 0.26, 0.04, 22, 0.6, 200.0) * 0.5;

    // Outer slow debris
    debris += debrisRing(uv, time, 0.32, 0.045, 20, 0.4, 250.0) * 0.4;
    debris += debrisRing(uv, time, 0.38, 0.05, 18, 0.3, 300.0) * 0.35;
    debris += debrisRing(uv, time, 0.43, 0.04, 16, 0.25, 350.0) * 0.3;

    return debris;
  }

  // === SPIRAL ARM WITH BRANCHING ===
  float spiralArm(vec2 uv, float armCount, float tightness, float time, float armWidth) {
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);

    // Logarithmic spiral
    float spiral = angle + log(dist + 0.001) * tightness - time;
    spiral = mod(spiral, TAU / armCount);
    spiral = min(spiral, TAU / armCount - spiral);

    // Add irregularity to arm edges
    float edgeNoise = noise(vec2(dist * 20.0 + time, angle * 5.0)) * 0.15;
    spiral += edgeNoise * (0.5 - dist);

    float arm = smoothstep(armWidth + edgeNoise * 0.5, 0.0, spiral);
    arm *= smoothstep(0.0, 0.06, dist);
    arm *= smoothstep(0.48, 0.18, dist);

    return arm;
  }

  // Fine spiral filaments (spurs and feathers)
  float spiralFilaments(vec2 uv, float time) {
    float f = 0.0;

    // Primary spurs branching from main arms
    f += spiralArm(uv, 4.0, 3.8, time * 0.8 + 0.3, 0.12) * 0.2;
    f += spiralArm(uv, 6.0, 4.2, time * 1.1 + 0.7, 0.08) * 0.15;
    f += spiralArm(uv, 8.0, 4.6, time * 0.6 + 1.2, 0.06) * 0.1;

    // Ultra-fine filamentary structure
    f += spiralArm(uv, 10.0, 5.0, time * 1.3 + 0.5, 0.04) * 0.08;
    f += spiralArm(uv, 14.0, 5.5, time * 0.9 + 2.1, 0.03) * 0.05;
    f += spiralArm(uv, 18.0, 6.0, time * 1.5 + 1.7, 0.02) * 0.03;

    return f;
  }

  // === HII REGIONS & STELLAR NURSERIES ===
  float stellarNurseries(vec2 uv, float armMask, float time) {
    float nurseries = 0.0;

    // Embed bright regions along spiral arms
    float n1 = pow(fbm(uv * 25.0 + time * 0.1, 5), 3.0);
    float n2 = pow(fbm(uv * 40.0 - time * 0.08, 4), 2.5);

    nurseries = (n1 * 0.6 + n2 * 0.4) * armMask;
    nurseries = smoothstep(0.15, 0.5, nurseries);

    return nurseries;
  }

  // === DARK NEBULAE (Bok Globules) ===
  float darkNebulae(vec2 uv, float time) {
    float dark = 0.0;

    // Large dark cloud complexes
    float d1 = fbm(uv * 8.0 + time * 0.02, 6);
    float d2 = fbmUltra(uv * 15.0 - time * 0.01);

    dark = d1 * 0.6 + d2 * 0.4;
    dark = smoothstep(0.55, 0.75, dark);

    // Add fine dark filaments
    float filaments = ridgedFbm(uv * 30.0 + time * 0.03);
    dark += filaments * 0.15 * smoothstep(0.4, 0.6, d1);

    return dark;
  }

  // === GALAXY COLOR PALETTE ===
  vec3 galaxyColor(float intensity, float temp, float nursery) {
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 cream = vec3(1.0, 0.97, 0.92);
    vec3 paleBlue = vec3(0.88, 0.92, 1.0);
    vec3 lightBlue = vec3(0.75, 0.85, 0.98);
    vec3 gold = vec3(1.0, 0.9, 0.65);
    vec3 warmWhite = vec3(1.0, 0.95, 0.88);

    // HII region pink/magenta for stellar nurseries
    vec3 hiiPink = vec3(1.0, 0.6, 0.7);

    intensity = clamp(intensity, 0.0, 1.0);

    vec3 baseCol;
    if (temp > 0.75) {
      // Hot core - golden white
      baseCol = mix(gold, warmWhite, (temp - 0.75) * 4.0);
    } else if (temp > 0.45) {
      // Mid region - cream to pale gold
      baseCol = mix(cream, gold, (temp - 0.45) * 3.33);
    } else if (temp > 0.2) {
      // Arm region - pale blue to cream
      baseCol = mix(lightBlue, cream, (temp - 0.2) * 4.0);
    } else {
      // Outer - blue tinted
      baseCol = mix(paleBlue * 0.7, lightBlue, temp * 5.0);
    }

    // Mix in HII region color
    baseCol = mix(baseCol, hiiPink, nursery * 0.3);

    return baseCol * intensity;
  }

  void main() {
    vec2 uv = vUv - 0.5;

    // Galaxy tilt (~75 degrees) - steep angle to see side profile
    float tiltAngle = 1.3;
    vec2 tiltedUV = vec2(uv.x, uv.y / cos(tiltAngle));

    // === SLOW GALAXY ROTATION ===
    // Rotate entire galaxy around center (one rotation every ~3 minutes)
    float rotationSpeed = 0.035;
    float rotAngle = uTime * rotationSpeed;
    mat2 rotMat = mat2(cos(rotAngle), -sin(rotAngle), sin(rotAngle), cos(rotAngle));
    tiltedUV = rotMat * tiltedUV;

    float dist = length(tiltedUV);
    float angle = atan(tiltedUV.y, tiltedUV.x);

    float time = uTime * 0.015;

    // === DIRECTIONAL LIGHTING - light comes from one side ===
    // Light direction (from upper-left, pointing into the galaxy)
    vec2 lightDir = normalize(vec2(0.7, 0.5));
    float lightAngle = atan(lightDir.y, lightDir.x);

    // How much each point faces the light (based on position angle)
    float facingLight = dot(normalize(tiltedUV + 0.001), lightDir);
    facingLight = facingLight * 0.5 + 0.5; // remap to 0-1

    // === STRONG RANDOMIZED REFLECTIONS ===
    // Multiple noise layers for complex light scattering
    float lightNoise1 = fbm(tiltedUV * 8.0 + time * 0.3, 5);
    float lightNoise2 = fbmUltra(tiltedUV * 20.0 - time * 0.2);
    float lightNoise3 = pow(fbm(tiltedUV * 35.0 + time * 0.5, 4), 1.5);

    // Combine noises for varied reflection patches
    float reflectionNoise = lightNoise1 * 0.5 + lightNoise2 * 0.3 + lightNoise3 * 0.4;

    // Create bright reflection spots (like dust clouds catching light)
    float brightSpots = smoothstep(0.5, 0.8, reflectionNoise) * 1.5;

    // Create shadow patches (occluded regions)
    float shadowPatches = smoothstep(0.6, 0.3, lightNoise1) * 0.6;

    // Combine directional light with randomized reflections
    float lightVariation = facingLight * (0.4 + reflectionNoise * 0.8);
    lightVariation += brightSpots * facingLight; // Bright spots on lit side
    lightVariation *= (1.0 - shadowPatches * (1.0 - facingLight)); // Shadows on dark side
    lightVariation = 0.25 + lightVariation * 0.75; // Range: 0.25 to 1.0

    // Extra sparkle reflections - random bright points
    float sparkleNoise = fbmUltra(tiltedUV * 60.0 + uTime * 0.1);
    float sparkles = smoothstep(0.75, 0.9, sparkleNoise) * facingLight * 2.0;

    vec3 color = vec3(0.0);
    float totalAlpha = 0.0;

    // === DEEP BACKGROUND STARFIELD - sharp pinpoints ===
    vec4 bgStars1 = starField(uv * 0.7, 60.0, 0.018, 0.88);
    vec4 bgStars2 = starField(uv * 1.1 + 0.3, 100.0, 0.012, 0.9);
    vec4 bgStars3 = starField(uv * 0.5 + 0.7, 40.0, 0.025, 0.85);
    vec4 bgStars4 = starField(uv * 1.5 + 0.15, 150.0, 0.008, 0.92);
    vec4 bgStars5 = starField(uv * 2.0 + 0.5, 220.0, 0.005, 0.94);
    vec4 bgStars6 = starField(uv * 2.5 + 0.8, 300.0, 0.003, 0.95);

    vec3 allBgStars = bgStars1.rgb + bgStars2.rgb + bgStars3.rgb + bgStars4.rgb + bgStars5.rgb + bgStars6.rgb;
    color += allBgStars * 0.7;

    // === GALACTIC BULGE / CORE ===
    float coreSize = 0.05;
    float coreDist = length(tiltedUV);

    // Sharp concentrated core with exponential falloff
    float innerCore = exp(-coreDist * coreDist / (coreSize * coreSize * 0.5)) * 2.0;

    // Tighter mid glow
    float midCore = exp(-coreDist * coreDist / (coreSize * coreSize * 3.0)) * 0.5;

    // Subtle outer halo
    float outerCore = exp(-coreDist * coreDist / (coreSize * coreSize * 12.0)) * 0.2;

    // Core texture - dense stellar population with sharp detail
    float coreGrain = fbmUltra(tiltedUV * 150.0 + uTime * 0.05);
    float coreFine = fbmUltra(tiltedUV * 250.0 - uTime * 0.03);
    float coreUltra = fbmUltra(tiltedUV * 400.0 + uTime * 0.02);
    innerCore *= 0.7 + coreGrain * 0.3 + coreFine * 0.15 + coreUltra * 0.08;

    // Core color gradient with directional lighting
    vec3 coreCol = mix(vec3(1.0, 0.92, 0.75), vec3(1.0, 0.98, 0.95), innerCore * 0.35);
    coreCol = mix(coreCol, vec3(1.0, 0.88, 0.7), smoothstep(0.0, 0.06, coreDist));
    coreCol *= (0.7 + lightVariation * 0.4); // Stronger light variation on core
    coreCol += vec3(1.0, 0.95, 0.85) * sparkles * 0.3; // Add sparkle reflections

    color += coreCol * (innerCore + midCore + outerCore);
    totalAlpha += innerCore * 0.85 + midCore * 0.4 + outerCore * 0.2;

    // === PRIMARY SPIRAL ARMS ===
    float arm1 = spiralArm(tiltedUV, 2.0, 2.6, time, 0.38);
    float arm2 = spiralArm(tiltedUV, 2.0, 2.6, time + PI, 0.38);

    // Secondary arms
    float arm3 = spiralArm(tiltedUV, 2.0, 3.0, time + PI * 0.5, 0.28) * 0.55;
    float arm4 = spiralArm(tiltedUV, 2.0, 3.0, time + PI * 1.5, 0.28) * 0.55;

    // Tertiary structure
    float arm5 = spiralArm(tiltedUV, 4.0, 3.4, time * 1.1 + 0.3, 0.18) * 0.35;

    float totalArms = arm1 + arm2 + arm3 + arm4 + arm5;

    // Add fine filaments
    float filaments = spiralFilaments(tiltedUV, time);
    totalArms += filaments;

    // === ARM TEXTURE & STRUCTURE ===
    // Multi-scale dust and gas
    float dustCoarse = fbm(tiltedUV * 6.0 + time * 0.3, 5) * 0.5;
    float dustMedium = fbm(tiltedUV * 15.0 + time * 0.2, 6) * 0.35;
    float dustFine = fbmUltra(tiltedUV * 35.0 + time * 0.15) * 0.25;
    float dustUltra = fbmUltra(tiltedUV * 70.0 - time * 0.1) * 0.15;
    float dustMicro = fbmUltra(tiltedUV * 120.0 + time * 0.08) * 0.1;

    // Star cluster concentrations
    float clusters = pow(fbm(tiltedUV * 20.0 + time * 0.25, 4), 2.5) * 1.8;
    float microClusters = pow(fbmUltra(tiltedUV * 50.0 + time * 0.12), 2.0) * 0.8;

    float armDensity = totalArms * (0.55 + dustCoarse + dustMedium + dustFine + dustUltra + dustMicro);
    armDensity += clusters * totalArms * 0.5;
    armDensity += microClusters * totalArms * 0.3;

    // === STELLAR NURSERIES IN ARMS ===
    float nurseries = stellarNurseries(tiltedUV, totalArms, time);

    // Temperature gradient
    float temp = 1.0 - dist * 1.7;
    temp = clamp(temp, 0.0, 1.0);

    // Arm coloring with strong directional lighting
    vec3 armColor = galaxyColor(armDensity, temp, nurseries);

    // Apply directional light - arms facing light are much brighter
    armColor *= lightVariation * 1.2;

    // Add sparkle reflections to arms
    armColor += vec3(1.0, 0.97, 0.9) * sparkles * totalArms * 0.5;

    // Bright reflection patches in dust clouds
    float dustReflection = brightSpots * totalArms * 0.4;
    armColor += vec3(0.95, 0.92, 0.85) * dustReflection;

    // Bright OB associations
    float obStars = clusters * totalArms * 0.4;
    armColor += vec3(0.85, 0.9, 1.0) * obStars * lightVariation;

    // Individual bright arm stars
    vec4 armStars = starField(tiltedUV * 1.2, 300.0, 0.01, 0.93);
    armColor += armStars.rgb * totalArms * 0.6;

    color += armColor;
    totalAlpha += armDensity * 0.75;

    // === DARK NEBULAE / DUST LANES ===
    float darkDust = darkNebulae(tiltedUV, time);
    float dustLaneMask = totalArms * darkDust * 0.45;
    color *= 1.0 - dustLaneMask * 0.5;

    // Fine extinction
    float fineExtinction = fbmUltra(tiltedUV * 45.0 + time * 0.05);
    fineExtinction = smoothstep(0.5, 0.7, fineExtinction) * totalArms * 0.15;
    color *= 1.0 - fineExtinction * 0.3;

    // === INTERSTELLAR MEDIUM - with directional light ===
    float ism = fbmUltra(tiltedUV * 22.0 + uTime * 0.03);
    ism *= smoothstep(0.38, 0.1, dist);
    color += vec3(0.9, 0.92, 0.97) * ism * 0.035 * lightVariation;

    // === DIFFUSE GALACTIC LIGHT - with light direction ===
    float diffuse = exp(-dist * dist / 0.025) * 0.08;
    color += vec3(0.95, 0.93, 0.88) * diffuse * lightVariation;

    // === OUTER HALO - with rim lighting on edge ===
    float halo = exp(-dist * dist / 0.06) * 0.04;
    float haloTex = fbmUltra(tiltedUV * 15.0 + uTime * 0.02);
    halo *= 0.8 + haloTex * 0.3;

    // Rim/edge lighting - bright edge where light grazes the tilted disk
    float rimLight = smoothstep(0.12, 0.32, abs(tiltedUV.y)) * smoothstep(0.45, 0.2, dist);
    rimLight *= facingLight * 1.2;
    // Add reflection variation to rim
    rimLight *= (0.6 + reflectionNoise * 0.6);
    halo += rimLight * 0.25;

    // Bright reflection spots along rim
    float rimSparkle = sparkles * smoothstep(0.1, 0.25, abs(tiltedUV.y)) * 0.4;
    halo += rimSparkle;

    // Globular cluster hints - sharp points
    vec4 gcStars = starField(tiltedUV * 0.8, 30.0, 0.025, 0.85);
    halo += gcStars.a * 0.08 * smoothstep(0.15, 0.35, dist);

    color += vec3(0.9, 0.92, 0.97) * halo;

    // === FOREGROUND STARS - bright and sharp ===
    vec4 fgStars1 = starField(uv + 0.5, 22.0, 0.03, 0.78);
    vec4 fgStars2 = starField(uv * 0.8 + 0.2, 18.0, 0.04, 0.75);
    vec4 fgStars3 = starField(uv * 0.6 + 0.4, 15.0, 0.05, 0.72);
    color += fgStars1.rgb * 0.9;
    color += fgStars2.rgb * 0.7;
    color += fgStars3.rgb * 0.5;

    // === FINAL ADJUSTMENTS ===
    // Subtle temporal variation
    float pulse = 0.99 + 0.01 * sin(uTime * 0.4);
    color *= pulse;

    // Vignette / edge fade
    float edgeFade = smoothstep(0.54, 0.30, dist);
    color *= edgeFade;

    // Increase contrast for sharper appearance
    color = pow(color, vec3(0.92));

    // Boost bright points
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, color * 1.3, smoothstep(0.5, 1.5, luminance));

    // Final alpha
    float alpha = clamp(totalAlpha + length(allBgStars) * 0.5, 0.0, 1.0);
    alpha = max(alpha, smoothstep(0.01, 0.06, length(color)));
    alpha *= edgeFade;

    gl_FragColor = vec4(color, alpha);
  }
`;

function Galaxy3D() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = t;

      // Very slow galaxy rotation (one full rotation every ~10 minutes)
      meshRef.current.rotation.z = 0.2 + t * 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 5, -65]}
      rotation={[0.6, 0.15, 0.2]}
    >
      <planeGeometry args={[280, 280]} />
      <shaderMaterial
        vertexShader={GALAXY_VERT}
        fragmentShader={GALAXY_FRAG}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── MINI GALAXY SHADER ─────────────────────────────────
// Smaller distant galaxies with customizable color tint - ultra detailed

const MINI_GALAXY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MINI_GALAXY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorTint;
  uniform float uSeed;
  varying vec2 vUv;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  // Premium hash functions
  float hash(float n) { return fract(sin(n + uSeed) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p + uSeed, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p + uSeed) * 43758.5453);
  }

  // Quintic smooth noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Multi-octave FBM
  float fbm(vec2 p, int octaves) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      v += a * noise(p);
      p = rot * p * 2.1 + 100.0;
      a *= 0.5;
    }
    return v;
  }

  // Ultra-fine detail FBM
  float fbmUltra(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.707, 0.707, -0.707, 0.707);
    for (int i = 0; i < 10; i++) {
      v += a * noise(p);
      p = rot * p * 2.2 + 37.0;
      a *= 0.47;
    }
    return v;
  }

  // Ridged turbulence for filaments
  float ridgedFbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 6; i++) {
      float n = abs(noise(p) * 2.0 - 1.0);
      n = 1.0 - n;
      n = n * n;
      v += a * n;
      p = rot * p * 2.0 + 50.0;
      a *= 0.5;
    }
    return v;
  }

  // PURE SHARP PINPOINT stars - NO glow, NO softness
  vec4 starField(vec2 uv, float density, float sizeBase, float threshold) {
    vec2 gv = fract(uv * density) - 0.5;
    vec2 id = floor(uv * density);
    vec3 starColor = vec3(0.0);
    float starAlpha = 0.0;

    for (float y = -1.0; y <= 1.0; y++) {
      for (float x = -1.0; x <= 1.0; x++) {
        vec2 offset = vec2(x, y);
        vec2 cellId = id + offset;
        vec2 rand = hash22(cellId);

        if (rand.x > threshold) {
          vec2 starPos = offset + rand - 0.5;
          float d = length(gv - starPos);

          float magnitude = pow(rand.x - threshold, 0.4) / (1.0 - threshold);
          float size = sizeBase * (0.08 + magnitude * 0.25);

          // HARD CUTOFF - no soft glow at all
          // Using pow with high exponent for near-binary falloff
          float core = pow(max(0.0, 1.0 - d / (size * 0.015)), 12.0);

          // Tiny bright center - pure point
          float point = pow(max(0.0, 1.0 - d / (size * 0.006)), 20.0) * 1.5;

          // Very thin crisp spikes - no soft falloff
          float spikes = 0.0;
          if (magnitude > 0.5) {
            float spikeStrength = (magnitude - 0.5) * 2.0;
            // Extremely narrow spikes
            float spike1 = pow(max(0.0, 1.0 - abs(gv.x - starPos.x) * 80.0), 8.0) * pow(max(0.0, 1.0 - abs(gv.y - starPos.y) * 15.0), 4.0);
            float spike2 = pow(max(0.0, 1.0 - abs(gv.y - starPos.y) * 80.0), 8.0) * pow(max(0.0, 1.0 - abs(gv.x - starPos.x) * 15.0), 4.0);
            spikes = (spike1 + spike2) * 0.5 * spikeStrength;
          }

          float intensity = core + point + spikes;

          // Subtle twinkling
          float twinkle = 0.9 + 0.1 * sin(uTime * (3.0 + rand.y * 6.0) + rand.x * 30.0);
          intensity *= twinkle;

          // Star color - white with subtle tint
          vec3 col = mix(vec3(1.0), uColorTint, 0.15 + rand.y * 0.25);

          starColor += col * intensity * magnitude * 2.5;
          starAlpha += intensity * magnitude;
        }
      }
    }
    return vec4(starColor, starAlpha);
  }

  // Spiral arm with branching detail
  float spiralArm(vec2 uv, float armCount, float tightness, float phase, float width) {
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    float spiral = angle + log(dist + 0.001) * tightness - phase;
    spiral = mod(spiral, TAU / armCount);
    spiral = min(spiral, TAU / armCount - spiral);

    // Irregular edges
    float edgeNoise = noise(vec2(dist * 25.0 + phase, angle * 6.0)) * 0.15;
    spiral += edgeNoise * (0.5 - dist);

    float arm = smoothstep(width + edgeNoise * 0.5, 0.0, spiral);
    arm *= smoothstep(0.0, 0.06, dist);
    arm *= smoothstep(0.48, 0.16, dist);
    return arm;
  }

  // Fine spiral filaments
  float spiralFilaments(vec2 uv, float time) {
    float f = 0.0;
    f += spiralArm(uv, 4.0, 3.8, time * 0.8 + 0.3, 0.1) * 0.18;
    f += spiralArm(uv, 6.0, 4.2, time * 1.1 + 0.7, 0.07) * 0.12;
    f += spiralArm(uv, 8.0, 4.6, time * 0.6 + 1.2, 0.05) * 0.08;
    f += spiralArm(uv, 12.0, 5.2, time * 1.4 + 0.5, 0.03) * 0.05;
    return f;
  }

  // Dark nebulae patches
  float darkNebulae(vec2 uv, float time) {
    float dark = fbm(uv * 10.0 + time * 0.02, 6);
    float fine = fbmUltra(uv * 18.0 - time * 0.01);
    dark = dark * 0.6 + fine * 0.4;
    dark = smoothstep(0.52, 0.72, dark);
    float filaments = ridgedFbm(uv * 35.0 + time * 0.03);
    dark += filaments * 0.12 * smoothstep(0.4, 0.6, dark);
    return dark;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float time = uTime * 0.015 + uSeed * 10.0;

    // Slow rotation like main galaxy
    float rotSpeed = 0.035;
    float rotAngle = uTime * rotSpeed + uSeed * 3.0;
    mat2 rotMat = mat2(cos(rotAngle), -sin(rotAngle), sin(rotAngle), cos(rotAngle));
    vec2 rotUV = rotMat * uv;

    // Tilt for 3D look
    float tiltAngle = 1.2 + uSeed * 0.3;
    vec2 tiltedUV = vec2(rotUV.x, rotUV.y / cos(tiltAngle));
    float tiltDist = length(tiltedUV);

    vec3 color = vec3(0.0);
    float totalAlpha = 0.0;

    // Multi-layer background stars - sharp pinpoints
    vec4 bgStars1 = starField(uv * 0.7, 50.0, 0.015, 0.86);
    vec4 bgStars2 = starField(uv * 1.1 + 0.3, 90.0, 0.01, 0.89);
    vec4 bgStars3 = starField(uv * 0.5 + 0.7, 35.0, 0.02, 0.84);
    vec4 bgStars4 = starField(uv * 1.6 + 0.15, 140.0, 0.007, 0.92);
    vec4 bgStars5 = starField(uv * 2.2 + 0.5, 200.0, 0.004, 0.94);

    vec3 allStars = bgStars1.rgb + bgStars2.rgb + bgStars3.rgb + bgStars4.rgb + bgStars5.rgb;
    color += allStars * 0.6;

    // === GALACTIC CORE - HARD SHARP, NO SOFT GLOW ===
    float coreSize = 0.035;

    // Hard cutoff core - no soft outer glow
    float coreDist = tiltDist / coreSize;
    float hotSpot = pow(max(0.0, 1.0 - coreDist * 3.0), 15.0) * 4.0;
    float innerCore = pow(max(0.0, 1.0 - coreDist * 1.5), 8.0) * 2.5;
    float midCore = pow(max(0.0, 1.0 - coreDist * 0.8), 5.0) * 0.6;
    // No outer glow - removed completely

    // Multi-scale core grain texture
    float coreGrain1 = fbmUltra(tiltedUV * 180.0 + uTime * 0.04);
    float coreGrain2 = fbmUltra(tiltedUV * 320.0 - uTime * 0.025);
    float coreGrain3 = fbmUltra(tiltedUV * 500.0 + uTime * 0.015);
    innerCore *= 0.55 + coreGrain1 * 0.4 + coreGrain2 * 0.18 + coreGrain3 * 0.1;
    hotSpot *= 0.75 + coreGrain1 * 0.3;

    // Core color - bright white hot center
    vec3 hotCol = mix(vec3(1.0), uColorTint, 0.1);
    vec3 coreCol = uColorTint * 1.5;

    color += hotCol * hotSpot + coreCol * (innerCore + midCore);
    totalAlpha += hotSpot * 0.98 + innerCore * 0.9 + midCore * 0.5;

    // === PRIMARY SPIRAL ARMS ===
    float arm1 = spiralArm(tiltedUV, 2.0, 2.6, time, 0.36);
    float arm2 = spiralArm(tiltedUV, 2.0, 2.6, time + PI, 0.36);

    // Secondary arms
    float arm3 = spiralArm(tiltedUV, 2.0, 3.0, time + PI * 0.5, 0.26) * 0.55;
    float arm4 = spiralArm(tiltedUV, 2.0, 3.0, time + PI * 1.5, 0.26) * 0.55;

    // Tertiary structure
    float arm5 = spiralArm(tiltedUV, 4.0, 3.4, time * 1.1 + 0.3, 0.16) * 0.3;

    float totalArms = arm1 + arm2 + arm3 + arm4 + arm5;

    // Add fine filaments
    float filaments = spiralFilaments(tiltedUV, time);
    totalArms += filaments;

    // === ARM TEXTURE - multi-scale ===
    float dustCoarse = fbm(tiltedUV * 6.0 + time * 0.3, 5) * 0.5;
    float dustMedium = fbm(tiltedUV * 16.0 + time * 0.2, 6) * 0.35;
    float dustFine = fbmUltra(tiltedUV * 38.0 + time * 0.15) * 0.25;
    float dustUltra = fbmUltra(tiltedUV * 75.0 - time * 0.1) * 0.15;
    float dustMicro = fbmUltra(tiltedUV * 130.0 + time * 0.08) * 0.08;

    // Star cluster concentrations
    float clusters = pow(fbm(tiltedUV * 22.0 + time * 0.25, 4), 2.5) * 1.6;
    float microClusters = pow(fbmUltra(tiltedUV * 55.0 + time * 0.12), 2.0) * 0.7;

    float armDensity = totalArms * (0.5 + dustCoarse + dustMedium + dustFine + dustUltra + dustMicro);
    armDensity += clusters * totalArms * 0.45;
    armDensity += microClusters * totalArms * 0.25;

    // Temperature gradient
    float temp = 1.0 - tiltDist * 1.8;
    temp = clamp(temp, 0.0, 1.0);

    // Arm coloring
    vec3 armColor = mix(uColorTint * 0.65, uColorTint * 1.15, temp);
    armColor = mix(armColor, vec3(1.0, 0.96, 0.92), temp * 0.25);

    // Dark nebulae subtraction
    float darkPatches = darkNebulae(tiltedUV, time);
    armDensity *= (1.0 - darkPatches * 0.5);

    color += armColor * armDensity;
    totalAlpha += armDensity * 0.7;

    // Bright star clusters
    color += uColorTint * 1.4 * clusters * totalArms;
    totalAlpha += clusters * totalArms * 0.4;

    // Edge fade
    float edgeFade = 1.0 - smoothstep(0.32, 0.5, dist);
    color *= edgeFade;
    totalAlpha *= edgeFade;

    gl_FragColor = vec4(color, totalAlpha * 0.9);
  }
`;

interface MiniGalaxyProps {
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
  colorTint: [number, number, number];
  seed: number;
}

function MiniGalaxy({ position, scale, rotation = [0, 0, 0], colorTint, seed }: MiniGalaxyProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorTint: { value: new THREE.Vector3(...colorTint) },
    uSeed: { value: seed },
  }), [colorTint, seed]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = t;

      // Slow mesh rotation like main galaxy (one rotation every ~10 minutes)
      meshRef.current.rotation.z = rotation[2] + t * 0.01 + seed * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
    >
      <planeGeometry args={[scale, scale]} />
      <shaderMaterial
        vertexShader={MINI_GALAXY_VERT}
        fragmentShader={MINI_GALAXY_FRAG}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── DISTANT GALAXIES - Small galaxies scattered around ────
function DistantGalaxies() {
  const galaxies = useMemo(() => {
    const rand = clusterRandom(777);
    const result: MiniGalaxyProps[] = [];

    // Expanded color palette - reds, blues, and purples
    const galaxyColors: [number, number, number][] = [
      // Reds (12)
      [1.0, 0.4, 0.3],    // Bright red-orange
      [1.0, 0.3, 0.35],   // Deep red
      [0.95, 0.5, 0.4],   // Coral
      [1.0, 0.35, 0.5],   // Red-magenta
      [0.9, 0.45, 0.35],  // Rust red
      [1.0, 0.55, 0.45],  // Salmon
      [0.85, 0.3, 0.4],   // Crimson
      [1.0, 0.6, 0.5],    // Light coral
      [0.95, 0.4, 0.45],  // Rose red
      [1.0, 0.5, 0.35],   // Tangerine red
      [0.92, 0.35, 0.3],  // Brick red
      [1.0, 0.38, 0.42],  // Raspberry

      // Blues (12)
      [0.3, 0.5, 1.0],    // Bright blue
      [0.4, 0.6, 0.95],   // Sky blue
      [0.25, 0.4, 0.9],   // Royal blue
      [0.5, 0.7, 1.0],    // Light blue
      [0.35, 0.55, 0.95], // Azure
      [0.2, 0.45, 0.85],  // Deep blue
      [0.45, 0.65, 1.0],  // Cerulean
      [0.3, 0.6, 0.9],    // Steel blue
      [0.55, 0.75, 1.0],  // Pale blue
      [0.28, 0.48, 0.92], // Cobalt
      [0.4, 0.55, 0.88],  // Slate blue
      [0.5, 0.8, 1.0],    // Ice blue

      // Purples (12)
      [0.7, 0.3, 0.9],    // Violet
      [0.6, 0.35, 0.85],  // Purple
      [0.8, 0.4, 0.95],   // Bright purple
      [0.55, 0.3, 0.8],   // Deep purple
      [0.75, 0.45, 0.9],  // Orchid
      [0.5, 0.35, 0.75],  // Plum
      [0.65, 0.4, 0.88],  // Amethyst
      [0.85, 0.5, 1.0],   // Lavender bright
      [0.6, 0.3, 0.7],    // Grape
      [0.7, 0.4, 0.85],   // Heather
      [0.55, 0.45, 0.9],  // Periwinkle
      [0.8, 0.35, 0.8],   // Magenta-purple
    ];

    // Minimum distance between galaxies
    const minDistance = 45;
    const placedPositions: [number, number, number][] = [];

    // Helper to check if position is far enough from all others
    const isFarEnough = (pos: [number, number, number]): boolean => {
      for (const placed of placedPositions) {
        const dx = pos[0] - placed[0];
        const dy = pos[1] - placed[1];
        const dz = pos[2] - placed[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDistance) return false;
      }
      return true;
    };

    // Target number of galaxies
    const targetCount = 25;
    let attempts = 0;
    const maxAttempts = 500;

    while (result.length < targetCount && attempts < maxAttempts) {
      attempts++;

      // Distribute throughout the entire universe volume
      // Use multiple distance ranges for depth
      const distanceRoll = rand();
      let distance: number;
      if (distanceRoll < 0.25) {
        distance = 50 + rand() * 40; // Near-mid range (50-90)
      } else if (distanceRoll < 0.55) {
        distance = 90 + rand() * 50; // Mid range (90-140)
      } else if (distanceRoll < 0.8) {
        distance = 140 + rand() * 60; // Far range (140-200)
      } else {
        distance = 200 + rand() * 80; // Very far (200-280)
      }

      // Full spherical distribution
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      const x = Math.sin(phi) * Math.cos(theta) * distance;
      const y = Math.sin(phi) * Math.sin(theta) * distance * 0.7; // Slightly flattened
      const z = Math.cos(phi) * distance - 30; // Slight offset back

      const position: [number, number, number] = [x, y, z];

      // Check minimum distance from other galaxies
      if (!isFarEnough(position)) continue;

      // Also avoid center area where main galaxy and planets are
      const centerDist = Math.sqrt(x * x + y * y + (z + 30) * (z + 30));
      if (centerDist < 40) continue;

      placedPositions.push(position);

      // Size varies with distance - farther = smaller appearance
      const baseScale = 8 + rand() * 14;
      const distanceFactor = Math.max(0.5, 1.0 - (distance - 50) / 300);
      const scale = baseScale * (0.8 + distanceFactor * 0.5);

      // Random rotation
      const rotX = (rand() - 0.5) * Math.PI * 0.9;
      const rotY = (rand() - 0.5) * Math.PI * 0.9;
      const rotZ = rand() * Math.PI * 2;

      // Pick color from palette
      const colorIndex = Math.floor(rand() * galaxyColors.length);

      result.push({
        position,
        scale,
        rotation: [rotX, rotY, rotZ],
        colorTint: galaxyColors[colorIndex],
        seed: result.length * 23 + 7,
      });
    }

    return result;
  }, []);

  return (
    <>
      {galaxies.map((galaxy, i) => (
        <MiniGalaxy key={i} {...galaxy} />
      ))}
    </>
  );
}

interface SpaceClusterProps {
  position: [number, number, number];
  scale: number;
  density?: number;
  seed?: number;
}

// Seeded random generator for cluster
function clusterRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── CLUSTER SHADER FOR SHARP STARS ─────────────────────────
const CLUSTER_STAR_VERT = /* glsl */ `
  attribute float size;
  attribute float brightness;
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vColor = color;
    vBrightness = brightness;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const CLUSTER_STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // ULTRA SHARP exponential core - crisp pinpoint
    float core = exp(-dist * dist * 120.0);

    // Add a bright concentrated center for extra sharpness
    float hotCenter = exp(-dist * dist * 400.0) * 0.6;

    // Prominent diffraction spikes for all visible stars
    float spikes = 0.0;
    if (vBrightness > 0.5) {
      float spikeIntensity = (vBrightness - 0.5) * 2.0;
      float spike1 = exp(-abs(center.x) * 60.0) * exp(-abs(center.y) * 6.0);
      float spike2 = exp(-abs(center.y) * 60.0) * exp(-abs(center.x) * 6.0);
      // Add diagonal spikes for bright stars
      float diag1 = exp(-abs(center.x - center.y) * 45.0) * exp(-abs(center.x + center.y) * 8.0);
      float diag2 = exp(-abs(center.x + center.y) * 45.0) * exp(-abs(center.x - center.y) * 8.0);
      spikes = (spike1 + spike2) * 0.4 * spikeIntensity;
      if (vBrightness > 0.8) {
        spikes += (diag1 + diag2) * 0.15 * (vBrightness - 0.8) * 5.0;
      }
    }

    float intensity = core + hotCenter + spikes;
    float alpha = clamp(intensity, 0.0, 1.0);
    if (alpha < 0.008) discard;

    // Boost brightness
    gl_FragColor = vec4(vColor * intensity * 1.4, alpha);
  }
`;

// ─── NEBULA DUST SHADER ─────────────────────────────────────
const DUST_VERT = /* glsl */ `
  attribute float size;
  attribute float opacity;
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = color;
    vOpacity = opacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DUST_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // Sharper dust with bright core
    float core = exp(-dist * dist * 25.0);
    float glow = exp(-dist * dist * 8.0) * 0.4;
    float alpha = (core + glow) * vOpacity;
    if (alpha < 0.003) discard;

    // Boost color intensity
    gl_FragColor = vec4(vColor * (1.0 + core * 0.5), alpha);
  }
`;

// ─── COMET TRAIL SHADER ─────────────────────────────────────
const COMET_VERT = /* glsl */ `
  attribute float size;
  attribute float trailPos;
  varying float vTrailPos;
  varying vec3 vColor;

  void main() {
    vTrailPos = trailPos;
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const COMET_FRAG = /* glsl */ `
  varying float vTrailPos;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // Ultra sharp head, crisp fading tail
    float headIntensity = 1.0 - vTrailPos * 0.85;
    float sharpness = 50.0 + vTrailPos * 80.0;
    float core = exp(-dist * dist * sharpness);
    float hotSpot = exp(-dist * dist * 200.0) * (1.0 - vTrailPos);
    float alpha = (core + hotSpot * 0.5) * headIntensity;
    if (alpha < 0.008) discard;

    // Bright blue-white at head, fading to cyan
    vec3 col = mix(vec3(1.0, 1.0, 1.0), vec3(0.6, 0.85, 1.0), vTrailPos);
    gl_FragColor = vec4(col * headIntensity * 1.8, alpha);
  }
`;

// 3D Space Cluster - ultra-detailed volumetric cluster like the galaxy
function SpaceCluster({ position, scale, density = 1, seed = 0 }: SpaceClusterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const brightStarsRef = useRef<THREE.Points>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.Points>(null);
  const fineDustRef = useRef<THREE.Points>(null);
  const nurseryRef = useRef<THREE.Points>(null);
  const cometRef = useRef<THREE.Points>(null);
  const filamentRef = useRef<THREE.Points>(null);

  const rand = useMemo(() => clusterRandom(seed), [seed]);

  // ─── DENSE STAR FIELD - Many sharp pinpoint stars ───────────
  const starData = useMemo(() => {
    const count = Math.floor(180 * density); // Optimized count
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution with concentration toward center
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = Math.pow(rand(), 0.4) * scale * 0.55;

      // Add some noise to break up uniformity
      const noiseX = (rand() - 0.5) * scale * 0.1;
      const noiseY = (rand() - 0.5) * scale * 0.1;
      const noiseZ = (rand() - 0.5) * scale * 0.1;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) + noiseX;
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + noiseY;
      positions[i * 3 + 2] = r * Math.cos(phi) + noiseZ;

      // Spectral classification like the galaxy shader
      const temp = rand();
      if (temp < 0.12) {
        // M-type Red giants
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.65; colors[i * 3 + 2] = 0.45;
      } else if (temp < 0.28) {
        // K-type Orange
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.65;
      } else if (temp < 0.55) {
        // G-type Yellow-white (like our sun)
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.97; colors[i * 3 + 2] = 0.92;
      } else if (temp < 0.75) {
        // F-type White
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 1;
      } else if (temp < 0.9) {
        // A-type Blue-white
        colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.93; colors[i * 3 + 2] = 1;
      } else {
        // O/B-type Hot blue
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 1;
      }

      // Varied magnitudes
      const mag = rand();
      sizes[i] = 0.08 + mag * 0.25;
      brightness[i] = 0.4 + mag * 0.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── BRIGHT PROMINENT STARS - Fewer but eye-catching ────────
  const brightStarData = useMemo(() => {
    const count = Math.floor(15 * density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = (0.1 + rand() * 0.9) * scale * 0.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Bright stars are mostly white/blue
      const temp = rand();
      if (temp < 0.3) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 0.95;
      } else if (temp < 0.6) {
        colors[i * 3] = 0.92; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 1;
      }

      sizes[i] = 0.35 + rand() * 0.5;
      brightness[i] = 0.75 + rand() * 0.25;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── DUST CLOUDS - Medium soft particles ────────────────────
  const dustData = useMemo(() => {
    const count = Math.floor(60 * density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacity = new Float32Array(count);

    // Determine cluster's dominant color
    const colorVariant = Math.floor(rand() * 5);
    const baseColors = [
      [0.95, 0.7, 0.5],   // Warm orange/gold
      [0.6, 0.75, 1.0],   // Cool blue
      [1.0, 0.6, 0.7],    // Pink HII region
      [0.7, 0.9, 0.85],   // Teal/cyan
      [0.95, 0.92, 0.85], // Cream/white
    ];
    const baseCol = baseColors[colorVariant];

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = Math.pow(rand(), 0.35) * scale * 0.6;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Vary color
      const colorShift = rand() * 0.3;
      colors[i * 3] = baseCol[0] * (0.85 + colorShift);
      colors[i * 3 + 1] = baseCol[1] * (0.85 + colorShift);
      colors[i * 3 + 2] = baseCol[2] * (0.85 + colorShift);

      sizes[i] = 1.5 + rand() * 4.5;
      opacity[i] = 0.08 + rand() * 0.18;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── FINE DUST - Ultra-fine grain texture ───────────────────
  const fineDustData = useMemo(() => {
    const count = Math.floor(100 * density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacity = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = rand() * scale * 0.65;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Subtle warm/cool tint
      const tint = rand();
      if (tint < 0.5) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.88;
      } else {
        colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.92; colors[i * 3 + 2] = 1;
      }

      sizes[i] = 0.4 + rand() * 1.2;
      opacity[i] = 0.03 + rand() * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── STELLAR NURSERY - Bright pink/magenta HII regions ──────
  const nurseryData = useMemo(() => {
    const count = Math.floor(18 * density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacity = new Float32Array(count);

    // Cluster nurseries in specific regions
    const clusterCenters = [
      [(rand() - 0.5) * scale * 0.4, (rand() - 0.5) * scale * 0.4, (rand() - 0.5) * scale * 0.4],
      [(rand() - 0.5) * scale * 0.5, (rand() - 0.5) * scale * 0.5, (rand() - 0.5) * scale * 0.5],
    ];

    for (let i = 0; i < count; i++) {
      const center = clusterCenters[i % clusterCenters.length];
      const spread = scale * 0.15;

      positions[i * 3] = center[0] + (rand() - 0.5) * spread;
      positions[i * 3 + 1] = center[1] + (rand() - 0.5) * spread;
      positions[i * 3 + 2] = center[2] + (rand() - 0.5) * spread;

      // HII region pink/magenta colors
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.45 + rand() * 0.25;
      colors[i * 3 + 2] = 0.6 + rand() * 0.3;

      sizes[i] = 2 + rand() * 5;
      opacity[i] = 0.12 + rand() * 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── FILAMENTS - Wispy dust streaks ─────────────────────────
  const filamentData = useMemo(() => {
    const count = Math.floor(40 * density);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacity = new Float32Array(count);

    // Create several filament strands
    const strands = 4;
    const perStrand = Math.floor(count / strands);

    for (let s = 0; s < strands; s++) {
      // Random direction for this filament
      const dirTheta = rand() * Math.PI * 2;
      const dirPhi = Math.acos(2 * rand() - 1);
      const dir = [
        Math.sin(dirPhi) * Math.cos(dirTheta),
        Math.sin(dirPhi) * Math.sin(dirTheta),
        Math.cos(dirPhi),
      ];

      const startOffset = (rand() - 0.5) * scale * 0.3;

      for (let j = 0; j < perStrand; j++) {
        const i = s * perStrand + j;
        if (i >= count) break;

        const t = (j / perStrand - 0.5) * scale * 0.5;
        const wobble = (rand() - 0.5) * scale * 0.08;

        positions[i * 3] = dir[0] * t + startOffset + wobble;
        positions[i * 3 + 1] = dir[1] * t + wobble;
        positions[i * 3 + 2] = dir[2] * t + wobble;

        // Dark/absorption or bright emission
        const bright = rand() > 0.6;
        if (bright) {
          colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.75;
        } else {
          colors[i * 3] = 0.15; colors[i * 3 + 1] = 0.12; colors[i * 3 + 2] = 0.1;
        }

        sizes[i] = 0.6 + rand() * 1.8;
        opacity[i] = bright ? 0.08 + rand() * 0.12 : 0.15 + rand() * 0.2;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
    return geo;
  }, [scale, density, rand]);

  // ─── DEBRIS ROCKS ───────────────────────────────────────────
  const debrisData = useMemo(() => {
    const count = Math.floor(20 * density);
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const rotationSpeeds: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = (0.15 + rand() * 0.85) * scale * 0.55;

      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);

      // More varied sizes
      const sizeRoll = rand();
      let rockScale;
      if (sizeRoll < 0.7) {
        rockScale = 0.08 + rand() * 0.2; // Small
      } else if (sizeRoll < 0.9) {
        rockScale = 0.25 + rand() * 0.35; // Medium
      } else {
        rockScale = 0.5 + rand() * 0.6; // Large
      }
      dummy.scale.setScalar(rockScale);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());

      rotationSpeeds.push({
        x: (rand() - 0.5) * 0.4,
        y: (rand() - 0.5) * 0.4,
        z: (rand() - 0.5) * 0.25,
      });
    }

    return { count, matrices, rotationSpeeds };
  }, [scale, density, rand]);

  // ─── COMETS WITH TRAILS ─────────────────────────────────────
  const cometData = useMemo(() => {
    const cometCount = Math.floor(4 * density);
    const trailLength = 12;
    const totalParticles = cometCount * trailLength;

    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const trailPos = new Float32Array(totalParticles);

    const cometStates: {
      pos: [number, number, number];
      vel: [number, number, number];
      trail: [number, number, number][];
    }[] = [];

    for (let c = 0; c < cometCount; c++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = rand() * scale * 0.4;

      const pos: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ];

      const speed = 0.015 + rand() * 0.02;
      const velTheta = rand() * Math.PI * 2;
      const velPhi = Math.acos(2 * rand() - 1);
      const vel: [number, number, number] = [
        Math.sin(velPhi) * Math.cos(velTheta) * speed,
        Math.sin(velPhi) * Math.sin(velTheta) * speed,
        Math.cos(velPhi) * speed,
      ];

      const trail: [number, number, number][] = [];
      for (let t = 0; t < trailLength; t++) {
        trail.push([...pos]);
      }

      cometStates.push({ pos, vel, trail });

      // Initialize trail particles
      for (let t = 0; t < trailLength; t++) {
        const idx = c * trailLength + t;
        positions[idx * 3] = pos[0];
        positions[idx * 3 + 1] = pos[1];
        positions[idx * 3 + 2] = pos[2];

        colors[idx * 3] = 0.9;
        colors[idx * 3 + 1] = 0.95;
        colors[idx * 3 + 2] = 1;

        const tp = t / trailLength;
        trailPos[idx] = tp;
        sizes[idx] = 0.4 * (1 - tp * 0.7);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('trailPos', new THREE.BufferAttribute(trailPos, 1));

    return { geo, cometStates, cometCount, trailLength };
  }, [scale, density, rand]);

  // ─── SHADER MATERIALS ───────────────────────────────────────
  const starMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: CLUSTER_STAR_VERT,
    fragmentShader: CLUSTER_STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }), []);

  const dustMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }), []);

  const cometMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: COMET_VERT,
    fragmentShader: COMET_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  }), []);

  // ─── ANIMATION ──────────────────────────────────────────────
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotate entire cluster slowly with subtle oscillation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.012 + seed * 0.5;
      groupRef.current.rotation.x = Math.sin(t * 0.008 + seed) * 0.08;
      groupRef.current.rotation.z = Math.sin(t * 0.006 + seed * 1.5) * 0.04;
    }

    // Animate debris tumbling
    if (debrisRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < debrisData.count; i++) {
        debrisRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.rotation.x += debrisData.rotationSpeeds[i].x * 0.008;
        dummy.rotation.y += debrisData.rotationSpeeds[i].y * 0.008;
        dummy.rotation.z += debrisData.rotationSpeeds[i].z * 0.008;

        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate comet trails
    if (cometRef.current) {
      const positions = cometRef.current.geometry.attributes.position.array as Float32Array;
      const { cometStates, cometCount, trailLength } = cometData;

      for (let c = 0; c < cometCount; c++) {
        const state = cometStates[c];

        // Update head position
        state.pos[0] += state.vel[0];
        state.pos[1] += state.vel[1];
        state.pos[2] += state.vel[2];

        // Wrap around
        const dist = Math.sqrt(state.pos[0] ** 2 + state.pos[1] ** 2 + state.pos[2] ** 2);
        if (dist > scale * 0.6) {
          state.pos[0] *= -0.4;
          state.pos[1] *= -0.4;
          state.pos[2] *= -0.4;
        }

        // Shift trail
        for (let i = trailLength - 1; i > 0; i--) {
          state.trail[i] = [...state.trail[i - 1]];
        }
        state.trail[0] = [...state.pos];

        // Update geometry
        for (let t = 0; t < trailLength; t++) {
          const idx = c * trailLength + t;
          positions[idx * 3] = state.trail[t][0];
          positions[idx * 3 + 1] = state.trail[t][1];
          positions[idx * 3 + 2] = state.trail[t][2];
        }
      }
      cometRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Twinkle stars
    if (starsRef.current) {
      const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;
      const brightness = starsRef.current.geometry.attributes.brightness.array as Float32Array;
      for (let i = 0; i < sizes.length; i++) {
        const baseSize = 0.08 + brightness[i] * 0.25;
        sizes[i] = baseSize * (0.85 + 0.15 * Math.sin(t * (2.5 + (seed + i) % 10 * 0.3) + i * 0.3));
      }
      starsRef.current.geometry.attributes.size.needsUpdate = true;
    }

    // Twinkle bright stars with more variation
    if (brightStarsRef.current) {
      const sizes = brightStarsRef.current.geometry.attributes.size.array as Float32Array;
      const brightness = brightStarsRef.current.geometry.attributes.brightness.array as Float32Array;
      for (let i = 0; i < sizes.length; i++) {
        const baseSize = 0.35 + brightness[i] * 0.5;
        sizes[i] = baseSize * (0.8 + 0.2 * Math.sin(t * (1.8 + (seed + i) % 8 * 0.4) + i * 0.7));
      }
      brightStarsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Fine dust - ultra-fine grain texture */}
      <points ref={fineDustRef} geometry={fineDustData} material={dustMaterial} />

      {/* Dust clouds - soft colored nebulosity */}
      <points ref={dustRef} geometry={dustData} material={dustMaterial} />

      {/* Filaments - wispy dust streaks */}
      <points ref={filamentRef} geometry={filamentData} material={dustMaterial} />

      {/* Stellar nursery - bright pink HII regions */}
      <points ref={nurseryRef} geometry={nurseryData} material={dustMaterial} />

      {/* Dense star field - many sharp pinpoints */}
      <points ref={starsRef} geometry={starData} material={starMaterial} />

      {/* Bright prominent stars - with diffraction spikes */}
      <points ref={brightStarsRef} geometry={brightStarData} material={starMaterial} />

      {/* Debris rocks - varied sizes */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, debrisData.count]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#706050"
          roughness={0.85}
          metalness={0.15}
          emissive="#201510"
          emissiveIntensity={0.15}
        />
      </instancedMesh>

      {/* Comets with trails */}
      <points ref={cometRef} geometry={cometData.geo} material={cometMaterial} />
    </group>
  );
}


// Seeded random for consistent generation
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// 3D Space clusters dispersed spherically 360° around the universe
function MilkyWayBands() {
  const clusters = useMemo(() => {
    const result: Array<{
      position: [number, number, number];
      scale: number;
      density: number;
      seed: number;
    }> = [];

    const rand = seededRandom(42);

    // Generate clusters distributed in full 3D sphere
    const totalClusters = 40;

    for (let i = 0; i < totalClusters; i++) {
      // Golden spiral for even spherical coverage
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / totalClusters);

      // Add randomness
      const thetaRand = theta + (rand() - 0.5) * 0.6;
      const phiRand = phi + (rand() - 0.5) * 0.4;

      // Distance varies
      const distMin = 45;
      const distMax = 120;
      const distance = distMin + rand() * (distMax - distMin);

      // Spherical to cartesian
      const x = Math.sin(phiRand) * Math.cos(thetaRand) * distance;
      const y = Math.cos(phiRand) * distance;
      const z = Math.sin(phiRand) * Math.sin(thetaRand) * distance;

      // Varied sizes
      const sizeRoll = rand();
      let scale: number;
      let density: number;

      if (sizeRoll < 0.15) {
        scale = 40 + rand() * 30; // Large clusters
        density = 1.2 + rand() * 0.5;
      } else if (sizeRoll < 0.45) {
        scale = 20 + rand() * 20; // Medium
        density = 0.8 + rand() * 0.4;
      } else {
        scale = 8 + rand() * 15; // Small
        density = 0.5 + rand() * 0.4;
      }

      result.push({
        position: [x, y, z] as [number, number, number],
        scale,
        density,
        seed: i * 137 + 17,
      });
    }

    // Add depth layers
    const depthLayers = [
      { dist: 30, count: 3, scaleRange: [5, 12], densityRange: [0.3, 0.6] },
      { dist: 60, count: 4, scaleRange: [15, 30], densityRange: [0.6, 1.0] },
      { dist: 100, count: 3, scaleRange: [35, 55], densityRange: [0.8, 1.3] },
    ];

    depthLayers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const theta = rand() * Math.PI * 2;
        const phi = (rand() - 0.5) * Math.PI;

        const dist = layer.dist + (rand() - 0.5) * 15;
        const x = Math.sin(phi + Math.PI / 2) * Math.cos(theta) * dist;
        const y = Math.cos(phi + Math.PI / 2) * dist;
        const z = Math.sin(phi + Math.PI / 2) * Math.sin(theta) * dist;

        const scale = layer.scaleRange[0] + rand() * (layer.scaleRange[1] - layer.scaleRange[0]);
        const density = layer.densityRange[0] + rand() * (layer.densityRange[1] - layer.densityRange[0]);

        result.push({
          position: [x, y, z] as [number, number, number],
          scale,
          density,
          seed: result.length * 137 + 500,
        });
      }
    });

    return result;
  }, []);

  return (
    <>
      {clusters.map((cluster, i) => (
        <SpaceCluster
          key={i}
          position={cluster.position}
          scale={cluster.scale}
          density={cluster.density}
          seed={cluster.seed}
        />
      ))}
    </>
  );
}

// ─── Ambient Nebula ─────────────────────────────────────

function Nebula() {
  const glowMap = useMemo(() => makeGlowMap(), []);

  const nebulae = useMemo(() => [
    { pos: [18, 8, -25] as [number, number, number], color: "#1a9a8a", scale: 22, opacity: 0.015 },
    { pos: [-20, -5, -30] as [number, number, number], color: "#643cc8", scale: 28, opacity: 0.012 },
    { pos: [5, 15, -40] as [number, number, number], color: "#2266aa", scale: 20, opacity: 0.01 },
  ], []);

  return (
    <>
      {nebulae.map((n, i) => (
        <sprite key={i} position={n.pos} scale={[n.scale, n.scale, 1]}>
          <spriteMaterial
            map={glowMap}
            color={n.color}
            transparent
            opacity={n.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </>
  );
}

// ─── Warp Streaks (camera travel effect) ────────────────

function WarpStreaks({ active }: { active: boolean }) {
  const count = 35;
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -Math.random() * 20;
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (!active) return;
    // Follow camera
    ref.current.position.copy(camera.position);
    ref.current.rotation.copy(camera.rotation);
    // Animate streaks forward
    const positions = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 2] += 0.8;
      if (positions[i * 3 + 2] > 5) {
        positions[i * 3 + 2] = -20;
        positions[i * 3] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo} visible={false}>
      <pointsMaterial
        size={0.03}
        color="#99ddff"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Momentum Orbit Controls ────────────────────────────
// Continues spinning in the direction of user's last swipe

interface MomentumOrbitControlsProps {
  enabled: boolean;
  travelTarget: string | null;
}

function MomentumOrbitControls({ enabled, travelTarget }: MomentumOrbitControlsProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const velocity = useRef({ x: 0.0003, y: 0 }); // Angular velocity - starts with gentle auto-spin
  const friction = 0.98; // Momentum decay per frame
  const sensitivity = 0.0003; // How much swipe affects rotation speed
  const minPolar = Math.PI * 0.12;
  const maxPolar = Math.PI * 0.82;
  const defaultSpin = 0.0003; // Default gentle auto-rotation speed
  const minSpeed = 0.0002; // Below this, snap back to default spin

  useFrame(() => {
    if (!controlsRef.current || travelTarget || isDragging.current) return;

    // Get current spherical coordinates
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);

    // Check if momentum has died down
    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);

    if (speed < minSpeed) {
      // Momentum died down - restore gentle auto-spin
      velocity.current.x = defaultSpin;
      velocity.current.y = 0;
    }

    // Apply angular velocity
    spherical.theta += velocity.current.x;
    spherical.phi += velocity.current.y;

    // Clamp polar angle to stay within bounds
    spherical.phi = Math.max(minPolar, Math.min(maxPolar, spherical.phi));

    // Update camera position
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);

    // Apply friction to slow down (only for velocities above default)
    if (speed > defaultSpin * 1.5) {
      velocity.current.x *= friction;
      velocity.current.y *= friction;
    }

    // Update controls to sync with new camera position
    controlsRef.current.update();
  });

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = performance.now();
      // Don't reset velocity - let user "catch" the spinning camera
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const now = performance.now();
      const dt = now - lastTime.current;

      if (dt > 0) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        // Track velocity in both directions with smoothing
        velocity.current.x = velocity.current.x * 0.5 + (dx / dt) * sensitivity * 0.5;
        velocity.current.y = velocity.current.y * 0.5 + (dy / dt) * sensitivity * 0.5;
      }

      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    };

    const onPointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      // Momentum continues from current velocity - no changes needed
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={enabled}
      enableDamping
      dampingFactor={0.05}
      enableZoom={false}
      maxPolarAngle={maxPolar}
      minPolarAngle={minPolar}
      autoRotate={false}
      enablePan={false}
    />
  );
}

// ─── Camera Controller ──────────────────────────────────

function CameraController({
  travelTarget,
  onArrive,
}: {
  travelTarget: string | null;
  onArrive: () => void;
}) {
  const { camera } = useThree();
  const phase = useRef<"toOrigin" | "alongPath">("toOrigin"); // Two-phase animation
  const progress = useRef(0);
  const arrived = useRef(false);
  const initialPos = useRef<THREE.Vector3 | null>(null); // Camera starting position
  const travelCurve = useRef<THREE.QuadraticBezierCurve3 | null>(null);
  const destPos = useRef<THREE.Vector3 | null>(null);

  useFrame(() => {
    if (!travelTarget) {
      phase.current = "toOrigin";
      progress.current = 0;
      arrived.current = false;
      initialPos.current = null;
      travelCurve.current = null;
      destPos.current = null;
      return;
    }

    if (arrived.current) return;

    const worldPos = travelTarget === "blog"
      ? BOOK_POSITION
      : WORLDS.find((w) => w.id === travelTarget)?.position;
    if (!worldPos) return;

    // Store initial camera position and destination on first frame
    if (!initialPos.current) {
      initialPos.current = camera.position.clone();
      destPos.current = new THREE.Vector3(...worldPos);
    }

    // Create the golden path curve (from ORIGIN to target)
    if (!travelCurve.current) {
      const start = new THREE.Vector3(...ORIGIN);
      const end = new THREE.Vector3(...worldPos);

      // Same curve formula as GoldenPath
      const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
      mid.y += Math.max(1.2, start.distanceTo(end) * 0.1);

      travelCurve.current = new THREE.QuadraticBezierCurve3(start, mid, end);
    }

    // Speed calculation (same for both phases) — ~1.5s total
    const p = progress.current;
    let speed: number;
    if (p < 0.2) {
      speed = 0.008 + easeOutCubic(p / 0.2) * 0.012;
    } else if (p < 0.8) {
      speed = 0.02;
    } else {
      speed = 0.02 * (1 - easeOutCubic((p - 0.8) / 0.2) * 0.7);
    }
    progress.current = Math.min(progress.current + speed, 1);

    const ease = easeInOutCubic(progress.current);
    const fovBase = 45;

    if (phase.current === "toOrigin") {
      // Phase 1: Travel from current position to ORIGIN (start of golden path)
      const originVec = new THREE.Vector3(...ORIGIN);

      // Curved path from initial position to origin
      const mid = new THREE.Vector3().lerpVectors(initialPos.current!, originVec, 0.5);
      mid.y += 2.0; // Arc up above the scene

      const curveToOrigin = new THREE.QuadraticBezierCurve3(
        initialPos.current!,
        mid,
        originVec
      );

      const pos = curveToOrigin.getPoint(ease);
      camera.position.set(pos.x, pos.y + 0.5, pos.z);

      // Look towards the origin, then gradually towards destination
      const lookTarget = new THREE.Vector3().lerpVectors(originVec, destPos.current!, ease * 0.3);
      camera.lookAt(lookTarget);

      // Subtle FOV change during approach
      const fovOffset = Math.sin(ease * Math.PI) * 5;
      (camera as THREE.PerspectiveCamera).fov = fovBase + fovOffset;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

      // Transition to phase 2 when we reach origin
      if (progress.current >= 1) {
        phase.current = "alongPath";
        progress.current = 0;
      }
    } else {
      // Phase 2: Travel along the golden path to target
      // Stop at 55% of the path so the planet is visible in front
      const stopPoint = 0.55;
      const pathProgress = ease * stopPoint;

      // Position camera slightly above the golden path
      const pathPos = travelCurve.current!.getPoint(pathProgress);
      camera.position.set(pathPos.x, pathPos.y + 1.0, pathPos.z);

      // Look at the destination (planet/book)
      camera.lookAt(destPos.current!);

      // FOV zoom effect
      let fovOffset = 0;
      if (p > 0.1 && p < 0.85) {
        const fp = (p - 0.1) / 0.75;
        fovOffset = Math.sin(fp * Math.PI) * 10;
      }
      (camera as THREE.PerspectiveCamera).fov = fovBase + fovOffset;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

      if (progress.current >= 1) {
        arrived.current = true;
        (camera as THREE.PerspectiveCamera).fov = fovBase;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        onArrive();
      }
    }
  });

  return null;
}

// ─── Scene ──────────────────────────────────────────────

// ─── Marks intro as seen after animations complete ───────
function IntroMarker() {
  const markedRef = useRef(false);
  // The last animation is the book: delay = 0.8 + WORLDS.length * 0.6 + 1.0 * 0.85 + 1.8 ≈ 5.45s
  const markTime = 0.8 + WORLDS.length * 0.6 + 1.0 + 1.8 + 0.5; // generous buffer

  useFrame(({ clock }) => {
    if (markedRef.current) return;
    if (clock.getElapsedTime() > markTime) {
      markedRef.current = true;
      try { localStorage.setItem("jbn_intro_seen", "1"); } catch {}
    }
  });

  return null;
}

/** Adjusts camera FOV based on viewport aspect ratio so planets always fit */
function ResponsiveFov({ baseFov = 45 }: { baseFov?: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    // Widen FOV on narrow/portrait screens, narrow it on ultra-wide
    const fov = aspect < 1 ? baseFov + 25 : aspect < 1.4 ? baseFov + 10 : baseFov;
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, size, baseFov]);
  return null;
}

/** Reset camera to default position on mount — fixes stale camera after browser back */
function CameraReset() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 12, 22);
    camera.lookAt(0, 0, 0);
    (camera as THREE.PerspectiveCamera).fov = 45;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera]);
  return null;
}

function Scene({ theme = "dark", skipIntro = false }: { theme?: "dark" | "light"; skipIntro?: boolean }) {
  const [travelTarget, setTravelTarget] = useState<string | null>(null);
  const handleSelect = (id: string) => {
    if (!travelTarget) setTravelTarget(id);
  };

  const handleArrive = () => {
    if (travelTarget === "blog") {
      window.location.href = "/community";
    } else if (travelTarget === "cannabis") {
      window.location.href = "/cannabis";
    } else if (travelTarget === "psychedelics") {
      window.location.href = "/psychedelics";
    } else {
      window.location.href = `/explore?category=${travelTarget}`;
    }
  };

  return (
    <IntroContext.Provider value={{ skipIntro }}>
      {/* Reset camera on mount — fixes stale position after browser back */}
      <CameraReset />
      {/* Responsive FOV — widen on narrow screens so planets fit */}
      <ResponsiveFov baseFov={45} />

      {/* Background - always dark mode appearance */}
      <color attach="background" args={["#020202"]} />
      <fog attach="fog" args={["#020202", 40, 120]} />

      {/* Lighting — cinematic three-point setup (dark mode) */}
      <ambientLight intensity={0.12} color="#8899bb" />
      {/* Key light — warm, strong, from upper-left */}
      <directionalLight
        position={[-10, 8, 10]}
        intensity={2.0}
        color="#fff4e0"
      />
      {/* Fill light — cool, softer, from opposite side */}
      <directionalLight
        position={[8, -2, -8]}
        intensity={0.3}
        color="#4466aa"
      />
      {/* Rim/backlight — edge definition, from behind */}
      <directionalLight
        position={[0, 4, -14]}
        intensity={0.6}
        color="#3355aa"
      />
      {/* Point light at origin (sun) for local illumination */}
      <pointLight position={[0, 0, 0]} intensity={2.0} color="#ffc830" distance={25} decay={2} />

      {/* Starfield */}
      <Stars
        radius={120}
        depth={70}
        count={500}
        factor={2}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Cinematic spiral galaxy in distant background */}
      <Galaxy3D />

      {/* Milky Way nebula bands - scattered cosmic clouds */}
      <MilkyWayBands />

      {/* Distant mini galaxies - reddish scattered around universe */}
      <DistantGalaxies />

      {/* Ambient nebula clouds */}
      <Nebula />

      {/* Shooting stars — occasional streaks */}
      <ShootingStars />

      {/* Mark intro as seen once animation completes */}
      {!skipIntro && <IntroMarker />}

      {/* Central Hub — appears with supernova */}
      <SunNova>
        <CentralHub />
      </SunNova>

      {/* Paths grow from sun, then planets appear with novas */}
      {WORLDS.map((w, i) => {
        const pathDelay = 0.8 + i * 0.6;   // paths start growing after sun appears
        const pathDuration = 1.0;            // how long each path takes to grow
        const planetDelay = pathDelay + pathDuration * 0.85; // planet appears near end of path growth
        return (
          <Fragment key={w.id}>
            <OrbitPath target={w.position} color={w.glowColor} />
            <GoldenPath start={ORIGIN} end={w.position} delay={pathDelay} growDuration={pathDuration} />
            <EnergyPulse start={ORIGIN} end={w.position} color={w.glowColor} interval={3 + i * 1.5} travelTime={2} />
            <NovaSpawn
              delay={planetDelay}
              color={w.glowColor}
              position={w.position}
            >
              <PlanetNode world={{ ...w, position: [0, 0, 0] }} onSelect={handleSelect} />
            </NovaSpawn>
          </Fragment>
        );
      })}

      {/* Floating Book — path grows last, then book appears */}
      {(() => {
        const bookPathDelay = 0.8 + WORLDS.length * 0.6;
        const bookPathDuration = 1.0;
        const bookDelay = bookPathDelay + bookPathDuration * 0.85;
        return (
          <>
            <GoldenPath start={ORIGIN} end={BOOK_POSITION} delay={bookPathDelay} growDuration={bookPathDuration} />
            <EnergyPulse start={ORIGIN} end={BOOK_POSITION} color="#d4a72d" interval={5} travelTime={2.5} />
            <NovaSpawn
              delay={bookDelay}
              color="#d4a72d"
              position={BOOK_POSITION}
            >
              <FloatingBook onSelect={handleSelect} />
            </NovaSpawn>
          </>
        );
      })()}

      {/* Warp streaks during camera travel */}
      <WarpStreaks active={!!travelTarget} />

      {/* Camera travel (only active when travelTarget set) */}
      {travelTarget && (
        <CameraController
          travelTarget={travelTarget}
          onArrive={handleArrive}
        />
      )}

      <MomentumOrbitControls
        enabled={!travelTarget}
        travelTarget={travelTarget}
      />

    </IntroContext.Provider>
  );
}

// ─── Sun Screen Position Tracker ────────────────────────

function SunProjector({
  sunPosRef,
  containerRef,
}: {
  sunPosRef: { current: { x: number; y: number } };
  containerRef: { current: HTMLDivElement | null };
}) {
  const { camera, size } = useThree();

  useFrame(() => {
    const v = new THREE.Vector3(0, 0, 0).project(camera);
    const canvasX = (v.x * 0.5 + 0.5) * size.width;
    const canvasY = (-v.y * 0.5 + 0.5) * size.height;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      sunPosRef.current.x = rect.left + canvasX;
      sunPosRef.current.y = rect.top + canvasY;
    }
  });

  return null;
}

// ─── Main Component ─────────────────────────────────────

export function UniverseCanvas({
  theme = "dark",
  sunPosRef,
  skipIntro = false,
}: {
  theme?: "dark" | "light";
  sunPosRef?: { current: { x: number; y: number } };
  skipIntro?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100vh", background: "#020202" }}>
      <Canvas
        camera={{ position: [0, 12, 22], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ cursor: "auto" }}
      >
        <Suspense fallback={null}>
          <Scene theme={theme} skipIntro={skipIntro} />
          {sunPosRef && (
            <SunProjector sunPosRef={sunPosRef} containerRef={containerRef} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
