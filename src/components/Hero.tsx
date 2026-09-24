import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { contact, personal } from '../data/resume';
import { useMediaQuery, useTypewriter } from '../lib/hooks';
import { LinkedinIcon } from './BrandIcons';
import { MazeProvider, MazeCanvas, MazeControls } from '../three/Maze';

export function Hero() {
  const [headlineRaw, ...rest] = personal.tagline.split('—');
  const headline = headlineRaw.trim();
  const sub = rest.join('—').trim();

  // Greeting and name are typed as one stream and split back by length, so the
  // caret hands off from the first line to the second.
  const { typed } = useTypewriter(personal.greeting + personal.name);

  // Where the maze goes:
  //  - side:    landscape and >= `lg` (56.25rem) — text left, maze right.
  //  - stacked: portrait tablets / tall windows — maze in its own box below
  //             the text. (Side-by-side on a tall screen blows the maze up,
  //             since the camera frames it by height.)
  //  - none:    phones — no WebGL canvas mounted at all.
  const side = useMediaQuery('(min-width: 56.25rem) and (orientation: landscape)');
  const roomy = useMediaQuery('(min-width: 40rem) and (min-height: 43.75rem)');
  const mode = side ? 'side' : roomy ? 'stacked' : 'none';
  const onName = typed.length > personal.greeting.length;
  const typedGreeting = typed.slice(0, personal.greeting.length);
  const typedName = typed.slice(personal.greeting.length);

  return (
    <MazeProvider>
    <section
      id="home"
      className={`relative flex min-h-[100svh] px-8 sm:px-12 lg:px-16 ${
        mode === 'side'
          ? 'items-center'
          : mode === 'stacked'
            ? 'flex-col justify-center pb-16 pt-28'
            : 'items-end pb-28 pt-24 sm:pt-28'
      }`}
    >
      {/* Full-hero transparent canvas — left column at z-10 wins pointer events over canvas at z-2 */}
      {mode === 'side' && (
        <>
          <div className="pointer-events-auto absolute inset-0 z-2">
            <MazeCanvas />
          </div>

          {/* Controls: above canvas (z-20 > canvas z-2) so buttons are clickable */}
          <div className="pointer-events-none absolute bottom-10 right-0 z-20 w-1/2">
            <MazeControls />
          </div>
        </>
      )}

      {/* pointer-events-none on wrapper so the right-half canvas receives events;
          left column restores pointer-events-auto for its links/buttons */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-5xl">
        <div className={`grid items-center gap-10 ${mode === 'side' ? 'grid-cols-2' : ''}`}>

          {/* Left column — text */}
          <div className="pointer-events-auto hero-legible">
            {/* flex-col + items-start: two stacked pills, each sized to its own
                content rather than the adjacent-inline-elements default. */}
            <div className="mb-6 flex flex-col items-start gap-3">
              <div
                className="intro inline-flex items-center gap-2 border border-border bg-surface px-3.5 py-1.5 text-xs text-muted backdrop-blur"
                style={{ animationDelay: '0s' }}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                {personal.availability}
              </div>

              <div
                className="intro inline-flex items-center gap-2 border border-border bg-surface px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted backdrop-blur"
                style={{ animationDelay: '0.05s' }}
              >
                <MapPin size={13} className="text-accent" /> {personal.location}
              </div>
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

            {/* The sub-tagline points at the maze, so it only shows when there is one. */}
            {sub && mode !== 'none' && (
              <p
                className="intro mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
                style={{ animationDelay: '0.28s' }}
              >
                {sub}
              </p>
            )}

            <div
              className="intro mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.36s' }}
            >
              <a
                href="https://resume.minglanging.com/"
                target="_blank"
                rel="noreferrer"
                className="btn-cta"
              >
                View my resume <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <a href="#contact" className="btn-cta btn-cta-reverse">
                Get in touch
              </a>
            </div>

            <div
              className="intro mt-8 flex flex-wrap items-center gap-6"
              style={{ animationDelay: '0.44s' }}
            >
              <a
                href={`mailto:${contact.email}`}
                aria-label="Email"
                className="-m-2 inline-flex p-2 text-muted transition hover:text-accent"
              >
                <Mail size={20} />
              </a>
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="-m-2 inline-flex p-2 text-muted transition hover:text-accent"
                >
                  <LinkedinIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Right column — empty spacer; canvas + controls are absolute overlays */}
          {mode === 'side' && <div aria-hidden="true" />}

        </div>

        {/* Stacked: the maze gets its own box under the text, controls beneath it. */}
        {mode === 'stacked' && (
          <div className="intro pointer-events-auto mt-12" style={{ animationDelay: '0.5s' }}>
            <div className="h-[min(46svh,32rem)] w-full">
              <MazeCanvas layout="stacked" />
            </div>
            <div className="mt-4">
              <MazeControls inset={false} />
            </div>
          </div>
        )}
      </div>
    </section>
    </MazeProvider>
  );
}
