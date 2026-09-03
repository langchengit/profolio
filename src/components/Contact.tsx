import { ArrowUpRight } from 'lucide-react';
import { contact } from '../data/resume';
import { GithubIcon, LinkedinIcon } from './BrandIcons';
import { Section } from './Section';
import { MetaRow, Panel, PanelRow, TitleRow } from './Panel';

const LINK = 'inline-flex items-center gap-1.5 transition hover:text-accent';

export function Contact() {
  return (
    <Section id="contact" index="06" kicker="" title="Contact">
      <Panel>
        <PanelRow index={0}>
          <MetaRow left="Email" right={contact.location} />
          <TitleRow
            title={
              <a
                href={`mailto:${contact.email}`}
                className="break-words transition hover:text-accent"
              >
                {contact.email}
              </a>
            }
            aside={
              <div className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
                {contact.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className={LINK}>
                    <LinkedinIcon size={15} /> LinkedIn <ArrowUpRight size={13} />
                  </a>
                )}
                {contact.github && (
                  <a href={contact.github} target="_blank" rel="noreferrer" className={LINK}>
                    <GithubIcon size={15} /> GitHub <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            }
          />
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            I'm always open to new opportunities, collaborations, and good
            conversations.
          </p>
        </PanelRow>
      </Panel>
    </Section>
  );
}
