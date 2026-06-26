import { useEffect, useState } from 'react';

export type PerfTier = 'low' | 'high';

/** Cheap heuristic: coarse pointer, small viewport, or few cores => low tier. */
export function detectPerfTier(): PerfTier {
  if (typeof window === 'undefined') return 'high';
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrow = window.innerWidth < 820;
  const cores = navigator.hardwareConcurrency ?? 8;
  return coarse || narrow || cores <= 4 ? 'low' : 'high';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Tier as React state, re-evaluated on resize (e.g. desktop <-> responsive). */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(() => detectPerfTier());
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTier(detectPerfTier()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return tier;
}
