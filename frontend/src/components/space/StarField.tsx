"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { progress, easeOut } from "@/animations/useCosmicTransition";

const COUNT = 6000;

export function StarField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);
    const rnd = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 160;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = 0.3 + Math.random() * 1.5;
      rnd[i] = Math.random() * 6.283;
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sz, 1));
    geo.setAttribute("aRandom", new THREE.Float32BufferAttribute(rnd, 1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.getElapsedTime();
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uOpacity.value = easeOut(progress(t, "void"));
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
      />
    </points>
  );
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aRandom;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    float twinkle = sin(uTime * 1.2 + aRandom * 6.28) * 0.35 + 0.65;
    vAlpha = twinkle;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (180.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = smoothstep(0.15, 0.0, d);
    float glow = smoothstep(0.5, 0.05, d);
    float alpha = (glow * 0.35 + core * 0.65) * vAlpha * uOpacity;
    vec3 color = mix(vec3(0.7, 0.8, 1.0), vec3(1.0), core);
    gl_FragColor = vec4(color, alpha);
  }
`;
