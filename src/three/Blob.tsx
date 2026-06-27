import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { blobVertex, blobFragment } from './shaders';
import { pointer } from '../lib/signals';
import type { ScenePalette } from '../lib/palette';
import type { PerfTier } from '../lib/perf';

interface BlobProps {
  palette: ScenePalette;
  tier: PerfTier;
  reduceMotion: boolean;
}

/** Shader-displaced icosphere — the interactive hero centerpiece. */
export function Blob({ palette, tier, reduceMotion }: BlobProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(1.15, tier === 'high' ? 24 : 8),
    [tier],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.32 },
      uFreq: { value: 0.95 },
      uEnergy: { value: 0 },
      uColorA: { value: new THREE.Color(palette.colorA) },
      uColorB: { value: new THREE.Color(palette.colorB) },
      uRim: { value: new THREE.Color(palette.rim) },
      uAmbient: { value: palette.ambient },
      uOpacity: { value: 1 },
      uBgColor: { value: new THREE.Color(palette.bg) },
    }),
    // colors are updated imperatively in the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColorA.value.set(palette.colorA);
    uniforms.uColorB.value.set(palette.colorB);
    uniforms.uRim.value.set(palette.rim);
    uniforms.uBgColor.value.set(palette.bg);
    uniforms.uAmbient.value = palette.ambient;
  }, [palette, uniforms]);

  // free old geometry when tier changes
  useEffect(() => () => geometry.dispose(), [geometry]);

  const energy = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += reduceMotion ? 0 : dt;

    // pointer "energy" from movement speed, smoothed and decaying
    const dx = pointer.nx - last.current.x;
    const dy = pointer.ny - last.current.y;
    last.current.x = pointer.nx;
    last.current.y = pointer.ny;
    const speed = reduceMotion ? 0 : Math.min(1, Math.hypot(dx, dy) * 7);
    energy.current += (speed - energy.current) * Math.min(1, dt * 4);
    uniforms.uEnergy.value = energy.current;

    // Fade the orb out past the hero so it never competes with body text.
    // Read window scroll directly (not the signals module) so this is robust
    // to code-splitting / module duplication across the lazy chunk boundary.
    const vh = window.innerHeight || 1;
    const scrollY = window.scrollY || 0;
    const heroFade = THREE.MathUtils.clamp(scrollY / (vh * 0.7), 0, 1);
    uniforms.uOpacity.value = THREE.MathUtils.lerp(1, 0.16, heroFade);
    const docH = document.documentElement.scrollHeight - vh;
    const scrollProgress = docH > 0 ? Math.min(1, scrollY / docH) : 0;

    const m = mesh.current;
    if (!m) return;

    // Placement mirrors the hero layout breakpoint (lg = 1024px):
    // wide -> right of the text; narrow -> above the text (which drops lower).
    const wide = size.width >= 1024;
    const targetX = wide ? viewport.width * 0.34 : 0;
    const targetY = wide ? 0.1 : viewport.height * 0.26;
    const targetScale =
      (wide ? 0.85 : 0.82) * THREE.MathUtils.clamp(viewport.width / 7, 0.6, 1.2);
    const k = Math.min(1, dt * 5);
    m.position.x += (targetX - m.position.x) * k;
    m.position.y += (targetY - m.position.y) * k;
    const s = m.scale.x + (targetScale - m.scale.x) * k;
    m.scale.setScalar(s);

    // rotation: slow auto-spin + pointer follow + scroll tilt
    const follow = reduceMotion ? 0 : 1;
    m.rotation.y += dt * 0.12 + pointer.nx * 0.015 * follow;
    m.rotation.x = THREE.MathUtils.lerp(
      m.rotation.x,
      pointer.ny * 0.35 * follow + scrollProgress * 0.7,
      Math.min(1, dt * 2),
    );
  });

  return (
    <mesh ref={mesh} geometry={geometry} scale={0.6}>
      <shaderMaterial
        vertexShader={blobVertex}
        fragmentShader={blobFragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
