import { useEffect, useMemo, useRef, useState } from 'react';
import { DemoFrame } from './DemoFrame';
import { useDemoPlayback } from './useDemoPlayback';
import { createSim, SENSOR_AHEAD, SENSOR_SIDE, VIEW_H, VIEW_W, type Action } from './lineFollower';

const TRAIL = 160;

const ACTION_TEXT: Record<Action, string> = {
  forward: 'Forward, both wheels at PWM 65',
  'pivot-left': 'Pivot left, left wheel 0 / right 65',
  'pivot-right': 'Pivot right, left wheel 65 / right 0',
};

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 align-middle ${on ? 'bg-accent' : 'border border-border-strong'}`}
    />
  );
}

/** Top-down view of the car running the sketch's two-sensor bang-bang loop. */
export function LineFollowerDemo() {
  const sim = useMemo(() => createSim(), []);
  const trackPath = useMemo(
    () => sim.track.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('') + 'Z',
    [sim],
  );
  const carRef = useRef<SVGGElement>(null);
  const sensorLRef = useRef<SVGRectElement>(null);
  const sensorRRef = useRef<SVGRectElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const trail = useRef<string[]>([]);
  const { ref, playing, toggle, running } = useDemoPlayback();
  const [readout, setReadout] = useState({ l: false, r: false, action: 'forward' as Action });

  // Draw the current state straight into the SVG; React only re-renders the readout.
  const draw = () => {
    const c = sim.car;
    carRef.current?.setAttribute(
      'transform',
      `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) rotate(${((c.heading * 180) / Math.PI).toFixed(2)})`,
    );
    sensorLRef.current?.setAttribute('class', c.sensorL ? 'fill-accent' : 'fill-bg stroke-border-strong');
    sensorRRef.current?.setAttribute('class', c.sensorR ? 'fill-accent' : 'fill-bg stroke-border-strong');
    trailRef.current?.setAttribute('points', trail.current.join(' '));
  };

  useEffect(draw);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let lastReadout = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim.step(dt);
      const c = sim.car;
      trail.current.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`);
      if (trail.current.length > TRAIL) trail.current.shift();
      draw();
      if (now - lastReadout > 120) {
        lastReadout = now;
        setReadout((r) =>
          r.l === c.sensorL && r.r === c.sensorR && r.action === c.action
            ? r
            : { l: c.sensorL, r: c.sensorR, action: c.action },
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sim]);

  return (
    <div ref={ref}>
      <DemoFrame
        label="Simulation · line following"
        playing={playing}
        onToggle={toggle}
        caption={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-serif text-xs uppercase tracking-[0.14em]">
              IR L <Dot on={readout.l} /> R <Dot on={readout.r} />
            </span>
            <span>
              {ACTION_TEXT[readout.action]}.{' '}
              <span className="text-faint">
                A sensor on the tape stops its side's wheel; otherwise the motors keep their last
                command.
              </span>
            </span>
          </span>
        }
      >
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" role="img"
          aria-label="Top-down simulation of a two-sensor line-following car on a closed track">
          <path d={trackPath} className="fill-none stroke-text" strokeWidth={7} strokeLinejoin="round" opacity={0.85} />
          <polyline ref={trailRef} className="fill-none stroke-accent" strokeWidth={1.25} opacity={0.6} />
          <g ref={carRef}>
            {/* wheels */}
            <rect x={-5} y={-11} width={10} height={3.5} className="fill-muted" />
            <rect x={-5} y={7.5} width={10} height={3.5} className="fill-muted" />
            {/* chassis, pointing +x */}
            <rect x={-9} y={-7.5} width={24} height={15} className="fill-bg stroke-text" strokeWidth={1.25} />
            <line x1={0} y1={-7.5} x2={0} y2={7.5} className="stroke-border-strong" strokeWidth={1} />
            {/* IR sensors: left is -y in the car's frame */}
            <rect ref={sensorLRef} x={SENSOR_AHEAD - 2} y={-SENSOR_SIDE - 2} width={4} height={4} strokeWidth={1} />
            <rect ref={sensorRRef} x={SENSOR_AHEAD - 2} y={SENSOR_SIDE - 2} width={4} height={4} strokeWidth={1} />
          </g>
        </svg>
      </DemoFrame>
    </div>
  );
}
