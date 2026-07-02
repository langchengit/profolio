import { Cpu, ExternalLink } from 'lucide-react';
import { GithubIcon, ImageIcon } from './BrandIcons';
import { projects } from '../data/resume';
import { renderBulletText } from '../lib/bullets';
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
              <div className="flex h-40 items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-accent/20 via-accent-2/10 to-accent-3/20">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Cpu size={48} className="text-accent transition duration-300 group-hover:scale-110" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                {p.affiliation && (
                  <p className="mt-1 text-sm text-muted">{p.affiliation}</p>
                )}
                <ul className="mt-4 flex-1 space-y-2">
                  {(() => {
                    let inSubList = false;
                    return p.bullets.map((b, bi) => {
                      const isHeader = b.trim().endsWith(':');
                      const isSub = inSubList && !isHeader;
                      if (isHeader) inSubList = true;
                      return (
                        <li
                          key={bi}
                          className={`flex gap-2.5 text-sm leading-relaxed text-muted ${
                            isSub ? 'ml-5' : ''
                          }`}
                        >
                          {!isHeader && (
                            <span
                              className={`shrink-0 rounded-full bg-accent ${
                                isSub ? 'mt-2 h-0.5 w-0.5' : 'mt-2 h-1 w-1'
                              }`}
                            />
                          )}
                          <span className={isHeader ? 'font-medium text-foreground' : ''}>
                            {renderBulletText(b)}
                          </span>
                        </li>
                      );
                    });
                  })()}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip btn btn-ghost">
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

                    {p.imageUrl && (
                      <a
                        href={p.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
                      >
                        <ImageIcon size={16} /> Images
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
