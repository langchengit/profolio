import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems } from '../data/nav';
import { useScrollSpy, useScrolled } from '../lib/hooks';
import { ThemeToggle } from './ThemeToggle';
import { PalettePicker } from './PalettePicker';

const LINK = 'font-mono text-[0.7rem] uppercase tracking-[0.18em] transition';

/** The logo links home and the CTA links to contact, so those two drop out of
 *  the link row (the mobile menu still lists everything). */
const linkItems = navItems.filter((n) => n.id !== 'home' && n.id !== 'contact');

export function Header() {
  const [open, setOpen] = useState(false);
  const ids = navItems.map((n) => n.id);
  const active = useScrollSpy(ids);
  const scrolled = useScrolled();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`transition-colors duration-300 ${scrolled ? 'bg-bg' : 'bg-transparent'}`}>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4 sm:px-12 lg:max-w-none lg:px-16">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="flex items-center gap-3">
              <PalettePicker />
              <ThemeToggle />
            </div>
            <a
              href="#home"
              onClick={() => setOpen(false)}
              aria-label="Home"
              className="flex items-center gap-3"
            >
              <span className="h-5 w-5 rounded-full bg-accent" />
            </a>
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <nav className="hidden items-center gap-7 lg:flex">
              {linkItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${LINK} ${
                    active === item.id ? 'text-accent' : 'text-muted hover:text-text'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a href="#contact" className="btn-cta hidden sm:inline-flex">
                Talk to me
              </a>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={open}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text backdrop-blur lg:hidden"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-y border-border bg-bg lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`${LINK} block border-b border-border px-8 py-4 last:border-b-0 sm:px-12 ${
                active === item.id ? 'text-accent' : 'text-muted'
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
