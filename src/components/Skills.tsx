import { Code2 } from 'lucide-react';
import { skills } from '../data/resume';
import { Section } from './Section';
import { Reveal } from './Reveal';

export function Skills() {
  return (
    <Section id="skills" index="04" kicker="My toolkit" title="Skills">
      <div className="grid gap-5 md:grid-cols-3">
        {skills.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 70} className="h-full">
            <article className="card h-full p-6">
              <div className="flex items-center gap-2 text-accent">
                <Code2 size={18} />
                <h3 className="font-display text-base font-semibold text-text">
                  {cat.label}
                </h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {cat.items.map((it) => (
                  <span key={it} className="chip btn btn-ghost">
                    {it}
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
