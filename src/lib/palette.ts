import type { Theme } from './theme';
import { adjustLightness, type Triad } from './accent';

/** Colors + render settings for the 3D scene, derived from the active theme. */
export interface ScenePalette {
  bg: string; // page background the orb fades into when scrolled past the hero
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

/** Scene colors come from the active accent triad (vivid base colors), while
 *  lighting/bloom/opacity stay tied to the theme. */
export function getScenePalette(theme: Theme, triad: Triad): ScenePalette {
  const [c1, c2, c3] = triad;
  if (theme === 'light') {
    return {
      bg: '#f3f3fb',
      colorA: c1,
      colorB: c2,
      rim: c3,
      particle: adjustLightness(c1, -8),
      ambient: 0.92,
      bloom: false,
      bloomIntensity: 0,
      particleOpacity: 0.5,
      additiveParticles: false,
    };
  }
  return {
    bg: '#06060d',
    colorA: c1,
    colorB: c2,
    rim: c3,
    particle: adjustLightness(c1, 14),
    ambient: 0.5,
    bloom: true,
    bloomIntensity: 0.85,
    particleOpacity: 0.8,
    additiveParticles: true,
  };
}
