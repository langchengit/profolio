import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/perf';

/** Roughly one dot per this many px² of viewport, clamped to the range below. */
const AREA_PER_DOT = 18_000;
const MIN_DOTS = 25;
const MAX_DOTS = 70;

/** Dots closer than this get a connecting line. */
const LINK_DIST = 150;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
/** Line alpha at zero distance; fades to 0 at LINK_DIST. */
const LINK_ALPHA = 0.35;
const LINE_WIDTH = 1.6;

/** Drift speed in px per 60fps frame, in a random direction. */
const SPEED = 0.15;
const R_MIN = 2.6;
const R_MAX = 4.2;
/** The halo reaches this many times the dot's own radius. */
const GLOW_SCALE = 7;
/** Resolution of the pre-rendered halo sprite (scaled per dot when drawn). */
const SPRITE_PX = 160;
/** How far the core is mixed toward white, 0..1. */
const CORE_WHITE = 0.62;

/** Dots inside this radius are pushed straight away from the cursor. */
const REPEL_DIST = 140;
const REPEL_DIST_SQ = REPEL_DIST * REPEL_DIST;
/** Push in px per 60fps frame at the cursor itself, easing to 0 at the edge. */
const REPEL_PUSH = 2.6;

/** Retina-crisp without paying for 3x/4x panels. */
const MAX_DPR = 2;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Parse a CSS color into an "r, g, b" string usable inside rgba().
 *  Theme accents are authored as hex, but custom properties come back
 *  verbatim, so tolerate rgb()/rgba() too. */
function toRgbTriplet(value: string): string | null {
  const v = value.trim();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return null;
    const n = Number.parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
    if (parts.length === 3) return parts.map((p) => Math.round(Number.parseFloat(p))).join(', ');
  }
  return null;
}

/** Fixed full-viewport constellation network rendered behind the page. */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = prefersReducedMotion();

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let last = 0;

    // Neutral grey only if a theme variable somehow fails to parse.
    let rgb = '128, 128, 128';
    let coreRgb = rgb;
    let dotAlpha = 0.8;
    /** Halos add up on the dark bg (that is the bloom); on the light one that
     *  would only wash out. */
    let additive = true;

    // One pre-rendered halo, stamped once per dot - far cheaper than building
    // a radial gradient for every dot on every frame.
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_PX;
    sprite.height = SPRITE_PX;
    const sctx = sprite.getContext('2d');

    const paintSprite = () => {
      if (!sctx) return;
      const c = SPRITE_PX / 2;
      sctx.clearRect(0, 0, SPRITE_PX, SPRITE_PX);
      const g = sctx.createRadialGradient(c, c, 0, c, c, c);
      // A small near-white core, then a long accent-colored falloff.
      g.addColorStop(0, `rgba(${coreRgb}, 1)`);
      g.addColorStop(0.1, `rgba(${coreRgb}, 0.95)`);
      g.addColorStop(1 / GLOW_SCALE, `rgba(${rgb}, 0.55)`); // the dot's own edge
      g.addColorStop(0.42, `rgba(${rgb}, 0.16)`);
      g.addColorStop(0.72, `rgba(${rgb}, 0.04)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
    };

    /** Cursor position in canvas space; inactive until the pointer moves. */
    const cursor = { x: 0, y: 0, active: false };

    /** Colors come from the live theme variables on <html>, so the network
     *  tracks the theme toggle and the accent picker with no shared state. */
    const readPalette = () => {
      const root = document.documentElement;
      rgb = toRgbTriplet(getComputedStyle(root).getPropertyValue('--accent')) ?? rgb;
      coreRgb = rgb
        .split(',')
        .map((n) => Math.round(Number(n) + (255 - Number(n)) * CORE_WHITE))
        .join(', ');
      const dark = root.dataset.theme === 'dark';
      // Same weighting the old scene palette used: brighter on the dark bg.
      dotAlpha = dark ? 0.8 : 0.5;
      additive = dark;
      paintSprite();
    };

    const makeDot = (): Dot => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        r: R_MIN + Math.random() * (R_MAX - R_MIN),
      };
    };

    const syncCount = () => {
      const target = Math.min(MAX_DOTS, Math.max(MIN_DOTS, Math.round((w * h) / AREA_PER_DOT)));
      while (dots.length > target) dots.pop();
      while (dots.length < target) dots.push(makeDot());
      for (const d of dots) {
        // A shrunken viewport can leave survivors outside it.
        if (d.x > w) d.x = Math.random() * w;
        if (d.y > h) d.y = Math.random() * h;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      // Measure the canvas box, not the window: it excludes the scrollbar
      // gutter, so the backing store matches what actually gets painted.
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncCount();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = LINE_WIDTH;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= LINK_DIST_SQ) continue;
          // Falloff runs on the squared distance, so the whole O(n²) pass
          // stays sqrt-free; it still hits LINK_ALPHA at 0 and 0 at the edge.
          ctx.strokeStyle = `rgba(${rgb}, ${LINK_ALPHA * (1 - d2 / LINK_DIST_SQ)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = dotAlpha;
      if (additive) ctx.globalCompositeOperation = 'lighter';
      for (const d of dots) {
        const halo = d.r * GLOW_SCALE;
        ctx.drawImage(sprite, d.x - halo, d.y - halo, halo * 2, halo * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    /** Shove a dot straight out of the cursor's bubble. Its drift velocity is
     *  untouched, so it simply carries on once the cursor leaves. */
    const repel = (d: Dot, dt: number) => {
      const dx = d.x - cursor.x;
      const dy = d.y - cursor.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= REPEL_DIST_SQ) return;
      const dist = Math.sqrt(d2); // only for the few dots inside the bubble
      const f = (1 - dist / REPEL_DIST) * REPEL_PUSH * dt;
      if (dist < 0.01) {
        d.x += f; // cursor dead on the dot: no direction to push along
        return;
      }
      d.x += (dx / dist) * f;
      d.y += (dy / dist) * f;
    };

    const step = (now: number) => {
      // Normalized to a 60fps frame so the drift reads the same on 120Hz.
      const dt = last ? Math.min((now - last) / 16.667, 3) : 1;
      last = now;
      for (const d of dots) {
        if (cursor.active) repel(d, dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        // Wrap with the radius as margin: dots slide fully off before returning.
        if (d.x < -d.r) d.x = w + d.r;
        else if (d.x > w + d.r) d.x = -d.r;
        if (d.y < -d.r) d.y = h + d.r;
        else if (d.y > h + d.r) d.y = -d.r;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (raf || reduceMotion) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onResize = () => {
      // Resizing the backing store clears it, so always repaint — the loop may
      // be paused (reduced motion, or a hidden tab).
      resize();
      draw();
    };

    /** Nothing to animate while the tab is in the background. */
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    // <html> carries both the theme attribute and the accent picker's inline
    // custom properties; watching it covers every palette change.
    const observer = new MutationObserver(() => {
      readPalette();
      draw(); // cheap at this dot count, and keeps a paused canvas in sync
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style'],
    });

    readPalette();
    resize();
    // Paint once up front so the network is there even if the tab starts
    // hidden (rAF would not fire until it is shown).
    draw();
    if (!reduceMotion) start();

    // The canvas is pointer-events: none, so the cursor is tracked at the
    // window level. Under reduced motion the frame is static — no tracking.
    const onPointerMove = (e: PointerEvent) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.active = true;
    };
    const onPointerOut = () => {
      cursor.active = false;
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerOut);
      window.addEventListener('blur', onPointerOut);
    }

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerOut);
      window.removeEventListener('blur', onPointerOut);
      dots = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
