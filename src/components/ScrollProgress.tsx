import { useEffect, useRef } from 'react';

/** Thin gradient bar at the very top showing read progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5">
      <div
        ref={bar}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-2 to-accent-3"
      />
    </div>
  );
}
