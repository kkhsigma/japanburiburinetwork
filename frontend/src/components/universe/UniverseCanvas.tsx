"use client";

import { useRef, useMemo, useState, useEffect, createContext, useContext, Fragment, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
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
    label: "カンナビス",
    sublabel: "カンナビス規制",
    position: [-9, 0.5, 3],
    radius: 1.4,
    glowColor: "#22c55e",
    hasRings: false,
    bobPhase: 0,
  },
  {
    id: "psychedelics",
    label: "サイケデリクス",
    sublabel: "サイケデリクス規制",
    position: [7, 2.8, -5],
    radius: 1.3,
    glowColor: "#a855f7",
    hasRings: true,
    bobPhase: 2.1,
  },
  {
    id: "others",
    label: "その他の物質",
    sublabel: "その他の規制物質",
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

      <Html
        position={[0, -world.radius - 0.9, 0]}
        center
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: hovered
                ? "rgba(255,255,255,0.97)"
                : "rgba(232,236,241,0.85)",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textShadow: hovered
                ? `0 0 20px ${world.glowColor}60, 0 0 40px ${world.glowColor}25, 0 2px 8px rgba(0,0,0,0.8)`
                : "0 0 12px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)",
              transition: "all 0.3s ease",
            }}
          >
            {world.label}
          </div>
          <div
            style={{
              color: hovered ? "rgba(232,236,241,0.5)" : "rgba(232,236,241,0.3)",
              fontSize: "10px",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.08em",
              textShadow: "0 0 8px rgba(0,0,0,0.8)",
              transition: "color 0.3s ease",
            }}
          >
            {world.sublabel}
          </div>

          {/* Hover preview card — real data */}
          {(() => {
            const stats = getPlanetStats(world.id);
            return (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(6,9,15,0.9)",
                  border: `1px solid ${world.glowColor}30`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 15px ${world.glowColor}15`,
                  backdropFilter: "blur(8px)",
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? "translateY(0) scale(1)" : "translateY(-4px) scale(0.95)",
                  transition: "all 0.3s ease",
                  pointerEvents: "none",
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
                    {stats.total} 物質
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
                  クリックで詳細
                </div>
              </div>
            );
          })()}
        </div>
      </Html>
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
  const count = 16;
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
  const dustCount = 30;
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
  const rayCount = 16;
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
      vec3 brightColor = uColor * (1.5 + glow * 2.5); // Much brighter
      gl_FragColor = vec4(brightColor, vAlpha * uOpacity);
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
      uColor: { value: new THREE.Color(1.2, 0.95, 0.6) }, // bright warm golden
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
  }, [rayUniforms]);

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
          // Start from random position around the book
          const angle = Math.random() * Math.PI * 2;
          const dist = 4.0 + Math.random() * 2.5;
          const yOff = (Math.random() - 0.5) * 2.5;
          ray.startPos.set(
            Math.cos(angle) * dist,
            yOff,
            Math.sin(angle) * dist
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

            // Brighter glow, fade in/out
            const fadeIn = Math.min(1, ray.progress * 5);
            const fadeOut = 1 - Math.pow(ray.progress, 2.5);
            rayUniforms[i].uOpacity.value = fadeIn * fadeOut * openAmount.current * 1.2;
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

      {/* Wormhole portal - on the front page of the book */}
      <mesh
        ref={wormholeRef}
        position={[0.15, 0, bookD / 2 + 0.05]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[bookW * 0.85, bookH * 0.88]} />
        <primitive object={wormholeMaterial} attach="material" />
      </mesh>

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

      {/* Label */}
      <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            color: hovered ? "rgba(255,255,255,0.95)" : "rgba(232,236,241,0.8)",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "system-ui, -apple-system, sans-serif",
            textShadow: "0 0 12px rgba(0,0,0,0.8)",
            transition: "color 0.2s",
          }}>
            コミュニティ
          </div>
          <div style={{
            color: "rgba(232,236,241,0.35)",
            fontSize: "10px",
            fontFamily: "ui-monospace, monospace",
            textShadow: "0 0 8px rgba(0,0,0,0.8)",
          }}>
            ブログ & 交流
          </div>
        </div>
      </Html>
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

      {/* Label */}
      <Html
        position={[0, -1.4, 0]}
        center
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "rgba(255,240,200,0.9)",
              fontSize: "16px",
              fontWeight: "bold",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textShadow: "0 0 20px rgba(255,200,50,0.5), 0 0 40px rgba(255,180,30,0.2)",
            }}
          >
            JBN
          </div>
          <div
            style={{
              color: "rgba(255,240,200,0.4)",
              fontSize: "9px",
              fontFamily: "ui-monospace, monospace",
              textShadow: "0 0 8px rgba(255,200,50,0.2)",
            }}
          >
            セントラルハブ
          </div>
        </div>
      </Html>
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
  const count = 60;
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

// ─── Camera Controller ──────────────────────────────────

function CameraController({
  travelTarget,
  onArrive,
}: {
  travelTarget: string | null;
  onArrive: () => void;
}) {
  const { camera } = useThree();
  const startPos = useRef<THREE.Vector3 | null>(null);
  const progress = useRef(0);
  const arrived = useRef(false);
  const phase = useRef<"accelerate" | "cruise" | "decelerate">("accelerate");

  useFrame(() => {
    if (!travelTarget) {
      startPos.current = null;
      progress.current = 0;
      arrived.current = false;
      phase.current = "accelerate";
      return;
    }

    if (arrived.current) return;

    if (!startPos.current) {
      startPos.current = camera.position.clone();
    }

    const worldPos = travelTarget === "blog"
      ? BOOK_POSITION
      : WORLDS.find((w) => w.id === travelTarget)?.position;
    if (!worldPos) return;

    // Three-phase speed: slow start → fast cruise → slow approach
    const p = progress.current;
    let speed: number;
    if (p < 0.15) {
      speed = 0.004 + easeOutCubic(p / 0.15) * 0.016; // accelerate
      phase.current = "accelerate";
    } else if (p < 0.7) {
      speed = 0.02; // cruise
      phase.current = "cruise";
    } else {
      speed = 0.02 * (1 - easeOutCubic((p - 0.7) / 0.3) * 0.85); // decelerate
      phase.current = "decelerate";
    }
    progress.current = Math.min(progress.current + speed, 1);
    const ease = easeInOutCubic(progress.current);

    const dest = new THREE.Vector3(...worldPos);
    let offset: THREE.Vector3;

    if (travelTarget === "blog") {
      // Book: position camera in front (towards origin), not behind
      offset = dest.clone().normalize().multiplyScalar(-3.5);
      offset.y += 1.0;
    } else {
      // Planets: position camera on the outside
      offset = dest.clone().normalize().multiplyScalar(3.5);
      offset.y += 1.5;
    }
    const target = dest.clone().add(offset);

    camera.position.lerpVectors(startPos.current, target, ease);

    // FOV zoom effect — widen during cruise, narrow on approach
    const fovBase = 45;
    let fovOffset = 0;
    if (p > 0.1 && p < 0.75) {
      const fp = (p - 0.1) / 0.65;
      fovOffset = Math.sin(fp * Math.PI) * 15; // widen up to +15 degrees
    }
    (camera as THREE.PerspectiveCamera).fov = fovBase + fovOffset;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const look = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(0, 0, 0),
      dest,
      Math.min(ease * 1.3, 1) // look ahead faster than movement
    );
    camera.lookAt(look);

    if (progress.current >= 1) {
      arrived.current = true;
      // Reset FOV
      (camera as THREE.PerspectiveCamera).fov = fovBase;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      onArrive();
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
  const isLight = theme === "light";

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

      {/* Dynamic background */}
      <color attach="background" args={[isLight ? "#1a1a1a" : "#020202"]} />
      <fog attach="fog" args={[isLight ? "#1a1a1a" : "#020202", isLight ? 50 : 40, 120]} />

      {/* Lighting — cinematic three-point setup */}
      <ambientLight intensity={isLight ? 0.5 : 0.12} color={isLight ? "#aabbdd" : "#8899bb"} />
      {/* Key light — warm, strong, from upper-left */}
      <directionalLight
        position={[-10, 8, 10]}
        intensity={isLight ? 2.4 : 2.0}
        color="#fff4e0"
      />
      {/* Fill light — cool, softer, from opposite side */}
      <directionalLight
        position={[8, -2, -8]}
        intensity={isLight ? 0.5 : 0.3}
        color={isLight ? "#8899cc" : "#4466aa"}
      />
      {/* Rim/backlight — edge definition, from behind */}
      <directionalLight
        position={[0, 4, -14]}
        intensity={isLight ? 0.8 : 0.6}
        color={isLight ? "#aaccff" : "#3355aa"}
      />
      {isLight && (
        <directionalLight
          position={[0, 10, -5]}
          intensity={0.6}
          color="#ccbbff"
        />
      )}
      {/* Point light at origin (sun) for local illumination */}
      <pointLight position={[0, 0, 0]} intensity={isLight ? 1.5 : 2.0} color="#ffc830" distance={25} decay={2} />

      {/* Starfield */}
      <Stars
        radius={120}
        depth={70}
        count={isLight ? 1000 : 2000}
        factor={isLight ? 3 : 4}
        saturation={isLight ? 0.3 : 0}
        fade
        speed={isLight ? 0.6 : 0.4}
      />

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

      <OrbitControls
        makeDefault
        enabled={!travelTarget}
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
        maxPolarAngle={Math.PI * 0.82}
        minPolarAngle={Math.PI * 0.12}
        autoRotate={!travelTarget}
        autoRotateSpeed={0.12}
        enablePan={false}
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
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100vh", background: theme === "light" ? "#1a1a1a" : "#020202", transition: "background 0.7s ease" }}>
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
