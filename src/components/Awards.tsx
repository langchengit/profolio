import { Award, Medal, Trophy } from 'lucide-react';
import { awards } from '../data/resume';
import { Section } from './Section';
import { Reveal } from './Reveal';

const icons = [Trophy, Medal, Award];

export function Awards() {
  return (
    <Section id="awards" index="05" kicker="Recognition" title="Awards">
      <div className="grid gap-5 md:grid-cols-3">
        {awards.map((cat, i) => {
          const Icon = icons[i % icons.length];
          return (
            <Reveal key={cat.id} delay={i * 70} className="h-full">
              <article className="card h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent">
                    <Icon size={18} />
                    <h3 className="font-display text-base font-semibold text-text">
                      {cat.label}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-faint">
                    {cat.items.length}
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {cat.items.map((it, ii) => (
                    <li
                      key={ii}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-3" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
