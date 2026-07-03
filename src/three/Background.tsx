import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AdaptiveDpr } from '@react-three/drei';
import { useTheme } from '../lib/theme';
import { getScenePalette } from '../lib/palette';
import { ACCENT_EVENT, PRESETS, type Triad } from '../lib/accent';
import { usePerfTier, prefersReducedMotion } from '../lib/perf';
import { initSignals } from '../lib/signals';
import type { ScenePalette } from '../lib/palette';
import type { PerfTier } from '../lib/perf';
import { Particles } from './Particles';

/** Read the base accent triad the UI published on <html> (set before paint by
 *  index.html and updated by the accent store). Avoids importing the store so
 *  this lazy chunk can't end up with a duplicate copy of its state. */
function readAccentTriad(): Triad {
  if (typeof document !== 'undefined') {
    const raw = document.documentElement.dataset.accentBase;
    if (raw) {
      const parts = raw.split(',');
      if (parts.length === 3) return parts as Triad;
    }
  }
  return PRESETS[0].triad;
}

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
  // Initialize pointer/scroll signals here (not in App): this component is
  // lazy-loaded into its own chunk, so the scene reads this chunk's copy of
  // the signals module — it must be the copy that gets its listeners attached.
  useEffect(() => {
    initSignals();
  }, []);

  const theme = useTheme((s) => s.theme);
  const tier = usePerfTier();
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  // Track the accent triad via the DOM event the store fires (see above).
  const [triad, setTriad] = useState<Triad>(readAccentTriad);
  useEffect(() => {
    const sync = () => setTriad(readAccentTriad());
    sync(); // catch any change between module load and effect mount
    window.addEventListener(ACCENT_EVENT, sync);
    return () => window.removeEventListener(ACCENT_EVENT, sync);
  }, []);

  const palette = useMemo(() => getScenePalette(theme, triad), [theme, triad]);

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
