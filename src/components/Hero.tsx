import { Mail, MapPin } from 'lucide-react';
import { contact, personal } from '../data/resume';
import { useTypewriter } from '../lib/hooks';
import { LinkedinIcon } from './BrandIcons';
import { MazeProvider, MazeCanvas, MazeControls } from '../three/Maze';

export function Hero() {
  const [headlineRaw, ...rest] = personal.tagline.split('—');
  const headline = headlineRaw.trim();
  const sub = rest.join('—').trim();

  // Greeting and name are typed as one stream and split back by length, so the
  // caret hands off from the first line to the second.
  const { typed } = useTypewriter(personal.greeting + personal.name);
  const onName = typed.length > personal.greeting.length;
  const typedGreeting = typed.slice(0, personal.greeting.length);
  const typedName = typed.slice(personal.greeting.length);

  return (
    <MazeProvider>
    <section
      id="home"
      className="relative flex min-h-[100svh] items-end px-8 pb-28 sm:px-12 lg:items-center lg:px-16 lg:pb-0"
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
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-5xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">

          {/* Left column — text */}
          <div className="pointer-events-auto hero-legible">
            <div
              className="intro mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted backdrop-blur"
              style={{ animationDelay: '0.05s' }}
            >
              <MapPin size={13} className="text-accent" /> {personal.location}
            </div>

            <p
              className="intro font-mono text-sm uppercase tracking-[0.2em] text-muted sm:text-base"
              style={{ animationDelay: '0.12s' }}
              aria-hidden="true"
            >
              {typedGreeting}
              {!onName && <span className="caret" />}
            </p>

            {/* An invisible copy of the full name reserves the line box, so the
                rest of the hero doesn't jump as the name types in. */}
            <h1
              className="intro relative mt-2 font-display font-bold leading-[1.05] tracking-tight"
              style={{
                animationDelay: '0.12s',
                fontSize: 'clamp(3rem, 3.5vw + 2rem, 6rem)',
              }}
              aria-label={`${personal.greeting} ${personal.name}`}
            >
              <span className="invisible" aria-hidden="true">
                {personal.name}
              </span>
              <span className="absolute inset-0" aria-hidden="true">
                {typedName}
                {onName && <span className="caret" />}
              </span>
            </h1>

            <p
              className="intro mt-5 text-lg font-medium sm:text-xl"
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
              <a href="#projects" className="btn-cta">
                View my work
              </a>
              <a href="#contact" className="btn-cta">
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
    </section>
    </MazeProvider>
  );
}
