import type { Theme } from './theme';
import type { Triad } from './accent';

/** Colors + render settings for the 3D scene, derived from the active theme. */
export interface ScenePalette {
  bg: string; // page background the orb fades into when scrolled past the hero
  colorA: string; // blob base color (low displacement)
  colorB: string; // blob peak color (high displacement)
  rim: string; // fresnel rim glow
  ambient: number; // base lighting term for the blob
}

/** Scene colors come from the active accent triad (vivid base colors), while
 *  lighting stays tied to the theme. */
export function getScenePalette(theme: Theme, triad: Triad): ScenePalette {
  const [c1, c2, c3] = triad;
  if (theme === 'light') {
    return {
      bg: '#f3f3fb',
      colorA: c1,
      colorB: c2,
      rim: c3,
      ambient: 0.92,
    };
  }
  return {
    bg: '#06060d',
    colorA: c1,
    colorB: c2,
    rim: c3,
    ambient: 0.5,
  };
}
