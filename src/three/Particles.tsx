import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertex, particleFragment } from './shaders';
import { pointer } from '../lib/signals';
import type { ScenePalette } from '../lib/palette';
import type { PerfTier } from '../lib/perf';

interface ParticlesProps {
  palette: ScenePalette;
  tier: PerfTier;
  reduceMotion: boolean;
}

/** Soft drifting particle field that fills the depth behind the blob. */
export function Particles({ palette, tier, reduceMotion }: ParticlesProps) {
  const points = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const count = tier === 'high' ? 2600 : 900;

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const seed = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9 - 2;
      scale[i] = Math.random() * 0.8 + 0.2;
      seed[i * 3 + 0] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(palette.particle) },
      uOpacity: { value: palette.particleOpacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(palette.particle);
    uniforms.uOpacity.value = palette.particleOpacity;
    if (matRef.current) {
      matRef.current.blending = palette.additiveParticles
        ? THREE.AdditiveBlending
        : THREE.NormalBlending;
      matRef.current.needsUpdate = true;
    }
  }, [palette, uniforms]);

  const smooth = useRef(new THREE.Vector2());
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += reduceMotion ? 0 : dt;
    smooth.current.x += (pointer.nx - smooth.current.x) * Math.min(1, dt * 2);
    smooth.current.y += (pointer.ny - smooth.current.y) * Math.min(1, dt * 2);
    uniforms.uPointer.value.set(smooth.current.x, smooth.current.y);
    if (points.current && !reduceMotion) points.current.rotation.y += dt * 0.01;
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={
          palette.additiveParticles ? THREE.AdditiveBlending : THREE.NormalBlending
        }
      />
    </points>
  );
}
