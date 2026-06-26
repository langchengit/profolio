import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AdaptiveDpr } from '@react-three/drei';
import { useTheme } from '../lib/theme';
import { getScenePalette } from '../lib/palette';
import { usePerfTier, prefersReducedMotion } from '../lib/perf';
import type { ScenePalette } from '../lib/palette';
import type { PerfTier } from '../lib/perf';
import { Blob } from './Blob';
import { Particles } from './Particles';

function Scene({
  palette,
  tier,
  reduceMotion,
}: {
  palette: ScenePalette;
  tier: PerfTier;
  reduceMotion: boolean;
}) {
  const useBloom = palette.bloom && tier === 'high';
  return (
    <>
      <Particles palette={palette} tier={tier} reduceMotion={reduceMotion} />
      <Blob palette={palette} tier={tier} reduceMotion={reduceMotion} />
      <AdaptiveDpr pixelated={false} />
      {useBloom && (
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={palette.bloomIntensity}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.4}
            radius={0.72}
          />
        </EffectComposer>
      )}
    </>
  );
}

/** Fixed full-viewport canvas rendered behind the page content. */
export function Background() {
  const theme = useTheme((s) => s.theme);
  const tier = usePerfTier();
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);
  const palette = useMemo(() => getScenePalette(theme), [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={tier === 'high' ? [1, 2] : 1}
        gl={{ alpha: true, antialias: tier === 'high', powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        performance={{ min: 0.5 }}
      >
        <Scene palette={palette} tier={tier} reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
