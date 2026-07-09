import { create } from 'zustand';
import { useTheme, type Theme } from './theme';

/** A base accent color set: [primary, secondary, tertiary]. */
export type Triad = [string, string, string];

const STORAGE_KEY = 'accent';
/** Dispatched on <html> whenever the base triad changes, so the 3D scene
 *  (a lazy chunk that does NOT import this store) can react without sharing
 *  module state across the chunk boundary. */
export const ACCENT_EVENT = 'accentchange';

export interface Preset {
  id: string;
  name: string;
  /** Un-normalized, vivid base colors. Normalized per-theme for the UI. */
  triad: Triad;
}

/** Curated multi-hue triads. The first is the site default.
 *  Primaries span the hue wheel ~50°+ apart so solid swatches are all distinct. */
export const PRESETS: Preset[] = [
  { id: 'sunset',  name: 'Sunset',  triad: ['#f43f5e', '#f97316', '#facc15'] }, // rose   ~351°
  { id: 'ember',   name: 'Ember',   triad: ['#f59e0b', '#ef4444', '#f43f5e'] }, // amber   ~45°
  { id: 'forest',  name: 'Forest',  triad: ['#22c55e', '#10b981', '#84cc16'] }, // green  ~142°
  { id: 'ocean',   name: 'Ocean',   triad: ['#06b6d4', '#0ea5e9', '#22d3ee'] }, // cyan   ~186°
  { id: 'aurora',  name: 'Aurora',  triad: ['#6366f1', '#7c3aed', '#8b5cf6'] }, // indigo ~239°
  { id: 'twilight',name: 'Twilight',triad: ['#a855f7', '#ec4899', '#f472b6'] }, // purple ~291°
];

const DEFAULT = PRESETS[0];

/* ----------------------------- color helpers ----------------------------- */
// NOTE: normalizeForTheme is mirrored by a compact copy in index.html's
// flash-free init script — keep the math (bands below) in sync.

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const t = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${t(r)}${t(g)}${t(b)}`;
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = (((g - b) / d) % 6 + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((((h % 360) + 360) % 360) / 60);
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g] = [c, x];
  else if (hp < 2) [r, g] = [x, c];
  else if (hp < 3) [g, b] = [c, x];
  else if (hp < 4) [g, b] = [x, c];
  else if (hp < 5) [r, b] = [x, c];
  else [r, b] = [c, x];
  const m = l - c / 2;
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function rotateHue(hex: string, deg: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h + deg, s, l);
}

export function adjustLightness(hex: string, deltaL: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, clamp(l + deltaL, 0, 100));
}

/** Push a color into a readable saturation/lightness band for the given theme,
 *  preserving hue. Dark themes want lighter accents; light themes want deeper
 *  ones — so the same base palette reads well on both backgrounds. */
export function normalizeForTheme(hex: string, theme: Theme): string {
  const [h, s, l] = hexToHsl(hex);
  const s2 = clamp(s, 60, 96);
  const l2 = theme === 'dark' ? clamp(l, 62, 76) : clamp(l, 40, 52);
  return hslToHex(h, s2, l2);
}

/** Build a pleasing multi-hue triad from a single custom color. */
export function deriveCustomTriad(base: string): Triad {
  return [base, rotateHue(base, 35), rotateHue(base, 165)];
}

/* ------------------------------- apply/store ------------------------------ */

function applyTriad(triad: Triad, theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const names = ['--accent', '--accent-2', '--accent-3'] as const;
  triad.forEach((c, i) => root.style.setProperty(names[i], normalizeForTheme(c, theme)));
  // Hand the *base* (un-normalized) triad to the 3D scene via the DOM, so the
  // lazy Background chunk never has to import this store.
  root.dataset.accentBase = triad.join(',');
  window.dispatchEvent(new CustomEvent(ACCENT_EVENT));
}

function persist(id: string, triad: Triad) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, triad }));
  } catch {
    /* storage may be unavailable — ignore */
  }
}

function readStored(): { id: string; triad: Triad } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p?.triad) && p.triad.length === 3) {
        return { id: typeof p.id === 'string' ? p.id : 'custom', triad: p.triad };
      }
    }
  } catch {
    /* malformed/unavailable — fall through to default */
  }
  return { id: DEFAULT.id, triad: DEFAULT.triad };
}

interface AccentState {
  /** Active preset id, or 'custom'. */
  id: string;
  /** Base (un-normalized) triad currently applied. */
  triad: Triad;
  setPreset: (id: string) => void;
  setCustom: (baseHex: string) => void;
}

export const useAccent = create<AccentState>((set) => {
  const initial = readStored();
  return {
    id: initial.id,
    triad: initial.triad,
    setPreset: (id) => {
      const preset = PRESETS.find((p) => p.id === id) ?? DEFAULT;
      applyTriad(preset.triad, useTheme.getState().theme);
      persist(preset.id, preset.triad);
      set({ id: preset.id, triad: preset.triad });
    },
    setCustom: (baseHex) => {
      const triad = deriveCustomTriad(baseHex);
      applyTriad(triad, useTheme.getState().theme);
      persist('custom', triad);
      set({ id: 'custom', triad });
    },
  };
});

/** Apply the stored accent and keep it in sync with theme changes.
 *  Call once, eagerly, from the app entry (main bundle). */
export function initAccent() {
  const { triad } = useAccent.getState();
  applyTriad(triad, useTheme.getState().theme);
  useTheme.subscribe((s) => applyTriad(useAccent.getState().triad, s.theme));
}
