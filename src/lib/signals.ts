/**
 * Lightweight global signals for the 3D scene. The background <Canvas> uses
 * `pointer-events: none` so the page stays scrollable/clickable; instead we
 * track pointer + scroll at the window level and read them inside useFrame.
 * Mutable singletons avoid React re-renders on every move.
 */

export const pointer = {
  /** Normalized device coords, -1..1 (y up). */
  nx: 0,
  ny: 0,
};

export const scroll = {
  y: 0,
  /** 0 at top of page, 1 at the bottom. */
  progress: 0,
};

let initialized = false;

export function initSignals() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );

  const onScroll = () => {
    scroll.y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}
