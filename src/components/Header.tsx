import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems } from '../data/nav';
import { useScrollSpy, useScrolled } from '../lib/hooks';
import { ThemeToggle } from './ThemeToggle';
import { PalettePicker } from './PalettePicker';

const LINK = 'font-mono text-xs uppercase tracking-[0.18em] transition';

/** The logo links home and the CTA links to contact, so those two drop out of
 *  the link row (the mobile menu still lists everything). */
const linkItems = navItems.filter((n) => n.id !== 'home' && n.id !== 'contact');

export function Header() {
  const [open, setOpen] = useState(false);
  const ids = navItems.map((n) => n.id);
  const active = useScrollSpy(ids);
  const scrolled = useScrolled();

  // While the mobile menu is open: Escape closes it, the page behind doesn't
  // scroll, and widening past `lg` (where the menu is hidden) closes it too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const mql = window.matchMedia('(min-width: 56.25rem)');
    const onWide = () => mql.matches && setOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    mql.addEventListener('change', onWide);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      mql.removeEventListener('change', onWide);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-colors duration-300 ${
          solid
            ? 'border-border bg-bg/85 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-4 sm:px-12 lg:max-w-none lg:px-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <PalettePicker />
              <ThemeToggle />
            </div>
            <a
              href="#home"
              onClick={() => setOpen(false)}
              aria-label="Home"
              className="inline-flex h-10 w-10 items-center justify-center"
            >
              <span className="h-5 w-5 rounded-full bg-accent" />
            </a>
          </div>

          <div className="flex items-center gap-6 xl:gap-8">
            {/* Tighter spacing from `lg` (56.25rem) up to `xl`, so the links clear the
                logo on small-laptop and landscape-tablet widths. */}
            <nav aria-label="Sections" className="hidden items-center gap-4 lg:flex xl:gap-7">
              {linkItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`${LINK} py-2 lg:tracking-[0.12em] xl:tracking-[0.18em] ${
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
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="inline-flex h-10 w-10 items-center justify-center border border-border bg-surface text-text backdrop-blur transition hover:border-accent hover:text-accent lg:hidden"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Always mounted so it can animate; `inert` keeps the collapsed links out
          of the tab order and the accessibility tree. */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <nav aria-label="Menu" className="overflow-hidden">
          <div className="border-b border-border bg-bg">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === item.id ? 'true' : undefined}
                className={`${LINK} block border-b border-border px-8 py-4 last:border-b-0 sm:px-12 ${
                  active === item.id ? 'text-accent' : 'text-muted hover:text-text'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
