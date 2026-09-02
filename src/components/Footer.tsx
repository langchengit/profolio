import { ArrowUp } from 'lucide-react';
import { personal } from '../data/resume';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-8 py-10 sm:flex-row sm:px-12 lg:px-16">
        <p className="text-sm text-muted">
          © {year} {personal.name}. Built with React &amp; Three.js.
        </p>
        <a
          href="#home"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-accent"
        >
          Back to top <ArrowUp size={15} />
        </a>
      </div>
    </footer>
  );
}
