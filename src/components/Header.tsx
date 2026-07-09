import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems } from '../data/nav';
import { useScrollSpy } from '../lib/hooks';
import { ThemeToggle } from './ThemeToggle';
import { PalettePicker } from './PalettePicker';

export function Header() {
  const [open, setOpen] = useState(false);
  const ids = navItems.map((n) => n.id);
  const active = useScrollSpy(ids);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:max-w-none lg:px-14">
        <a
          href="#home"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5"
        >
          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-accent via-accent-2 to-accent-3 shadow-[0_0_18px_-2px_var(--accent)]" />
          
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 backdrop-blur-md md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`rounded-full px-3.5 py-1.5 text-sm lg:text-base transition ${
                active === item.id
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted hover:text-text'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <PalettePicker />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text backdrop-blur md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface-strong p-2 backdrop-blur-xl md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm transition ${
                active === item.id ? 'bg-accent/15 text-accent' : 'text-muted'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
