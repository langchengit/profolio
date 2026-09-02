import type { ReactNode } from 'react';
import { renderBulletText } from '../lib/bullets';
import { Reveal } from './Reveal';

/** Shared building blocks for the bordered, hairline-ruled section panels:
 *  a mono meta row, a display title with a right-aligned aside, numbered
 *  cells, and square tags. Every section is assembled from these so the
 *  sections stay in step with each other. */

const META = 'font-mono text-[0.7rem] uppercase tracking-[0.18em]';

/** Outer frame. Rows inside separate themselves with their own top border. */
export function Panel({ children }: { children: ReactNode }) {
  return <div className="border border-border bg-bg">{children}</div>;
}

interface PanelRowProps {
  /** Position in the panel: drives the divider and where the rail line starts. */
  index: number;
  /** Draw the connecting line, turning the node squares into one timeline.
   *  Only meaningful for date-ordered sections. */
  line?: boolean;
  children: ReactNode;
}

/** One row of a panel: a left gutter carrying the accent node (and optionally
 *  the timeline line) plus the content column.
 *
 *  The vertical padding lives on the content column rather than the article, so
 *  the line spans the row edge to edge and joins up with the next row's. The
 *  offsets below are that padding (1.5rem / 2rem) plus half a meta row, which
 *  puts the node square on the meta line. */
export function PanelRow({ index, line = false, children }: PanelRowProps) {
  return (
    <Reveal delay={index * 60}>
      <article
        className={`flex gap-4 px-6 sm:gap-5 sm:px-8 ${
          index > 0 ? 'border-t border-border' : ''
        }`}
      >
        <div className="relative w-2 shrink-0" aria-hidden="true">
          {line && (
            <span
              className={`absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-border ${
                index === 0 ? 'top-[calc(1.5rem+9px)] sm:top-[calc(2rem+9px)]' : 'top-0'
              }`}
            />
          )}
          <span className="absolute left-1/2 top-[calc(1.5rem+5px)] h-2 w-2 -translate-x-1/2 bg-accent sm:top-[calc(2rem+5px)]" />
        </div>
        <div className="min-w-0 flex-1 py-6 sm:py-8">{children}</div>
      </article>
    </Reveal>
  );
}

/** Mono kicker line: accent on the left, faint on the right. */
export function MetaRow({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 ${META}`}>
      <span className="text-accent">{left}</span>
      {right && <span className="text-faint">{right}</span>}
    </div>
  );
}

export function TitleRow({ title, aside }: { title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
      <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        {title}
      </h3>
      {aside && (
        <div className="shrink-0 text-sm text-muted sm:max-w-[18rem] sm:text-right">{aside}</div>
      )}
    </div>
  );
}

/** Column count for a numbered grid, chosen so the last row isn't left with a
 *  single orphan cell (4 items read better as 2x2 than as 3+1). */
function gridCols(n: number): string {
  if (n === 1) return '';
  if (n === 4 || n === 2) return 'sm:grid-cols-2';
  return 'sm:grid-cols-2 lg:grid-cols-3';
}

/** Numbered cells. Rules come from the cells (right + bottom) plus the grid's
 *  own top + left edge, so a part-filled last row stays tidy. */
export function NumberedGrid({ items }: { items: ReactNode[] }) {
  return (
    <div className={`grid border-l border-t border-border ${gridCols(items.length)}`}>
      {items.map((item, i) => (
        <div key={i} className="border-b border-r border-border p-5">
          <span className="font-mono text-xs text-accent">
            {String(i + 1).padStart(2, '0')}
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted sm:mt-7">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
      {children}
    </span>
  );
}

export function TagRow({
  children,
  className = 'mt-6',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-wrap gap-2 ${className}`}>{children}</div>;
}

interface BulletGroup {
  /** Sub-list heading (a bullet ending in ':'), or null when unlabelled. */
  label: string | null;
  items: string[];
}

/** Bullets are authored as a flat list where a trailing ':' opens a sub-list.
 *  Split that into an intro paragraph plus the numbered groups below it. */
function splitBullets(bullets: string[]): { lede: string[]; groups: BulletGroup[] } {
  const lede: string[] = [];
  const groups: BulletGroup[] = [];
  for (const b of bullets) {
    if (b.trim().endsWith(':')) {
      groups.push({ label: b.trim().replace(/:$/, ''), items: [] });
    } else if (groups.length) {
      groups[groups.length - 1].items.push(b);
    } else {
      lede.push(b);
    }
  }
  // No sub-lists at all: the first bullet reads as the intro, the rest get numbered.
  if (!groups.length && lede.length > 1) {
    return { lede: lede.slice(0, 1), groups: [{ label: null, items: lede.slice(1) }] };
  }
  return { lede, groups };
}

/** Renders a bullet list as an intro paragraph plus labelled numbered grids. */
export function BulletBody({ bullets }: { bullets: string[] }) {
  const { lede, groups } = splitBullets(bullets);
  return (
    <>
      {lede.map((b, i) => (
        <p key={i} className="mt-4 max-w-2xl leading-relaxed text-muted">
          {renderBulletText(b)}
        </p>
      ))}
      {groups.map((g, i) => (
        <div key={i} className="mt-6">
          {g.label && <p className={`mb-3 text-muted ${META}`}>{renderBulletText(g.label)}</p>}
          <NumberedGrid items={g.items.map((b) => renderBulletText(b))} />
        </div>
      ))}
    </>
  );
}

/** Numbered rows stacked vertically inside one square-edged box. For short
 *  entries, where the grid's tall cells leave too much empty space. */
export function NumberedList({ items }: { items: ReactNode[] }) {
  return (
    <div className="border border-border">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}
        >
          <span className="shrink-0 font-mono text-xs leading-relaxed text-accent">
            {String(i + 1).padStart(2, '0')}
          </span>
          <p className="text-sm leading-relaxed text-muted">{item}</p>
        </div>
      ))}
    </div>
  );
}
