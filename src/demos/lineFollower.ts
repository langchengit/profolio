/** A small 2D simulation of the line-following loop in
 *  github.com/langchengit/engineering-car-project (code/car_testing.ino).
 *
 *  The controller is a generator that mirrors the Arduino `loop()`: it yields
 *  the length of each `delay()` while the motors keep whatever speeds it last
 *  set, exactly like the real board. Units are SVG px and seconds. */

export const VIEW_W = 600;
export const VIEW_H = 220;

/** Half the width of the black tape. */
export const LINE_HALF = 3.5;
/** Distance between the two drive wheels. */
const AXLE = 16;
/** IR sensors sit ahead of the axle, one either side of the tape. */
export const SENSOR_AHEAD = 13;
export const SENSOR_SIDE = 6;

/** PWM duty → px/s. The sketch drives both wheels at PWM 65. */
const PX_PER_PWM = 0.85;
const SPEED = 65;
/** `delaytime` in the sketch: how long each forward nudge / pivot lasts. */
const DELAY_MS = 115;
/** `delay(25)` after each ultrasonic ping at the top of loop(). */
const LOOP_MS = 25;

export type Pt = { x: number; y: number };

/** Closed track, sampled as a polyline: a stadium with round ends, two bumps
 *  along the top and a dip along the bottom, so the car corrects both ways. */
export function buildTrack(): Pt[] {
  const R = 74;
  const cy = VIEW_H / 2;
  const x0 = 40 + R;
  const x1 = VIEW_W - 40 - R;
  const pts: Pt[] = [];
  const N = 120;
  // bottom, left → right, one dip
  for (let i = 0; i < N; i++) {
    const u = i / N;
    pts.push({ x: x0 + (x1 - x0) * u, y: cy + R - 16 * (1 - Math.cos(2 * Math.PI * u)) / 2 });
  }
  // right end
  for (let i = 0; i < 60; i++) {
    const a = Math.PI / 2 - (i / 60) * Math.PI;
    pts.push({ x: x1 + R * Math.cos(a), y: cy + R * Math.sin(a) });
  }
  // top, right → left, two bumps
  for (let i = 0; i < N; i++) {
    const u = i / N;
    pts.push({ x: x1 - (x1 - x0) * u, y: cy - R + 14 * (1 - Math.cos(4 * Math.PI * u)) / 2 });
  }
  // left end
  for (let i = 0; i < 60; i++) {
    const a = -Math.PI / 2 - (i / 60) * Math.PI;
    pts.push({ x: x0 + R * Math.cos(a), y: cy + R * Math.sin(a) });
  }
  return pts;
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function onLine(track: Pt[], p: Pt): boolean {
  for (let i = 0; i < track.length; i++) {
    const a = track[i];
    // cheap reject before the exact segment test
    if (Math.abs(a.x - p.x) > 12 || Math.abs(a.y - p.y) > 12) continue;
    if (distToSegment(p, a, track[(i + 1) % track.length]) <= LINE_HALF) return true;
  }
  return false;
}

export type Action = 'forward' | 'pivot-left' | 'pivot-right';

export interface Car {
  x: number;
  y: number;
  /** Heading in radians, 0 = +x, increasing clockwise (SVG y points down). */
  heading: number;
  /** Wheel speeds in PWM units, as the sketch writes them. */
  left: number;
  right: number;
  action: Action;
  sensorL: boolean;
  sensorR: boolean;
}

export function sensorPoints(c: Car): { l: Pt; r: Pt } {
  const fx = Math.cos(c.heading);
  const fy = Math.sin(c.heading);
  // left of the heading, in screen space with y down, is (fy, -fx)
  const lx = fy;
  const ly = -fx;
  return {
    l: { x: c.x + fx * SENSOR_AHEAD + lx * SENSOR_SIDE, y: c.y + fy * SENSOR_AHEAD + ly * SENSOR_SIDE },
    r: { x: c.x + fx * SENSOR_AHEAD - lx * SENSOR_SIDE, y: c.y + fy * SENSOR_AHEAD - ly * SENSOR_SIDE },
  };
}

function setMotors(c: Car, action: Action) {
  c.action = action;
  if (action === 'forward') [c.left, c.right] = [SPEED, SPEED];
  // Pivot toward the side that saw the tape: stop that wheel, drive the other.
  else if (action === 'pivot-left') [c.left, c.right] = [0, SPEED];
  else [c.left, c.right] = [SPEED, 0];
}

/** The Arduino loop(), yielding each delay in ms. */
function* program(c: Car, track: Pt[]): Generator<number, never, void> {
  let leftTurning = false;
  let rightTurning = false;
  setMotors(c, 'forward');
  for (;;) {
    yield LOOP_MS; // ultrasonic ping + delay(25)

    const s = sensorPoints(c);
    c.sensorL = onLine(track, s.l);
    c.sensorR = onLine(track, s.r);

    if (c.sensorL && !c.sensorR) {
      rightTurning = false;
      // Changing turn state: roll forward a little before pivoting.
      if (!leftTurning) {
        setMotors(c, 'forward');
        yield DELAY_MS;
      }
      leftTurning = true;
      setMotors(c, 'pivot-left');
      yield DELAY_MS;
    }

    if (c.sensorR && !c.sensorL) {
      leftTurning = false;
      if (!rightTurning) {
        setMotors(c, 'forward');
        yield DELAY_MS;
      }
      rightTurning = true;
      setMotors(c, 'pivot-right');
      yield DELAY_MS;
    }
    // Neither (or both) sensors on tape: no branch runs, motors keep going.
  }
}

/** Differential-drive kinematics for `dt` seconds. */
function integrate(c: Car, dt: number) {
  const vl = c.left * PX_PER_PWM;
  const vr = c.right * PX_PER_PWM;
  const v = (vl + vr) / 2;
  // Right wheel faster turns the car left, i.e. counter-clockwise on screen.
  const w = (vl - vr) / AXLE;
  c.heading += w * dt;
  c.x += Math.cos(c.heading) * v * dt;
  c.y += Math.sin(c.heading) * v * dt;
}

export interface Sim {
  car: Car;
  track: Pt[];
  /** Advance by `dt` seconds of simulated time. */
  step(dt: number): void;
}

export function createSim(track = buildTrack()): Sim {
  // Start on the bottom of the loop, pointing along the track.
  const i0 = Math.floor(track.length / 4);
  const a = track[i0];
  const b = track[(i0 + 1) % track.length];
  const car: Car = {
    x: a.x,
    y: a.y,
    heading: Math.atan2(b.y - a.y, b.x - a.x),
    left: 0,
    right: 0,
    action: 'forward',
    sensorL: false,
    sensorR: false,
  };
  // Back the car up so the sensors, not the axle, start over the tape.
  car.x -= Math.cos(car.heading) * SENSOR_AHEAD;
  car.y -= Math.sin(car.heading) * SENSOR_AHEAD;

  const prog = program(car, track);
  let wait = prog.next().value / 1000;

  return {
    car,
    track,
    step(dt) {
      while (dt > 0) {
        const d = Math.min(dt, wait);
        integrate(car, d);
        dt -= d;
        wait -= d;
        if (wait <= 1e-9) wait = prog.next().value / 1000;
      }
    },
  };
}
