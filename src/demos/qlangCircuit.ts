/** The phase oracle qlang emits for `x + y == 6` (2-bit x and y), dumped from
 *  `qlang.compile_oracle(x + y == 6).circuit`. Each entry is [gate, qubits];
 *  for controlled gates the last qubit is the target.
 *
 *  Qubits: 0–1 = x, 2–3 = y, 4–7 = workspace (7 holds the predicate).
 *  Gates 1–13 are the ripple-carry adder, 14–26 the `== 6` check, 27 the
 *  phase flip, and 28–54 the same computation run backwards. */
export type Gate = [name: 'x' | 'z' | 'cx' | 'ccx' | 'mcx', qubits: number[]];

export const ORACLE: Gate[] = [["x",[5]],["cx",[2,0]],["cx",[2,7]],["ccx",[7,0,2]],["cx",[3,1]],["cx",[3,2]],["ccx",[2,1,3]],["cx",[3,6]],["ccx",[2,1,3]],["cx",[3,2]],["cx",[2,1]],["ccx",[7,0,2]],["cx",[2,7]],["cx",[7,0]],["cx",[4,0]],["x",[0]],["cx",[5,1]],["x",[1]],["cx",[5,6]],["x",[6]],["mcx",[0,1,6,7]],["x",[6]],["cx",[5,6]],["x",[1]],["cx",[5,1]],["x",[0]],["cx",[4,0]],["z",[7]],["cx",[4,0]],["x",[0]],["cx",[5,1]],["x",[1]],["cx",[5,6]],["x",[6]],["mcx",[0,1,6,7]],["x",[6]],["cx",[5,6]],["x",[1]],["cx",[5,1]],["x",[0]],["cx",[4,0]],["cx",[7,0]],["cx",[2,7]],["ccx",[7,0,2]],["cx",[2,1]],["cx",[3,2]],["ccx",[2,1,3]],["cx",[3,6]],["ccx",[2,1,3]],["cx",[3,2]],["cx",[3,1]],["ccx",[7,0,2]],["cx",[2,7]],["cx",[2,0]],["x",[5]]];

export const NUM_QUBITS = 8;
export const QUBIT_LABELS = ['x bit 0', 'x bit 1', 'y bit 0', 'y bit 1', 'scratch', 'scratch', 'scratch', 'result'];

/** Index of the Z gate between the computation and its reverse. */
export const PHASE_GATE = 27;

export type GateGroup = 'add' | 'eq' | 'phase' | 'undo';
export function groupOf(i: number): GateGroup {
  if (i === PHASE_GATE) return 'phase';
  if (i > PHASE_GATE) return 'undo';
  if (i >= 1 && i <= 13) return 'add';
  return 'eq'; // gate 0 prepares the constant qubit the equality check uses
}

/** Pack gates into columns: a gate goes in the first column after every
 *  earlier gate touching any wire its vertical line crosses. */
export function layoutColumns(gates: Gate[], n = NUM_QUBITS): { cols: number[]; count: number } {
  const last = new Array(n).fill(-1);
  const cols = gates.map(([, qs]) => {
    const lo = Math.min(...qs);
    const hi = Math.max(...qs);
    let c = 0;
    for (let q = lo; q <= hi; q++) c = Math.max(c, last[q] + 1);
    for (let q = lo; q <= hi; q++) last[q] = c;
    return c;
  });
  return { cols, count: Math.max(...cols) + 1 };
}
