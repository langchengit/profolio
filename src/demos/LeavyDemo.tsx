import { useEffect, useRef, useState } from 'react';
import { DemoFrame } from './DemoFrame';
import { useDemoPlayback } from './useDemoPlayback';

/** Leavy's core idea on a timeline: leave by = event start − grace − travel.
 *  A live-traffic update pushes the leave time earlier, the status changes
 *  with the same thresholds as leavy-web's `timingFor` (15 min → "Leave soon",
 *  0 → "Leave now"), the alert fires, and the trip arrives with the grace
 *  period to spare. Everything is a pure function of one clock `t` (seconds). */

const W = 760;
const H = 210;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const LOOP = 16.4;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// Clock: minutes after 1:30 PM. The event starts at 2:30 PM (minute 60).
const EVENT_START = 60;
const EVENT_END = 85;
const GRACE = 10;
const TRAVEL_BEFORE = 20;
const TRAVEL_AFTER = 27; // after the live-traffic update
const SOON_MIN = 15; // leavy-web: under 15 min to leave → "Leave soon"

const X0 = 50;
const X1 = W - 30;
const xOf = (min: number) => X0 + (min / 90) * (X1 - X0);
const LANE_Y = 128;
const LANE_H = 20;

function clock(min: number): string {
  const total = 13 * 60 + 30 + Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} PM`;
}

// ─── timeline (scene seconds) ────────────────────────────────────────────────
const NOW_IN = 2.2;
const NOW_START = 5; // 1:35 PM
const TRAFFIC_AT = 4.2;
const LEAVE_AT = 8.5;
const DEPART_AT = 9.5;
const ARRIVE_AT = 12.5;
const FADE_OUT = 15.6;

function nowMin(t: number, leaveBy: number): number {
  if (t < LEAVE_AT) return lerp(NOW_START, leaveBy, clamp((t - NOW_IN) / (LEAVE_AT - NOW_IN)));
  if (t < DEPART_AT) return leaveBy;
  return lerp(leaveBy, EVENT_START - GRACE, seg(t, DEPART_AT, ARRIVE_AT));
}

type Status = { label: string; detail: string; cls: string };
function statusAt(now: number, leaveBy: number, travel: number): Status {
  const toLeave = leaveBy - now;
  const lateBy = Math.max(0, now + travel - EVENT_START);
  if (toLeave > SOON_MIN) return { label: 'On track', detail: `Leave in ${Math.round(toLeave)} min`, cls: 'fill-text' };
  if (toLeave > 0.5) return { label: 'Leave soon', detail: `Leave in ${Math.round(toLeave)} min`, cls: 'fill-accent' };
  if (lateBy < 1) return { label: 'Leave now', detail: `Leave at ${clock(leaveBy)}`, cls: 'fill-accent-2' };
  return { label: 'Running late', detail: `${Math.round(lateBy)} min late`, cls: 'fill-accent-2' };
}

function Scene({ t }: { t: number }) {
  const all = 1 - seg(t, FADE_OUT, FADE_OUT + 0.6);
  const axisIn = seg(t, 0, 0.5);
  const graceGrow = seg(t, 0.5, 1.1);
  const travelGrow = seg(t, 1.1, 2.0);
  const traffic = seg(t, TRAFFIC_AT, TRAFFIC_AT + 0.7);
  const travel = lerp(TRAVEL_BEFORE, TRAVEL_AFTER, traffic);
  const leaveBy = EVENT_START - GRACE - travel;
  const graceStart = EVENT_START - GRACE * graceGrow;
  const travelStart = EVENT_START - GRACE - travel * travelGrow;
  const markerIn = seg(t, 1.9, 2.3);
  const nowIn = seg(t, NOW_IN, NOW_IN + 0.3);
  const now = nowMin(t, leaveBy);
  const status: Status =
    t >= DEPART_AT
      ? { label: 'On the way', detail: `Arriving ${clock(EVENT_START - GRACE)}, ${GRACE} min early`, cls: 'fill-text' }
      : statusAt(now, leaveBy, travel);
  const trafficTag = seg(t, TRAFFIC_AT, TRAFFIC_AT + 0.3) * (1 - seg(t, TRAFFIC_AT + 2.2, TRAFFIC_AT + 2.6));
  const alert = seg(t, LEAVE_AT, LEAVE_AT + 0.35) * (1 - seg(t, ARRIVE_AT - 0.2, ARRIVE_AT + 0.2));
  const driving = t >= DEPART_AT && t < ARRIVE_AT + 0.1;
  const arrived = seg(t, ARRIVE_AT, ARRIVE_AT + 0.4);
  const formulaIn = seg(t, 1.0, 1.6);

  return (
    <g opacity={all}>
      {/* status, as Leavy shows it */}
      <g opacity={nowIn * (1 - arrived)} fontFamily={MONO} fontSize={14}>
        <text x={X0} y={30} fontWeight={700} className={status.cls}>{status.label}</text>
        <text x={X0 + 120} y={30} className="fill-muted">{status.detail}</text>
      </g>
      <text x={X0} y={30} fontFamily={MONO} fontSize={14} fontWeight={700} className="fill-accent" opacity={arrived}>
        Arrived {clock(EVENT_START - GRACE)} · {GRACE} min early
      </text>

      {/* the alert */}
      {alert > 0 && (
        <g opacity={alert} transform={`translate(0 ${(1 - alert) * -8})`}>
          <rect x={W - 290} y={10} width={260} height={30} className="fill-bg stroke-accent-2" strokeWidth={1.5} />
          <text x={W - 278} y={30} fontFamily={MONO} fontSize={12.5} className="fill-text">
            <tspan fontWeight={700} className="fill-accent-2">Time to leave</tspan> for Lecture
          </text>
        </g>
      )}

      {/* the formula, with today's numbers */}
      <text x={X0} y={60} fontFamily={MONO} fontSize={12.5} className="fill-muted" opacity={formulaIn}>
        leave by = {clock(EVENT_START)} − {GRACE} min grace − <tspan className="fill-accent" fontWeight={700}>
          {Math.round(travel)} min drive</tspan> = <tspan className="fill-text" fontWeight={700}>{clock(leaveBy)}</tspan>
      </text>

      {/* lane: travel, grace, event */}
      <g opacity={axisIn}>
        <rect x={xOf(EVENT_START)} y={LANE_Y - LANE_H / 2} width={xOf(EVENT_END) - xOf(EVENT_START)} height={LANE_H}
          className="fill-bg stroke-text" strokeWidth={1.5} />
        <text x={xOf(EVENT_START) + 8} y={LANE_Y + 4.5} fontFamily={MONO} fontSize={12} fontWeight={700} className="fill-text">
          Lecture
        </text>
      </g>
      {graceGrow > 0 && (
        <g>
          <rect x={xOf(graceStart)} y={LANE_Y - LANE_H / 2} width={xOf(EVENT_START) - xOf(graceStart)} height={LANE_H}
            className="fill-muted" opacity={0.3} />
          <text x={(xOf(graceStart) + xOf(EVENT_START)) / 2} y={LANE_Y - 18} textAnchor="middle" fontSize={11}
            letterSpacing="0.1em" className="fill-faint font-serif uppercase" opacity={graceGrow}>grace</text>
        </g>
      )}
      {travelGrow > 0 && (
        <g>
          <rect x={xOf(travelStart)} y={LANE_Y - LANE_H / 2} width={xOf(EVENT_START - GRACE) - xOf(travelStart)}
            height={LANE_H} className="fill-accent" opacity={0.28} />
          <rect x={xOf(travelStart)} y={LANE_Y - LANE_H / 2} width={xOf(EVENT_START - GRACE) - xOf(travelStart)}
            height={LANE_H} className="fill-none stroke-accent" strokeWidth={1.2} />
          <text x={(xOf(travelStart) + xOf(EVENT_START - GRACE)) / 2} y={LANE_Y - 18} textAnchor="middle" fontSize={11}
            letterSpacing="0.1em" className="fill-accent font-serif uppercase" opacity={travelGrow}>
            drive (live traffic)
          </text>
        </g>
      )}
      {trafficTag > 0 && (
        <text x={xOf(leaveBy) - 8} y={LANE_Y + 5} textAnchor="end" fontFamily={MONO} fontSize={12} fontWeight={700}
          className="fill-accent-2" opacity={trafficTag}>traffic +{TRAVEL_AFTER - TRAVEL_BEFORE} min</text>
      )}

      {/* leave-by marker */}
      <g opacity={markerIn}>
        <line x1={xOf(leaveBy)} x2={xOf(leaveBy)} y1={LANE_Y - 26} y2={LANE_Y + 22} className="stroke-accent" strokeWidth={2} />
      </g>

      {/* car on the road */}
      {driving && (
        <g transform={`translate(${xOf(now)} ${LANE_Y})`}>
          <rect x={-9} y={-6} width={18} height={12} className="fill-text" />
          <rect x={3} y={-4} width={4} height={8} className="fill-bg" />
        </g>
      )}

      {/* now cursor */}
      <g opacity={nowIn * (1 - arrived)}>
        <line x1={xOf(now)} x2={xOf(now)} y1={94} y2={LANE_Y + 22} className="stroke-text" strokeWidth={1.2}
          strokeDasharray="3 3" />
        <text x={xOf(now)} y={88} textAnchor="middle" fontFamily={MONO} fontSize={11} className="fill-text">
          now {clock(now)}
        </text>
      </g>

      {/* axis */}
      <g opacity={axisIn}>
        <line x1={X0} x2={X1} y1={LANE_Y + 34} y2={LANE_Y + 34} className="stroke-border-strong" strokeWidth={1} />
        {[0, 15, 30, 45, 60, 75, 90].map((m) => (
          <g key={m}>
            <line x1={xOf(m)} x2={xOf(m)} y1={LANE_Y + 30} y2={LANE_Y + 38} className="stroke-border-strong" strokeWidth={1} />
            <text x={xOf(m)} y={LANE_Y + 54} textAnchor="middle" fontFamily={MONO} fontSize={10.5}
              className={m === EVENT_START ? 'fill-text' : 'fill-faint'}>{clock(m)}</text>
          </g>
        ))}
      </g>
    </g>
  );
}

function captionAt(t: number): string {
  if (t < TRAFFIC_AT) return 'Leavy reads your calendar and works backward from the event: start time, minus a grace period, minus live travel time.';
  if (t < LEAVE_AT) return 'Traffic picks up, so the drive takes longer and the leave time moves earlier.';
  if (t < ARRIVE_AT) return 'At the leave time you get an alert, and you head out.';
  return 'You arrive with the grace period to spare.';
}

export function LeavyDemo() {
  const { ref, playing, toggle, running } = useDemoPlayback();
  const [t, setT] = useState(0);
  const tRef = useRef(0);

  // Viewers who prefer reduced motion start paused after the traffic update.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tRef.current = 6.5;
      setT(6.5);
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      tRef.current = (tRef.current + Math.min(0.1, (now - last) / 1000)) % LOOP;
      last = now;
      setT(tRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <div ref={ref}>
      <DemoFrame label="Leavy · when to leave" playing={playing} onToggle={toggle} caption={captionAt(t)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img"
          aria-label="Timeline showing Leavy working out when to leave for a 2:30 PM lecture, adjusting for traffic, and sending an alert">
          <Scene t={t} />
        </svg>
      </DemoFrame>
    </div>
  );
}
