import { MapPin } from 'lucide-react';
import { experience } from '../data/resume';
import { Section } from './Section';
import { Reveal } from './Reveal';

export function Experience() {
  return (
    <Section id="experience" index="01" kicker="What I've done" title="Experience">
      <div className="relative space-y-4 border-l border-border pl-6 sm:pl-8">
        {experience.map((e, i) => (
          <Reveal key={e.id} delay={i * 60}>
            <article className="card relative p-5 sm:p-6">
              <span className="absolute -left-[30px] top-6 h-3 w-3 rounded-full border-2 border-accent bg-bg sm:-left-[38px]" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-lg font-semibold">{e.role}</h3>
                <span className="font-mono text-xs text-faint">
                  {e.start} – {e.end}
                </span>
              </div>
              <p className="mt-0.5 font-medium text-accent">{e.organization}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={13} /> {e.location}
              </p>
              <ul className="mt-4 space-y-2">
                {e.bullets.map((b, bi) => (
                  <li key={bi} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span key={t} className="chip btn btn-ghost">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
