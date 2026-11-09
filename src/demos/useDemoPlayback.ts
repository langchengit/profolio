import { useEffect, useState } from 'react';
import { useInView } from '../lib/hooks';

/** Play state for a demo: starts paused when the viewer prefers reduced motion,
 *  and `running` is only true while the demo is actually on screen. */
export function useDemoPlayback() {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.2, rootMargin: '0px' });
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);
  return {
    ref,
    playing,
    toggle: () => setPlaying((p) => !p),
    running: playing && inView,
  };
}
