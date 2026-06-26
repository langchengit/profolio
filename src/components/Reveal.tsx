import type { ReactNode } from 'react';
import { useInView } from '../lib/hooks';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Wraps content so it fades/slides in the first time it scrolls into view. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
