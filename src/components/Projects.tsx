import { ExternalLink } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import { projects } from '../data/resume';
import { getSkillIcon } from '../lib/skillIcons';
import { Section } from './Section';
import { Reveal } from './Reveal';
import { BulletBody, MetaRow, Tag, TagRow, TitleRow } from './Panel';

const LINK = 'inline-flex items-center gap-1.5 transition hover:text-accent';

export function Projects() {
  return (
    <Section id="projects" index="03" kicker="Things I've built" title="Projects">
      {/* Projects aren't date-ordered, so they sit side by side in one row of
          cards instead of the dated sections' single-column timeline. */}
      <div
        className={`grid border-l border-t border-border ${
          projects.length > 1 ? 'sm:grid-cols-2' : ''
        }`}
      >
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 60} className="border-b border-r border-border">
            <div className="h-full p-6 sm:p-8">
              <MetaRow left={p.affiliation} right={p.location} />
              <TitleRow
                title={p.name}
                aside={
                  <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className={LINK}>
                        <GithubIcon size={15} /> Code
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className={LINK}>
                        <ExternalLink size={15} /> Live
                      </a>
                    )}
                  </div>
                }
              />
              <BulletBody bullets={p.bullets} />
              <TagRow>
                {p.tags.map((t) => {
                  const Icon = getSkillIcon(t);
                  return (
                    <Tag key={t}>
                      {Icon && <Icon size={12} />}
                      {t}
                    </Tag>
                  );
                })}
              </TagRow>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
