"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { progress, easeOut } from "@/animations/useCosmicTransition";

export function AccretionDisk() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

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
    matRef.current.uniforms.uOpacity.value = easeOut(progress(t, "accretion"));
  });

  return (
    <mesh rotation={[-1.25, 0, 0]}>
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
      />
    </mesh>
  );
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float angle = atan(center.y, center.x);

    // Ring mask
    float inner = 0.085;
    float outer = 0.46;
    float ring = smoothstep(inner, inner + 0.025, dist) *
                 smoothstep(outer, outer - 0.06, dist);
    if (ring < 0.001) discard;

    // Spiral turbulence
    float spiral = angle / 6.283 + dist * 3.5 - uTime * 0.35;
    float turb = fbm(vec2(spiral * 7.0, dist * 14.0));
    turb *= fbm(vec2(spiral * 3.0 + uTime * 0.15, dist * 9.0 - uTime * 0.08));

    // Heat gradient (hotter toward center)
    float heat = 1.0 - smoothstep(inner, outer, dist);

    // Color palette
    vec3 coolCol = vec3(0.04, 0.12, 0.32);
    vec3 warmCol = vec3(0.1, 0.6, 0.55);
    vec3 hotCol  = vec3(1.0, 0.96, 0.92);

    vec3 color = mix(coolCol, warmCol, heat * 0.7);
    color = mix(color, hotCol, pow(heat, 4.0));
    color *= 0.5 + turb * 1.3;

    // Boost emissive for bloom (>1.0 values trigger bloom)
    color *= 2.2;

    float alpha = ring * uOpacity * (0.35 + turb * 0.65);
    gl_FragColor = vec4(color, alpha);
  }
`;
