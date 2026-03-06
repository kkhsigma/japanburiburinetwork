"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { progress, easeOut, clamp } from "@/animations/useCosmicTransition";

const PARTICLE_COUNT = 400;

interface ParticleData {
  radius: number;
  angle: number;
  y: number;
  speed: number;
}

export function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  const particleMatRef = useRef<THREE.ShaderMaterial>(null);

  // Singularity collapse particles
  const particleData = useRef<ParticleData[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      radius: 2.5 + Math.random() * 7,
      angle: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 4,
      speed: 0.8 + Math.random() * 2.5,
    }))
  );

  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) sz[i] = 0.5 + Math.random() * 1.5;
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.Float32BufferAttribute(sz, 1));
    return geo;
  }, []);

  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#1a9a8a") },
      uIntensity: { value: 0 },
    }),
    []
  );

  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const singP = progress(t, "singularity");
    const accP = progress(t, "accretion");
    const combined = clamp(singP * 0.5 + accP * 0.5);

    // Event horizon scale
    if (groupRef.current) {
      const s = easeOut(combined) * 0.55;
      groupRef.current.scale.setScalar(s);
    }

    // Glow intensity
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uIntensity.value = easeOut(combined) * 1.8;
    }

    // Update collapse particles
    if (particleMatRef.current) {
      const pAlpha = singP > 0 && singP < 1 ? Math.sin(singP * Math.PI) : 0;
      particleMatRef.current.uniforms.uTime.value = t;
      particleMatRef.current.uniforms.uOpacity.value = pAlpha;
    }

    if (singP > 0) {
      const positions = particleGeo.attributes.position.array as Float32Array;
      const data = particleData.current;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const d = data[i];
        const r = d.radius * (1 - easeOut(clamp(singP * 1.3)));
        const a = d.angle + t * d.speed + singP * 8;
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = d.y * (1 - singP * 0.9);
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Event horizon + glow */}
      <group ref={groupRef}>
        {/* Dark sphere */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Fresnel glow shell */}
        <mesh>
          <sphereGeometry args={[1.35, 32, 32]} />
          <shaderMaterial
            ref={glowMatRef}
            transparent
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={glowUniforms}
            vertexShader={GLOW_VERT}
            fragmentShader={GLOW_FRAG}
          />
        </mesh>

        {/* Photon ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.08, 0.03, 16, 64]} />
          <meshBasicMaterial
            color="#88ffee"
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Singularity collapse particles */}
      <points geometry={particleGeo}>
        <shaderMaterial
          ref={particleMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={particleUniforms}
          vertexShader={PARTICLE_VERT}
          fragmentShader={PARTICLE_FRAG}
        />
      </points>
    </>
  );
}

const GLOW_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 4.0);
    vec3 col = uColor * uIntensity;
    gl_FragColor = vec4(col, fresnel * 0.8);
  }
`;

const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vAlpha = 1.0;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (120.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(0.4, 0.95, 0.85, glow * uOpacity * vAlpha);
  }
`;
