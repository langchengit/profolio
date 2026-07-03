export const ROWS = 31;
export const COLS = 31;

export type Grid = boolean[][]; // true = open path, false = wall

export const START: [number, number] = [0, 0];
export const END: [number, number] = [ROWS - 1, COLS - 1];

export function generateMaze(): Grid {
  const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const DIRS: [number, number][] = [[0, 2], [2, 0], [0, -2], [-2, 0]];

  // Prim's algorithm — picks a random frontier cell each step, so branches
  // appear uniformly across the whole maze from the very start rather than
  // clustering at the end the way recursive backtracking does.
  const inFrontier = new Set<string>();
  const frontier: [number, number][] = [];

  function addFrontier(r: number, c: number) {
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc] && !inFrontier.has(key)) {
        inFrontier.add(key);
        frontier.push([nr, nc]);
      }
    }
  }

  grid[0][0] = true;
  addFrontier(0, 0);

  while (frontier.length > 0) {
    const idx = Math.floor(Math.random() * frontier.length);
    const [r, c] = frontier.splice(idx, 1)[0];
    if (grid[r][c]) continue; // already carved by a different path

    // Find a random already-visited neighbour to connect through
    const visited = DIRS
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
      .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc]);

    if (visited.length > 0) {
      const [vr, vc] = visited[Math.floor(Math.random() * visited.length)];
      grid[r][c] = true;
      grid[(r + vr) / 2][(c + vc) / 2] = true; // remove wall between
      addFrontier(r, c);
    }
  }

  grid[ROWS - 1][COLS - 1] = true;
  return grid;
}
