import { ArrowDown, Mail, MapPin } from 'lucide-react';
import { contact, personal } from '../data/resume';
import { LinkedinIcon } from './BrandIcons';
import { MazeProvider, MazeCanvas, MazeControls } from '../three/Maze';

export function Hero() {
  const [headlineRaw, ...rest] = personal.tagline.split('—');
  const headline = headlineRaw.trim();
  const sub = rest.join('—').trim();

  return (
    <MazeProvider>
    <section
      id="home"
      className="relative flex min-h-[100svh] items-end px-6 pb-28 lg:items-center lg:pb-0"
    >
      {/* Full-hero transparent canvas — left column at z-10 wins pointer events over canvas at z-2 */}
      <div className="pointer-events-auto absolute inset-0 z-2 hidden lg:block">
        <MazeCanvas />
      </div>

      {/* Controls: above canvas (z-20 > canvas z-2) so buttons are clickable */}
      <div className="pointer-events-none absolute bottom-10 right-0 z-20 hidden w-1/2 lg:block">
        <MazeControls />
      </div>

      {/* pointer-events-none on wrapper so the right-half canvas receives events;
          left column restores pointer-events-auto for its links/buttons */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">

          {/* Left column — text */}
          <div className="pointer-events-auto hero-legible">
            <div
              className="intro mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted backdrop-blur"
              style={{ animationDelay: '0.05s' }}
            >
              <MapPin size={13} className="text-accent" /> {personal.location}
            </div>

            <h1
              className="intro font-display font-bold leading-[1.05] tracking-tight"
              style={{
                animationDelay: '0.12s',
                fontSize: 'clamp(3rem, 3.5vw + 2rem, 6rem)',
              }}
            >
              {personal.name}
            </h1>

            <p
              className="intro mt-5 text-xl font-medium sm:text-2xl"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-gradient">{headline}</span>
            </p>

            {/* The sub-tagline points at the maze, so it hides below `lg` — the
                same breakpoint that hides MazeCanvas above. */}
            {sub && (
              <p
                className="intro mt-4 hidden max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:block"
                style={{ animationDelay: '0.28s' }}
              >
                {sub}
              </p>
            )}

            <div
              className="intro mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.36s' }}
            >
              <a href="#projects" className="btn btn-ghost">
                View my work
              </a>
              <a href="#contact" className="btn btn-ghost">
                Get in touch
              </a>
            </div>

            <div
              className="intro mt-8 flex flex-wrap items-center gap-5"
              style={{ animationDelay: '0.44s' }}
            >
              <a
                href={`mailto:${contact.email}`}
                aria-label="Email"
                className="text-muted transition hover:text-accent"
              >
                <Mail size={20} />
              </a>
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="text-muted transition hover:text-accent"
                >
                  <LinkedinIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Right column — empty spacer; canvas + controls are absolute overlays */}
          <div aria-hidden="true" />

        </div>
      </div>

      <a
        href="#experience"
        aria-label="Scroll to content"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-muted transition hover:text-accent lg:block"
      >
        <ArrowDown size={20} className="animate-bounce" />
      </a>
    </section>
    </MazeProvider>
  );
}
