import { ExternalLink } from 'lucide-react';
import { GithubIcon, ImageIcon } from './BrandIcons';
import { projects } from '../data/resume';
import { Section } from './Section';
import { BulletBody, MetaRow, Panel, PanelRow, Tag, TagRow, TitleRow } from './Panel';

const LINK = 'inline-flex items-center gap-1.5 transition hover:text-accent';

export function Projects() {
  return (
    <Section id="projects" index="03" kicker="Things I've built" title="Projects">
      {/* Projects aren't date-ordered, so the rows keep the node square as a
          marker but skip the connecting line. */}
      <Panel>
        {projects.map((p, i) => (
          <PanelRow key={p.id} index={i}>
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
                  {p.imageUrl && (
                    <a href={p.imageUrl} target="_blank" rel="noreferrer" className={LINK}>
                      <ImageIcon size={15} /> Images
                    </a>
                  )}
                </div>
              }
            />
            {p.thumbnail && (
              <div className="mt-6 border border-border">
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  className="h-44 w-full object-cover sm:h-56"
                />
              </div>
            )}
            <BulletBody bullets={p.bullets} />
            <TagRow>
              {p.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </TagRow>
          </PanelRow>
        ))}
      </Panel>
    </Section>
  );
}
