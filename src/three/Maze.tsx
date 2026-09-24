import { useRef, useMemo, useEffect, useState, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Pause, Play, Shuffle } from 'lucide-react';
import { generateMaze, ROWS, COLS, START, END, type Grid } from './maze/generate';
import { useMediaQuery } from '../lib/hooks';
import { runDFS, runBFS, runGreedy, buildResets, type Update, type CellState } from './maze/algorithms';
import { useTheme, type Theme } from '../lib/theme';

// ─── Layout ──────────────────────────────────────────────────────────────────
const CELL    = 0.82;
const GAP     = 0.09;
const TILE_W  = CELL - GAP;
const WALL_H  = 0.88;
const FLOOR_H = 0.10;
const HALF_W  = ((COLS - 1) * CELL) / 2;
const HALF_H  = ((ROWS - 1) * CELL) / 2;

// ─── Palettes ────────────────────────────────────────────────────────────────
type Neon = Record<CellState, [number, number, number]>;

function getNeon(theme: Theme): Neon {
  if (theme === 'light') {
    return {
      wall:     [0.82,  0.70,  1.15 ],
      open:     [0.06,  0.05,  0.18 ],  // near-black indigo — deep passages contrast sharply with walls
      start:    [0.005, 0.49,  0.22 ],  // emerald-500 (#10b981), sRGB→linear so setRGB() renders it correctly
      end:      [2.00,  0.10,  0.10 ],
      visited:  [0.55,  0.18,  1.05 ],
      visiting: [0.85,  0.05,  2.30 ],
      path:     [2.20,  1.10,  0.00 ],
    };
  }
  return {
    wall:     [0.65,  0.48,  1.10 ],  // bright lavender-purple — clearly visible in dark
    open:     [0.02,  0.02,  0.07 ],  // near-black — passages clearly recede against walls
    start:    [0.005, 0.49,  0.22 ],  // emerald-500 (#10b981), sRGB→linear so setRGB() renders it correctly
    end:      [1.80,  0.05,  0.05 ],
    visited:  [0.32,  0.06,  0.88 ],
    visiting: [0.78,  0.00,  2.50 ],
    path:     [2.20,  1.10,  0.00 ],
  };
}

const MS_PER_STEP = 85;

/** `side`: full-hero canvas with the maze drawn in its right half (landscape
 *  screens). `stacked`: a canvas of its own below the hero text (portrait
 *  tablets), so the camera sits closer and the maze is centred. */
export type MazeLayout = 'side' | 'stacked';

const CAMERA = {
  side:    { distance: 42, min: 32, max: 65 },
  stacked: { distance: 24, min: 18, max: 40 },
} as const;

const wallGeo  = new THREE.BoxGeometry(TILE_W, WALL_H,  TILE_W);
const floorGeo = new THREE.BoxGeometry(TILE_W, FLOOR_H, TILE_W);

// ─── Scene ───────────────────────────────────────────────────────────────────
interface SceneProps {
  grid:         Grid;
  animRef:      React.RefObject<{ updates: Update[]; idx: number }>;
  resetRef:     React.RefObject<Update[] | null>;
  pausedRef:    React.RefObject<boolean>;
  theme:        Theme;
  orbitEnabled: boolean;
  zoomEnabled:  boolean;
  /** False on touch-first devices: no OrbitControls at all, because they set
   *  `touch-action: none` on the canvas and a swipe could no longer scroll. */
  canOrbit:     boolean;
  layout:       MazeLayout;
}

function MazeScene({ grid, animRef, resetRef, pausedRef, theme, orbitEnabled, zoomEnabled, canOrbit, layout }: SceneProps) {
  const wallMesh  = useRef<THREE.InstancedMesh>(null);
  const floorMesh = useRef<THREE.InstancedMesh>(null);
  const orbitRef  = useRef<any>(null);

  // Zero out accumulated damping delta when orbit is disabled so the maze
  // doesn't lurch when the cursor re-enters.
  useEffect(() => {
    if (!orbitEnabled && orbitRef.current) {
      orbitRef.current.sphericalDelta?.set(0, 0, 0);
      orbitRef.current.panOffset?.set(0, 0, 0);
    }
  }, [orbitEnabled]);

  const neon    = useMemo(() => getNeon(theme), [theme]);
  const neonRef = useRef(neon);

  // Tracks the current CellState for each floor instance index so a theme
  // change can repaint every cell to its live state rather than resetting.
  const cellStateRef = useRef<Map<number, CellState>>(new Map());

  const floorMap = useMemo(() => {
    const map = new Map<number, number>();
    let fi = 0;
    grid.forEach((row, r) => row.forEach((open, c) => { if (open) map.set(r * COLS + c, fi++); }));
    return map;
  }, [grid]);

  const wallCount  = useMemo(() => grid.flat().filter(v => !v).length, [grid]);
  const floorCount = useMemo(() => floorMap.size, [floorMap]);

  // Initial matrix + color setup
  useEffect(() => {
    const wm = wallMesh.current;
    const fm = floorMesh.current;
    if (!wm || !fm) return;

    const mat = new THREE.Matrix4();
    const col = new THREE.Color();
    let wi = 0, fi = 0;

    grid.forEach((row, r) => {
      row.forEach((open, c) => {
        const x = c * CELL - HALF_W;
        const z = r * CELL - HALF_H;
        if (!open) {
          mat.makeTranslation(x, WALL_H / 2, z);
          wm.setMatrixAt(wi++, mat);
        } else {
          const state: CellState =
            r === START[0] && c === START[1] ? 'start' :
            r === END[0]   && c === END[1]   ? 'end'   : 'open';
          mat.makeTranslation(x, FLOOR_H / 2, z);
          fm.setMatrixAt(fi, mat);
          col.setRGB(...neonRef.current[state]);
          fm.setColorAt(fi, col);
          cellStateRef.current.set(fi, state);
          fi++;
        }
      });
    });

    wm.instanceMatrix.needsUpdate = true;
    fm.instanceMatrix.needsUpdate = true;
    if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
  }, [grid]);

  // On theme change: update palette ref and repaint each cell to its CURRENT state
  // so in-progress animations survive the switch without resetting.
  useEffect(() => {
    neonRef.current = neon;
    const fm = floorMesh.current;
    if (!fm || !fm.instanceColor) return;
    const col = new THREE.Color();
    cellStateRef.current.forEach((state, fi) => {
      col.setRGB(...neon[state]);
      fm.setColorAt(fi, col);
    });
    fm.instanceColor.needsUpdate = true;
  }, [neon]);

  const tmp     = useMemo(() => new THREE.Color(), []);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const fm = floorMesh.current;
    if (!fm) return;

    if (resetRef.current) {
      const resets = resetRef.current;
      resetRef.current = null;
      for (const { r, c, state } of resets) {
        const fi = floorMap.get(r * COLS + c);
        if (fi !== undefined) {
          cellStateRef.current.set(fi, state);
          tmp.setRGB(...neonRef.current[state]); fm.setColorAt(fi, tmp);
        }
      }
      if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
      elapsed.current = 0;
      return;
    }

    if (pausedRef.current) return;

    const anim = animRef.current;
    if (anim.idx >= anim.updates.length) return;

    elapsed.current += delta * 1000;
    if (elapsed.current < MS_PER_STEP) return;
    elapsed.current -= MS_PER_STEP;

    const { r, c, state } = anim.updates[anim.idx++];
    if (state === 'wall') return;
    const fi = floorMap.get(r * COLS + c);
    if (fi === undefined) return;
    cellStateRef.current.set(fi, state);
    tmp.setRGB(...neonRef.current[state]);
    fm.setColorAt(fi, tmp);
    if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
  });

  const light     = theme === 'light';
  const wallColor = useMemo(() => new THREE.Color().setRGB(...neon.wall), [neon]);

  // Shift the projection frustum so the maze (at world origin) appears in the
  // right half of the full-screen canvas. setViewOffset makes the look-at
  // target appear at 70% from the left regardless of orbit angle, so the maze
  // stays visually right while OrbitControls still orbits around the maze centre.
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    if (layout === 'stacked') return;
    // Shift frustum left by 25% of canvas width — places world-origin at 75% from left.
    // fullWidth = width keeps the zoom unchanged; only the frustum centre moves.
    // The small upward shift keeps the maze clear of the controls pinned to the
    // bottom of the hero on shorter landscape screens (e.g. 1024x768 tablets).
    camera.setViewOffset(size.width, size.height, -size.width * 0.25, size.height * 0.06, size.width, size.height);
    return () => { (camera as THREE.PerspectiveCamera).clearViewOffset(); };
  }, [camera, size.width, size.height, layout]);

  const cam = CAMERA[layout];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, cam.distance, 0.1]} fov={70} />
      {canOrbit && <OrbitControls
        ref={orbitRef}
        enabled={orbitEnabled}
        enablePan={false}
        enableZoom={zoomEnabled}
        minDistance={cam.min}
        maxDistance={cam.max}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={false}
        dampingFactor={0.07}
        enableDamping
        target={[0, 0, 0]}
      />}

      <group>
        <ambientLight intensity={light ? 1.4 : 0.2} />
        <pointLight position={[0, 15, 0]} intensity={light ? 0.8 : 2.5} color={light ? '#a78bfa' : '#5b21b6'} distance={50} decay={1.4} />
        <directionalLight position={[8, 14, 10]} intensity={light ? 1.5 : 0.6} />
        <directionalLight position={[-6, 4, -8]} intensity={light ? 0.4 : 0.15} color={light ? '#c4b5fd' : '#6d28d9'} />

        <instancedMesh ref={wallMesh} args={[wallGeo, undefined, wallCount]}>
          <meshStandardMaterial color={wallColor} roughness={0.55} metalness={0.35} />
        </instancedMesh>

        <instancedMesh ref={floorMesh} args={[floorGeo, undefined, floorCount]}>
          <meshBasicMaterial />
        </instancedMesh>

        {light && (
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[COLS * CELL, 0.01, ROWS * CELL]} />
            <meshBasicMaterial color="#06060d" />
          </mesh>
        )}

      </group>
    </>
  );
}

// ─── Shared state ─────────────────────────────────────────────────────────────
type Algo = 'dfs' | 'bfs' | 'greedy';
interface AlgoStats { explored: number; pathLen: number }

interface MazeCtx {
  grid:        Grid;
  /** Bumped on every regenerate — keys the scene so it rebuilds from scratch. */
  gridId:      number;
  animRef:     React.RefObject<{ updates: Update[]; idx: number }>;
  resetRef:    React.RefObject<Update[] | null>;
  pausedRef:   React.RefObject<boolean>;
  done:        boolean;
  active:      Algo | null;
  paused:      boolean;
  stats:       AlgoStats | null;
  theme:       Theme;
  run:         (algo: Algo) => void;
  togglePause: () => void;
  regenerate:  () => void;
}

const MazeCtx = createContext<MazeCtx | null>(null);
function useMazeCtx() { return useContext(MazeCtx)!; }

/** `#rrggbb` to rgba(), for the lit button's background wash. Avoids
 *  color-mix(), which some browsers render with a shifted hue. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const ALGOS: { id: Algo; label: string; short: string; color: string }[] = [
  { id: 'dfs',    label: 'Depth-First Search',   short: 'DFS',    color: '#f97316' },
  { id: 'bfs',    label: 'Breadth-First Search', short: 'BFS',    color: '#22d3ee' },
  { id: 'greedy', label: 'Direct-Distance-First Search',    short: 'Greedy',   color: '#a78bfa' },
];

const LEGEND: [string, string][] = [
  ['#10b981', 'Start'],
  ['#ef4444', 'End'],
  ['#7c3aed', 'Exploring now'],
  ['#4b21a6', 'Visited'],
  ['#f59e0b', 'Final path'],
];

// ─── Provider — owns all maze state ───────────────────────────────────────────
export function MazeProvider({ children }: { children: React.ReactNode }) {
  const theme     = useTheme(s => s.theme);
  const [maze, setMaze] = useState(() => ({ grid: generateMaze(), id: 0 }));
  const grid      = maze.grid;
  const animRef   = useRef<{ updates: Update[]; idx: number }>({ updates: [], idx: 0 });
  const resetRef  = useRef<Update[] | null>(null);
  const pausedRef = useRef(false);

  const [active, setActive] = useState<Algo | null>(null);
  const [done,   setDone]   = useState(false);
  const [paused, setPaused] = useState(false);
  const [stats,  setStats]  = useState<AlgoStats | null>(null);

  useEffect(() => {
    if (!active) return;
    setDone(false);
    const id = setInterval(() => {
      const a = animRef.current;
      if (a.idx >= a.updates.length) { setDone(true); clearInterval(id); }
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  function run(algo: Algo) {
    const steps =
      algo === 'dfs' ? runDFS(grid) :
      algo === 'bfs' ? runBFS(grid) : runGreedy(grid);

    const exploredCells = new Set<string>();
    const pathCells     = new Set<string>();
    for (const { r, c, state } of steps) {
      if (state === 'visited' || state === 'visiting') exploredCells.add(`${r},${c}`);
      if (state === 'path') pathCells.add(`${r},${c}`);
    }
    setStats({ explored: exploredCells.size, pathLen: pathCells.size });
    pausedRef.current = false;
    setPaused(false);
    resetRef.current = buildResets(grid);
    animRef.current  = { updates: steps, idx: 0 };
    setActive(algo);
    setDone(false);
  }

  function regenerate() {
    animRef.current  = { updates: [], idx: 0 };
    resetRef.current = null;
    pausedRef.current = false;
    setPaused(false);
    setActive(null);
    setDone(false);
    setStats(null);
    setMaze((m) => ({ grid: generateMaze(), id: m.id + 1 }));
  }

  function togglePause() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
  }

  return (
    <MazeCtx.Provider value={{ grid, gridId: maze.id, animRef, resetRef, pausedRef, done, active, paused, stats, theme, run, togglePause, regenerate }}>
      {children}
    </MazeCtx.Provider>
  );
}

// ─── Canvas — render as absolute overlay, no fixed height ─────────────────────
export function MazeCanvas({ layout = 'side' }: { layout?: MazeLayout }) {
  const { grid, gridId, animRef, resetRef, pausedRef, theme } = useMazeCtx();
  const canOrbit = useCanOrbit();
  const [orbitEnabled, setOrbitEnabled] = useState(false);
  // Wheel-zoom only after the visitor clicks into the maze, so scrolling the
  // page past the hero never gets swallowed by the camera.
  const [zoomArmed, setZoomArmed] = useState(false);

  // Screen-space proximity: enable orbit when cursor is in the right half
  // (where the maze lives). A window-level pointerdown/up pair locks orbit on
  // for the full duration of a drag so the rotation never cuts off mid-gesture,
  // even when the cursor escapes the zone at near-horizontal angles.
  const inZoneRef      = useRef(false);
  const isDraggingRef  = useRef(false);

  useEffect(() => {
    const onDown = () => {
      if (inZoneRef.current) { isDraggingRef.current = true; setOrbitEnabled(true); setZoomArmed(true); }
    };
    const onUp = () => {
      isDraggingRef.current = false;
      if (!inZoneRef.current) setOrbitEnabled(false);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup',   onUp);
    };
  }, []);

  return (
    <div
      className="h-full w-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width;
        const my = (e.clientY - rect.top)  / rect.height;
        // Side layout: only the right-half area where the maze is drawn.
        // Stacked: the canvas is the maze's own box, so all of it counts.
        const inZone = layout === 'stacked' || (mx >= 0.56 && mx <= 0.88 && my <= 0.78);
        inZoneRef.current = inZone;
        if (!isDraggingRef.current) setOrbitEnabled(inZone);
        if (!inZone) setZoomArmed(false);
      }}
      onMouseLeave={() => {
        inZoneRef.current = false;
        setZoomArmed(false);
        if (!isDraggingRef.current) setOrbitEnabled(false);
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <MazeScene
          key={gridId}
          grid={grid}
          animRef={animRef}
          resetRef={resetRef}
          pausedRef={pausedRef}
          theme={theme}
          orbitEnabled={orbitEnabled}
          zoomEnabled={zoomArmed}
          canOrbit={canOrbit}
          layout={layout}
        />
      </Canvas>
    </div>
  );
}

// ─── Controls — status bar, algo buttons, legend ───────────────────────────────
/** Mouse/trackpad devices get drag-to-rotate; touch-first ones don't. */
function useCanOrbit() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

export function MazeControls({ inset = true }: { inset?: boolean }) {
  const { active, done, paused, stats, run, togglePause, regenerate } = useMazeCtx();
  const canOrbit = useCanOrbit();
  const [hovered, setHovered] = useState<Algo | null>(null);
  const activeInfo = ALGOS.find(a => a.id === active);

  return (
    <div className={`pointer-events-none flex flex-col gap-3 pb-2 ${inset ? 'px-8' : ''}`}>

      {/* Status + pause */}
      <div className="pointer-events-auto flex items-center justify-center gap-3 h-5">
        {active && (
          <span className="font-mono text-xs" style={{ color: activeInfo?.color }}>
            {done
              ? `${activeInfo?.label} done — ${stats?.explored} cells · path ${stats?.pathLen} steps`
              : paused
              ? `${activeInfo?.label} paused`
              : `${activeInfo?.label} searching…`}
          </span>
        )}
        {active && !done && (
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex items-center gap-1 py-1 font-mono text-xs text-faint transition hover:text-text"
          >
            {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
            {paused ? 'resume' : 'pause'}
          </button>
        )}
      </div>

      {/* Algorithm buttons: square, neutral at rest, taking on the algorithm's
          color when hovered or running. `transition` matches the duration
          every other button on the site uses for its color/border change. */}
      <div className="pointer-events-auto flex gap-2">
        {ALGOS.map(({ id, label, short, color }) => {
          const lit = active === id || hovered === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => run(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex flex-1 flex-col items-center border px-3 py-2.5 text-xs transition ${
                lit ? '' : 'border-border bg-surface text-muted'
              }`}
              style={
                lit
                  ? { color, borderColor: color, background: tint(color, 0.12) }
                  : undefined
              }
            >
              <span className="font-mono text-sm font-bold">{short}</span>
              <span className="mt-0.5 text-center font-sans opacity-60">
                {label.replace(/ Search$/, '')}
                <br />
                Search
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={regenerate}
          aria-label="Generate a new maze"
          title="New maze"
          className="flex flex-col items-center justify-center border border-border bg-surface px-3 py-2.5 text-xs text-muted transition hover:border-accent hover:text-accent"
        >
          <Shuffle size={16} aria-hidden="true" />
          <span className="mt-1 font-sans opacity-60">New maze</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
        {LEGEND.map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: color }} />
            <span className="font-mono text-xs text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Drag hint — only where dragging actually works. */}
      {canOrbit && (
        <div className="flex items-center justify-center">
          <span className="font-mono text-xs text-faint">drag to rotate · click, then scroll to zoom</span>
        </div>
      )}

    </div>
  );
}
