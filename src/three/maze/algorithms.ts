import { ROWS, COLS, START, END, type Grid } from './generate';

export type CellState = 'open' | 'wall' | 'start' | 'end' | 'visited' | 'visiting' | 'path';
export type Update = { r: number; c: number; state: CellState };

function neighbors(r: number, c: number, grid: Grid): [number, number][] {
  return (
    [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]
  )
    .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
    .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc]);
}

function distToEnd(r: number, c: number): number {
  return Math.hypot(END[0] - r, END[1] - c);
}

function isStart(r: number, c: number) { return r === START[0] && c === START[1]; }
function isEnd(r: number, c: number)   { return r === END[0]   && c === END[1];   }

function tracePath(parents: Map<string, [number, number] | null>): [number, number][] {
  const path: [number, number][] = [];
  let cur: [number, number] = END;
  while (true) {
    path.push(cur);
    if (isStart(cur[0], cur[1])) break;
    const parent = parents.get(`${cur[0]},${cur[1]}`);
    if (parent == null) break;
    cur = parent;
  }
  return path.reverse();
}

export function buildResets(grid: Grid): Update[] {
  return grid.flatMap((row, r) =>
    row.flatMap((open, c): Update[] =>
      open
        ? [{ r, c, state: isStart(r, c) ? 'start' : isEnd(r, c) ? 'end' : 'open' }]
        : []
    )
  );
}

// DFS — stack with fixed neighbour order (down > right > up > left).
// Explores systematically; clearly backtracks on dead ends.
export function runDFS(grid: Grid): Update[] {
  const updates: Update[] = [];
  const visited = new Set<string>();
  const parents = new Map<string, [number, number] | null>();
  parents.set(`${START[0]},${START[1]}`, null);
  const stack: [number, number][] = [START];
  let found = false;

  while (stack.length && !found) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!isStart(r, c) && !isEnd(r, c)) {
      updates.push({ r, c, state: 'visiting' });
      updates.push({ r, c, state: 'visiting' }); // hold 2 steps so the glow is visible
    }
    if (isEnd(r, c)) { found = true; break; }

    // Push up/left first so right/down pop first (LIFO) — same initial direction as Greedy
    const ORDER: [number, number][] = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    for (const [dr, dc] of ORDER) {
      const nr = r + dr, nc = c + dc;
      const nk = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] && !visited.has(nk)) {
        if (!parents.has(nk)) parents.set(nk, [r, c]);
        stack.push([nr, nc]);
      }
    }

    if (!isStart(r, c)) updates.push({ r, c, state: 'visited' });
  }

  if (found) {
    for (const [pr, pc] of tracePath(parents)) {
      if (!isStart(pr, pc) && !isEnd(pr, pc))
        updates.push({ r: pr, c: pc, state: 'path' });
    }
  }
  return updates;
}

// BFS — queue; expands in concentric rings showing the level-by-level wave.
export function runBFS(grid: Grid): Update[] {
  const updates: Update[] = [];
  const visited = new Set<string>([`${START[0]},${START[1]}`]);
  const parents = new Map<string, [number, number] | null>();
  parents.set(`${START[0]},${START[1]}`, null);
  const queue: [number, number][] = [START];
  let found = false;

  while (queue.length && !found) {
    const [r, c] = queue.shift()!;
    if (!isStart(r, c) && !isEnd(r, c)) updates.push({ r, c, state: 'visiting' });

    for (const [nr, nc] of neighbors(r, c, grid)) {
      const nk = `${nr},${nc}`;
      if (!visited.has(nk)) {
        visited.add(nk);
        parents.set(nk, [r, c]);
        if (!isEnd(nr, nc)) updates.push({ r: nr, c: nc, state: 'visited' });
        queue.push([nr, nc]);
        if (isEnd(nr, nc)) { found = true; break; }
      }
    }

    if (!isStart(r, c) && !isEnd(r, c)) updates.push({ r, c, state: 'visited' });
  }

  if (found) {
    for (const [pr, pc] of tracePath(parents)) {
      if (!isStart(pr, pc) && !isEnd(pr, pc))
        updates.push({ r: pr, c: pc, state: 'path' });
    }
  }
  return updates;
}

// Greedy Best-First Search — global priority queue sorted by straight-line
// distance to END.  At every step the globally closest *discovered* cell is
// expanded next, regardless of where the algorithm currently is.  No stack /
// backtracking concept: it simply always picks the best known option.
export function runGreedy(grid: Grid): Update[] {
  const updates: Update[] = [];
  const expanded = new Set<string>();   // nodes fully processed (popped + neighbors pushed)
  const inOpen   = new Set<string>([`${START[0]},${START[1]}`]); // nodes already queued
  const parents  = new Map<string, [number, number] | null>();
  parents.set(`${START[0]},${START[1]}`, null);

  // [heuristic, r, c] — sorted ascending so shift() always gives the closest node
  const open: [number, number, number][] = [
    [distToEnd(START[0], START[1]), START[0], START[1]],
  ];
  let found = false;

  while (open.length && !found) {
    // Pop the globally closest discovered node — greedy always expands this one
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift()!;
    const key = `${r},${c}`;
    expanded.add(key);

    // Color only on pop — being in the queue means nothing yet
    if (!isStart(r, c) && !isEnd(r, c)) {
      updates.push({ r, c, state: 'visiting' });
      updates.push({ r, c, state: 'visiting' });
    }
    if (isEnd(r, c)) { found = true; break; }

    for (const [nr, nc] of neighbors(r, c, grid)) {
      const nk = `${nr},${nc}`;
      if (!expanded.has(nk) && !inOpen.has(nk)) {
        inOpen.add(nk);
        parents.set(nk, [r, c]);
        open.push([distToEnd(nr, nc), nr, nc]);
        // No color emit here — the node is queued, not visited
      }
    }

    if (!isStart(r, c) && !isEnd(r, c)) updates.push({ r, c, state: 'visited' });
  }

  if (found) {
    for (const [pr, pc] of tracePath(parents)) {
      if (!isStart(pr, pc) && !isEnd(pr, pc))
        updates.push({ r: pr, c: pc, state: 'path' });
    }
  }
  return updates;
}
