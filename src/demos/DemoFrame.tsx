import type { ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';

/** Square, hairline-bordered box shared by the project demos: an optional row
 *  of step tabs and a play/pause control on top, the drawing, then a one-line
 *  caption. */
export function DemoFrame({
  label,
  tabs,
  active,
  onTab,
  playing,
  onToggle,
  caption,
  children,
}: {
  label: string;
  tabs?: string[];
  active?: number;
  onTab?: (i: number) => void;
  playing: boolean;
  onToggle: () => void;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="mt-6 border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 font-serif text-[11px] uppercase tracking-[0.16em]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-faint">{label}</span>
          {tabs?.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab?.(i)}
              className={`cursor-pointer uppercase tracking-[0.16em] transition hover:text-accent ${
                i === active ? 'text-accent' : 'text-muted'
              }`}
            >
              {String(i + 1).padStart(2, '0')} {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? 'Pause animation' : 'Play animation'}
          className="shrink-0 cursor-pointer p-1 text-muted transition hover:text-accent"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
      </div>
      {children}
      <figcaption className="min-h-[3.25rem] border-t border-border px-4 py-2.5 text-sm leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
