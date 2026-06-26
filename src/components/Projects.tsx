import { Cpu, ExternalLink } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import { projects } from '../data/resume';
import { Section } from './Section';
import { Reveal } from './Reveal';

export function Projects() {
  const multiple = projects.length > 1;
  return (
    <Section id="projects" index="03" kicker="Things I've built" title="Projects">
      <div className={multiple ? 'grid gap-6 md:grid-cols-2' : 'mx-auto max-w-3xl'}>
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 70} className="h-full">
            <article className="card group flex h-full flex-col overflow-hidden">
              <div className="flex h-40 items-center justify-center border-b border-border bg-gradient-to-br from-accent/20 via-accent-2/10 to-accent-3/20">
                <Cpu size={48} className="text-accent transition duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                {p.affiliation && (
                  <p className="mt-1 text-sm text-muted">{p.affiliation}</p>
                )}
                <ul className="mt-4 space-y-2">
                  {p.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
                {(p.githubUrl || p.liveUrl) && (
                  <div className="mt-5 flex gap-4">
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
                      >
                        <GithubIcon size={16} /> Code
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
                      >
                        <ExternalLink size={16} /> Live
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
