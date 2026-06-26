import type { Theme } from './theme';

/** Colors + render settings for the 3D scene, derived from the active theme. */
export interface ScenePalette {
  colorA: string; // blob base color (low displacement)
  colorB: string; // blob peak color (high displacement)
  rim: string; // fresnel rim glow
  particle: string;
  ambient: number; // base lighting term for the blob
  /** Whether this theme wants bloom (still gated by performance tier). */
  bloom: boolean;
  bloomIntensity: number;
  particleOpacity: number;
  /** Additive blending reads as glow on dark bg; normal blending suits light bg. */
  additiveParticles: boolean;
}

export function getScenePalette(theme: Theme): ScenePalette {
  if (theme === 'light') {
    return {
      colorA: '#7c3aed',
      colorB: '#0ea5e9',
      rim: '#db2777',
      particle: '#6d28d9',
      ambient: 0.92,
      bloom: false,
      bloomIntensity: 0,
      particleOpacity: 0.5,
      additiveParticles: false,
    };
  }
  return {
    colorA: '#7c3aed',
    colorB: '#22d3ee',
    rim: '#f472b6',
    particle: '#a78bfa',
    ambient: 0.5,
    bloom: true,
    bloomIntensity: 0.85,
    particleOpacity: 0.8,
    additiveParticles: true,
  };
}
