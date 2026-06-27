import { GraduationCap, MapPin } from 'lucide-react';
import { education } from '../data/resume';
import { Section } from './Section';
import { Reveal } from './Reveal';

export function Education() {
  return (
    <Section id="education" index="02" kicker="Where I've studied" title="Education">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {education.map((e, i) => (
          <Reveal key={e.id} delay={i * 70} className="h-full">
            <article className="card flex h-full flex-col p-6">
              <GraduationCap className="text-accent" size={22} />
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                {e.school}
              </h3>
              <p className="mt-1 text-sm text-muted">{e.credential}</p>
              {e.detail && (
                <p className="mt-2 text-sm font-medium text-accent" style={{whiteSpace: "pre-line"}}>{e.detail}</p>
              )}
              <div className="mt-auto pt-4">
                <p className="font-mono text-xs text-faint">
                  {e.start} – {e.end}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={12} /> {e.location}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
