import { memo, useEffect, useRef, useState } from 'react';
import { DemoFrame } from './DemoFrame';
import { useDemoPlayback } from './useDemoPlayback';
import {
  ORACLE, NUM_QUBITS, PHASE_GATE, QUBIT_LABELS, groupOf, layoutColumns, type Gate, type GateGroup,
} from './qlangCircuit';

/** One continuous animation: the rule `x + y == 6` falls apart into an
 *  expression tree, the tree becomes the circuit qlang really compiles, and
 *  that circuit is the phase oracle in a Grover search over the 16 (x, y)
 *  pairs. Everything is a pure function of one clock `t` (seconds). */

const W = 760;
const H = 310;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const LOOP = 24.4;
/** The rule and tree steps (scene time 0–6.2) play at double speed. */
const FAST_END = 6.2;
const REAL_LOOP = LOOP - FAST_END / 2;
const sceneTime = (real: number) => (real < FAST_END / 2 ? real * 2 : real + FAST_END / 2);

// ─── timing helpers ──────────────────────────────────────────────────────────
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
/** 0 → 1 as t goes from a to b, eased. */
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** Fade in over [a, a+d] and out over [b, b+d]. */
const fadeWindow = (t: number, a: number, b: number, d = 0.4) => seg(t, a, a + d) * (1 - seg(t, b, b + d));

// ─── 1 · the rule ────────────────────────────────────────────────────────────
const CODE = 'constraint = x + y == 6';
const FS = 18;
const CW = FS * 0.6;
const CODE_X0 = W / 2 - (CODE.length * CW) / 2;
const CODE_Y = 56;
const charX = (i: number) => CODE_X0 + i * CW + CW / 2;

// ─── 3 · circuit ─────────────────────────────────────────────────────────────
const WIRE_Y = (q: number) => 72 + q * 26;
const GX0 = 104;
const GX1 = W - 18;
const { cols: COLS, count: NCOLS } = layoutColumns(ORACLE);
const colX = (c: number) => GX0 + ((c + 0.5) * (GX1 - GX0)) / NCOLS;

/** x-extent of gates [from, to] (inclusive), for the bracket over a group. */
function span(from: number, to: number): [number, number] {
  const xs = COLS.slice(from, to + 1).map(colX);
  return [Math.min(...xs), Math.max(...xs)];
}
const SPANS: Record<GateGroup, [number, number]> = {
  add: span(1, 13),
  eq: span(14, PHASE_GATE - 1),
  phase: span(PHASE_GATE, PHASE_GATE),
  undo: span(PHASE_GATE + 1, ORACLE.length - 1),
};
const mid = (g: GateGroup) => (SPANS[g][0] + SPANS[g][1]) / 2;
const LABEL_Y = 46;

// ─── 2 · tree ────────────────────────────────────────────────────────────────
type TNode = { label: string; chars: number[]; tree: [number, number]; note: string; accent?: boolean };
const NODES: TNode[] = [
  { label: '==', chars: [19, 20], tree: [380, 104], note: 'true / false', accent: true },
  { label: '+', chars: [15], tree: [290, 172], note: '3-bit number' },
  { label: '6', chars: [22], tree: [470, 172], note: 'constant' },
  { label: 'x', chars: [13], tree: [200, 240], note: '2-bit number' },
  { label: 'y', chars: [17], tree: [380, 240], note: '2-bit number' },
];
const TOKEN_CHARS = new Set(NODES.flatMap((n) => n.chars));
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4]];
/** Where each tree node flies when the circuit appears: operators to their
 *  gate group's label, variables to their input wires. */
const NODE_TARGETS: [number, number][] = [
  [mid('eq') + 8, LABEL_Y],
  [mid('add') + 16, LABEL_Y],
  [mid('eq') + 31, LABEL_Y],
  [24, (WIRE_Y(0) + WIRE_Y(1)) / 2],
  [24, (WIRE_Y(2) + WIRE_Y(3)) / 2],
];

// ─── 4 · Grover search ───────────────────────────────────────────────────────
const STATES = Array.from({ length: 16 }, (_, i) => ({ x: i >> 2, y: i & 3 }));
const IS_ANSWER = STATES.map((s) => s.x + s.y === 6);
const ANSWER = IS_ANSWER.indexOf(true);
/** π/4 · √16 rounds to 3 rounds for a single answer among 16. */
const K = 3;

const BASE = 178;
const UNIT = 98;
const SPACING = 37;
const BAR_W = 22;
const BX0 = (W - SPACING * 15) / 2;
const barX = (i: number) => BX0 + i * SPACING;

const SUPER_AT: [number, number] = [11.2, 12.0];
const ROUND0 = 12.3;
const ROUND_LEN = 2.6;
const MEASURE_AT = ROUND0 + K * ROUND_LEN - 0.1;
const FADE_OUT = 23.4;
const roundStart = (r: number) => ROUND0 + r * ROUND_LEN;
const oracleOn = (r: number): [number, number] => [roundStart(r), roundStart(r) + 0.9];
const diffuserOn = (r: number): [number, number] => [roundStart(r) + 1.1, roundStart(r) + 2.2];

const mean = (v: number[]) => v.reduce((s, a) => s + a, 0) / v.length;
const ZERO = STATES.map(() => 0);
/** Amplitude keyframes: superposition, then per round the oracle flips the
 *  answer's sign and the diffuser reflects every amplitude about the average. */
const AMP_KEYS: [number, number[]][] = (() => {
  const keys: [number, number[]][] = [[SUPER_AT[0], ZERO]];
  let v = STATES.map(() => 0.25);
  keys.push([SUPER_AT[1], v]);
  for (let r = 0; r < K; r++) {
    keys.push([oracleOn(r)[0], v]);
    v = v.map((a, i) => (IS_ANSWER[i] ? -a : a));
    keys.push([oracleOn(r)[1], v]);
    keys.push([diffuserOn(r)[0], v]);
    const m = mean(v);
    v = v.map((a) => 2 * m - a);
    keys.push([diffuserOn(r)[1], v]);
  }
  return keys;
})();
const FINAL_P = Math.round(AMP_KEYS[AMP_KEYS.length - 1][1][ANSWER] ** 2 * 100);

function amplitudes(t: number): number[] {
  if (t <= AMP_KEYS[0][0]) return AMP_KEYS[0][1];
  for (let k = 1; k < AMP_KEYS.length; k++) {
    const [t1, v1] = AMP_KEYS[k];
    if (t <= t1) {
      const [t0, v0] = AMP_KEYS[k - 1];
      const u = t1 > t0 ? ease(clamp((t - t0) / (t1 - t0))) : 1;
      return v0.map((a, i) => lerp(a, v1[i], u));
    }
  }
  return AMP_KEYS[AMP_KEYS.length - 1][1];
}
/** The average the diffuser reflects about, while it's running. */
function diffuserMean(t: number): number | null {
  for (let r = 0; r < K; r++) {
    const [a, b] = diffuserOn(r);
    if (t >= a - 0.15 && t <= b + 0.15) return mean(AMP_KEYS[2 + r * 4 + 2][1]);
  }
  return null;
}
/** 0-based round in progress (or K once all are done). */
function currentRound(t: number): number {
  for (let r = 0; r < K; r++) if (t < roundStart(r) + ROUND_LEN) return r;
  return K;
}

// The step boxes: Superposition, [Phase oracle, Diffuser] × K, Measure.
const STRIP_Y = 40;
const BOX = 26;
const BOX_GAP = 16;
const boxW = (label: string) => label.length * 7.8 + 20;
const STEPS = ['Superposition', 'Phase oracle', 'Diffuser', 'Measure'];
const STEP_X: number[] = (() => {
  const xs: number[] = [];
  let x = 30;
  for (const l of STEPS) {
    xs.push(x);
    x += boxW(l) + BOX_GAP;
  }
  return xs;
})();
const STRIP_END = STEP_X[3] + boxW('Measure');

// ─── drawing ─────────────────────────────────────────────────────────────────

const GROUP_CLASS: Record<GateGroup, { stroke: string; fill: string }> = {
  add: { stroke: 'stroke-text', fill: 'fill-text' },
  eq: { stroke: 'stroke-accent', fill: 'fill-accent' },
  phase: { stroke: 'stroke-accent', fill: 'fill-accent' },
  undo: { stroke: 'stroke-muted', fill: 'fill-muted' },
};

function GateMark({ gate, x, group }: { gate: Gate; x: number; group: GateGroup }) {
  const [name, qs] = gate;
  const { stroke, fill } = GROUP_CLASS[group];
  const target = qs[qs.length - 1];
  const controls = qs.slice(0, -1);
  const ty = WIRE_Y(target);
  if (name === 'z') {
    return (
      <g>
        <rect x={x - 7} y={ty - 7} width={14} height={14} className="fill-accent" />
        <text x={x} y={ty + 3.5} textAnchor="middle" fontFamily={MONO} fontSize={10} fontWeight={700}
          className="fill-bg">Z</text>
      </g>
    );
  }
  const ys = qs.map(WIRE_Y);
  return (
    <g>
      {controls.length > 0 && (
        <line x1={x} x2={x} y1={Math.min(...ys)} y2={Math.max(...ys)} className={stroke} strokeWidth={1.2} />
      )}
      {controls.map((q) => (
        <circle key={q} cx={x} cy={WIRE_Y(q)} r={2.6} className={fill} />
      ))}
      <circle cx={x} cy={ty} r={5.5} className={`fill-bg ${stroke}`} strokeWidth={1.2} />
      <line x1={x - 5.5} x2={x + 5.5} y1={ty} y2={ty} className={stroke} strokeWidth={1.2} />
      <line x1={x} x2={x} y1={ty - 5.5} y2={ty + 5.5} className={stroke} strokeWidth={1.2} />
    </g>
  );
}

/** The whole compiled oracle, drawn at once. Memoised: it never changes. */
const Circuit = memo(function Circuit() {
  return (
    <g>
      {QUBIT_LABELS.map((l, q) => (
        <g key={q}>
          <text x={GX0 - 14} y={WIRE_Y(q) + 4} textAnchor="end" fontFamily={MONO} fontSize={11}
            className={q < 4 ? 'fill-text' : 'fill-faint'}>{l}</text>
          <line x1={GX0 - 6} x2={GX1} y1={WIRE_Y(q)} y2={WIRE_Y(q)} className="stroke-border-strong" strokeWidth={1} />
        </g>
      ))}
      {ORACLE.map((g, i) => (
        <GateMark key={i} gate={g} x={colX(COLS[i])} group={groupOf(i)} />
      ))}
      {(
        [
          ['add', 'stroke-text'],
          ['eq', 'stroke-accent'],
          ['undo', 'stroke-muted'],
        ] as const
      ).map(([g, cls]) => (
        <line key={g} x1={SPANS[g][0] - 4} x2={SPANS[g][1] + 4} y1={LABEL_Y + 8} y2={LABEL_Y + 8}
          className={cls} strokeWidth={1} />
      ))}
      <text x={mid('undo')} y={LABEL_Y} textAnchor="middle" fontSize={11} letterSpacing="0.12em"
        className="fill-faint font-serif uppercase">undo scratch work</text>
      <text x={mid('phase')} y={WIRE_Y(NUM_QUBITS - 1) + 26} textAnchor="middle" fontSize={11} letterSpacing="0.12em"
        className="fill-accent font-serif uppercase">flip sign of answers</text>
    </g>
  );
});

function StepBox({ x, label, active, done }: { x: number; label: string; active: boolean; done: boolean }) {
  const w = boxW(label);
  return (
    <g>
      <rect x={x} y={STRIP_Y - BOX / 2} width={w} height={BOX} strokeWidth={1.5}
        className={active ? 'fill-accent stroke-accent' : done ? 'fill-bg stroke-text' : 'fill-bg stroke-border-strong'} />
      <text x={x + w / 2} y={STRIP_Y + 4.5} textAnchor="middle" fontFamily={MONO} fontSize={13} fontWeight={700}
        className={active ? 'fill-bg' : done ? 'fill-text' : 'fill-faint'}>{label}</text>
    </g>
  );
}

function Scene({ t }: { t: number }) {
  // ── rule → tree ──
  const codeIn = seg(t, 0, 0.5);
  const restFade = 1 - seg(t, 3.0, 3.8);
  const toTree = seg(t, 3.0, 4.6);
  const toCircuit = seg(t, 6.2, 7.6);
  const boxes = seg(t, 4.0, 4.8) * (1 - seg(t, 6.0, 6.8));
  const edges = seg(t, 4.4, 5.0) * (1 - seg(t, 6.0, 6.6));
  const notes = seg(t, 4.8, 5.4) * (1 - seg(t, 6.0, 6.4));
  const nodeText = t < 7.6 ? 1 : 1 - seg(t, 7.6, 8.2);
  const pos = NODES.map((n, i) => {
    const cx = n.chars.reduce((s, c) => s + charX(c), 0) / n.chars.length;
    const x = lerp(lerp(cx, n.tree[0], toTree), NODE_TARGETS[i][0], toCircuit);
    const y = lerp(lerp(CODE_Y - 6, n.tree[1], toTree), NODE_TARGETS[i][1], toCircuit);
    return [x, y] as const;
  });
  // ── circuit ──
  const circuit = seg(t, 6.6, 7.4) * (1 - seg(t, 10.0, 10.6));
  const groupLabels = seg(t, 7.4, 8.0) * (1 - seg(t, 10.0, 10.4));
  const scanX = lerp(GX0, GX1, clamp((t - 7.8) / 2.0));
  const scan = fadeWindow(t, 7.7, 9.6, 0.3);
  // the circuit squeezes into the Phase oracle step box
  const squeeze = seg(t, 10.0, 11.0);
  const squeezing = t >= 10.0 && t < 11.0;
  // ── grover ──
  const grover = seg(t, 10.6, 11.0) * (1 - seg(t, FADE_OUT, FADE_OUT + 0.6));
  // At Measure the bars turn from amplitudes into probabilities (amplitude²),
  // which add up to 100%.
  const toProb = seg(t, MEASURE_AT, MEASURE_AT + 0.8);
  const amps = amplitudes(t).map((a) => lerp(a, a * a, toProb));
  const round = currentRound(t);
  const avg = diffuserMean(t);
  const inWindow = ([a, b]: [number, number]) => t >= a && t < b;
  const rounds = Array.from({ length: K }, (_, r) => r);
  const oracleActive = rounds.some((r) => inWindow(oracleOn(r)));
  const diffuserActive = rounds.some((r) => inWindow(diffuserOn(r)));
  const loopDone = t >= diffuserOn(K - 1)[1];
  const measured = seg(t, MEASURE_AT + 0.2, MEASURE_AT + 0.6);
  const loopX0 = STEP_X[1] - 6;
  const loopX1 = STEP_X[2] + boxW('Diffuser') + 6;

  return (
    <>
      {/* the rule */}
      {t < 4 &&
        CODE.split('').map((ch, i) => {
          if (TOKEN_CHARS.has(i) && t >= 3.0) return null;
          const o = codeIn * (TOKEN_CHARS.has(i) ? 1 : restFade);
          return o > 0 ? (
            <text key={i} x={charX(i)} y={CODE_Y} textAnchor="middle" fontFamily={MONO} fontSize={FS}
              className={TOKEN_CHARS.has(i) ? 'fill-accent' : 'fill-text'} fontWeight={TOKEN_CHARS.has(i) ? 700 : 400}
              opacity={o}>{ch}</text>
          ) : null;
        })}

      {/* expression tree */}
      {t >= 3.0 && t < 8.4 && (
        <g>
          {EDGES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={pos[a][0]} y1={pos[a][1] + 16} x2={pos[b][0]} y2={pos[b][1] - 16}
              className="stroke-border-strong" strokeWidth={1.5} opacity={edges} />
          ))}
          {NODES.map((n, i) => (
            <g key={n.label}>
              <rect x={pos[i][0] - 16} y={pos[i][1] - 16} width={32} height={32} strokeWidth={1.5}
                className={n.accent ? 'fill-bg stroke-accent' : 'fill-bg stroke-text'} opacity={boxes} />
              <text x={pos[i][0]} y={pos[i][1] + 6} textAnchor="middle" fontFamily={MONO} fontSize={FS}
                fontWeight={700} className={n.accent || toCircuit > 0 ? 'fill-accent' : 'fill-text'} opacity={nodeText}>
                {n.label}
              </text>
              <text x={pos[i][0] + 24} y={pos[i][1] + 4} fontSize={11} letterSpacing="0.12em"
                className="fill-faint font-serif uppercase" opacity={notes}>{n.note}</text>
            </g>
          ))}
        </g>
      )}

      {/* compiled circuit, all at once */}
      {circuit > 0 && (
        <g opacity={circuit}>
          <Circuit />
        </g>
      )}
      {groupLabels > 0 && (
        <g opacity={groupLabels} fontFamily={MONO} fontSize={13} fontWeight={700} textAnchor="middle">
          <text x={mid('add')} y={LABEL_Y + 4} className="fill-text">add x + y</text>
          <text x={mid('eq')} y={LABEL_Y + 4} className="fill-accent">check = 6</text>
        </g>
      )}
      {scan > 0 && (
        <line x1={scanX} x2={scanX} y1={WIRE_Y(0) - 14} y2={WIRE_Y(NUM_QUBITS - 1) + 14}
          className="stroke-accent" strokeWidth={2} opacity={scan * 0.7} />
      )}
      {squeezing && (
        <rect
          x={lerp(GX0 - 30, STEP_X[1], squeeze)}
          y={lerp(WIRE_Y(0) - 18, STRIP_Y - BOX / 2, squeeze)}
          width={lerp(GX1 - GX0 + 36, boxW('Phase oracle'), squeeze)}
          height={lerp(WIRE_Y(NUM_QUBITS - 1) - WIRE_Y(0) + 36, BOX, squeeze)}
          className="fill-none stroke-accent" strokeWidth={1.5}
        />
      )}

      {/* Grover search */}
      {grover > 0 && (
        <g opacity={grover}>
          {/* bracket under the two steps that repeat k times */}
          <path
            d={`M${loopX0} ${STRIP_Y + 20} V${STRIP_Y + 26} H${loopX1} V${STRIP_Y + 20}`}
            className="fill-none stroke-accent" strokeWidth={1.2}
          />
          <text x={(loopX0 + loopX1) / 2} y={STRIP_Y + 42} textAnchor="middle" fontFamily={MONO} fontSize={12}
            className="fill-accent" fontWeight={700}>
            repeat k = {K} times{round < K && t >= ROUND0 ? ` · round ${round + 1} of ${K}` : ''}
          </text>

          <line x1={20} x2={STRIP_END + 10} y1={STRIP_Y} y2={STRIP_Y} className="stroke-border-strong" strokeWidth={1} />
          <StepBox x={STEP_X[0]} label="Superposition" active={inWindow(SUPER_AT)} done={t >= SUPER_AT[1]} />
          <StepBox x={STEP_X[1]} label="Phase oracle" active={oracleActive} done={loopDone} />
          <StepBox x={STEP_X[2]} label="Diffuser" active={diffuserActive} done={loopDone} />
          <StepBox x={STEP_X[3]} label="Measure" active={t >= MEASURE_AT} done={false} />

          {measured > 0 && (
            <text x={STRIP_END + 20} y={STRIP_Y + 5} fontFamily={MONO} fontSize={13} fontWeight={700}
              className="fill-accent" opacity={measured}>
              x = 3, y = 3 ({FINAL_P}% probability)
            </text>
          )}

          {/* amplitudes, then probabilities */}
          <line x1={BX0 - 24} x2={W - BX0 + 24} y1={BASE} y2={BASE} className="stroke-border-strong" strokeWidth={1} />
          <text x={BX0 - 24} y={112} fontSize={10.5} letterSpacing="0.12em" className="fill-faint font-serif uppercase">
            <tspan opacity={1 - toProb}>amplitude (squares add up to 1)</tspan>
          </text>
          <text x={BX0 - 24} y={112} fontSize={10.5} letterSpacing="0.12em" className="fill-faint font-serif uppercase"
            opacity={toProb}>
            probability = amplitude² (adds up to 100%)
          </text>
          {avg !== null && (
            <g>
              <line x1={BX0 - 24} x2={W - BX0 + 24} y1={BASE - avg * UNIT} y2={BASE - avg * UNIT}
                className="stroke-muted" strokeWidth={1} strokeDasharray="4 4" />
              <text x={W - BX0 + 28} y={BASE - avg * UNIT + 4} fontSize={10.5} letterSpacing="0.12em"
                className="fill-faint font-serif uppercase">average</text>
            </g>
          )}
          {STATES.map((s, i) => {
            const a = amps[i];
            const answer = IS_ANSWER[i];
            return (
              <g key={i}>
                <rect x={barX(i) - BAR_W / 2} y={a >= 0 ? BASE - a * UNIT : BASE} width={BAR_W}
                  height={Math.abs(a) * UNIT} className={answer ? 'fill-accent' : 'fill-muted'}
                  opacity={answer ? 1 : 0.55} />
                {answer && measured > 0 && (
                  <rect x={barX(i) - BAR_W / 2 - 5} y={BASE - a * UNIT - 6} width={BAR_W + 10}
                    height={a * UNIT + 6 + (H - 4 - BASE)} className="fill-none stroke-accent" strokeWidth={1.5}
                    opacity={measured} />
                )}
                <text x={barX(i)} y={H - 10} textAnchor="middle" fontFamily={MONO} fontSize={10.5}
                  className={answer ? 'fill-accent' : 'fill-faint'}>
                  {s.x},{s.y}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </>
  );
}

function captionAt(t: number): string {
  if (t < 3.0) return 'A rule in plain Python: find x and y (each 0 to 3) that add up to 6.';
  if (t < 6.2) return 'qlang turns it into an expression tree.';
  if (t < 10.0) return 'The tree compiles to the real circuit: add, check = 6, flip the sign of answers, then undo.';
  if (t < 11.0) return 'That circuit becomes the phase oracle.';
  if (t < ROUND0) return 'Superposition: all 16 (x, y) pairs start equal.';
  if (t < MEASURE_AT)
    return 'The phase oracle flips the answer below zero; the diffuser reflects every bar about the average.';
  return `Squaring each amplitude gives its probability: ${FINAL_P}% for the answer, ${100 - FINAL_P}% shared by the rest.`;
}

export function QlangDemo() {
  const { ref, playing, toggle, running } = useDemoPlayback();
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  // Viewers who prefer reduced motion start paused on the compiled circuit.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tRef.current = 8.6 - FAST_END / 2;
      setT(tRef.current);
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      tRef.current = (tRef.current + Math.min(0.1, (now - last) / 1000)) % REAL_LOOP;
      last = now;
      setT(tRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <div ref={ref}>
      <DemoFrame label="qlang · rule → circuit → Grover search" playing={playing} onToggle={toggle}
        caption={captionAt(sceneTime(t))}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img"
          aria-label="qlang compiling x + y == 6 into an expression tree and a quantum circuit, then finding x = 3, y = 3 with Grover search">
          <Scene t={sceneTime(t)} />
        </svg>
      </DemoFrame>
    </div>
  );
}
