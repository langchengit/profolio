import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionProps {
  id: string;
  index: string;
  kicker: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Consistent section frame: numbered kicker, big title, then content. */
export function Section({ id, index, kicker, title, children, className = '' }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-5xl scroll-mt-24 px-8 py-24 sm:px-12 md:py-32 lg:px-16 ${className}`}
    >
      <Reveal className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-accent">
          <span>{index}</span>
          <span className="h-px w-10 bg-accent/50" />
          <span>{kicker}</span>
        </div>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}
