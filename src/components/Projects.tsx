import { ExternalLink } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import { projects } from '../data/resume';
import { getSkillIcon } from '../lib/skillIcons';
import { Section } from './Section';
import { Reveal } from './Reveal';
import { BulletBody, MetaRow, Tag, TagRow, TitleLink, TitleRow } from './Panel';
import type { ComponentType } from 'react';
import { QlangDemo } from '../demos/QlangDemo';
import { LineFollowerDemo } from '../demos/LineFollowerDemo';
import { LeavyDemo } from '../demos/LeavyDemo';
import { TEXT_LINK } from '../lib/linkStyle';

/** Small interactive demo shown under a project's bullets, keyed by project id. */
const DEMOS: Record<string, ComponentType> = {
  leavy: LeavyDemo,
  qlang: QlangDemo,
  'line-following-vehicle': LineFollowerDemo,
};

const LINK = 'inline-flex items-center gap-1.5 py-1.5 transition hover:text-accent';

export function Projects() {
  return (
    <Section id="projects" index="03" title="Projects">
      {/* One project per row. */}
      <div className="grid border-l border-t border-border">
        {projects.map((p, i) => {
          const Demo = DEMOS[p.id];
          return (
          <Reveal key={p.id} delay={i * 60} className="border-b border-r border-border">
            <div className="h-full p-6 sm:p-8">
              <MetaRow
                left={
                  p.affiliationUrl ? (
                    <a href={p.affiliationUrl} target="_blank" rel="noreferrer"
                      className={TEXT_LINK}>
                      {p.affiliation}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    p.affiliation
                  )
                }
                right={p.location}
              />
              <TitleRow
                title={<TitleLink href={p.liveUrl || undefined} plain>{p.name}</TitleLink>}
                aside={
                  <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
                    {(p.codeLinks ?? (p.githubUrl ? [{ label: 'Code', url: p.githubUrl }] : [])).map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className={LINK}>
                        <GithubIcon size={15} /> {l.label}
                      </a>
                    ))}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className={LINK}>
                        <ExternalLink size={15} /> Live
                      </a>
                    )}
                  </div>
                }
              />
              <BulletBody bullets={p.bullets} />
              {Demo && <Demo />}
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
          );
        })}
      </div>
    </Section>
  );
}
