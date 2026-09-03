import { experience } from '../data/resume';
import { Section } from './Section';
import { BulletBody, MetaRow, Panel, PanelRow, Tag, TagRow, TitleRow } from './Panel';

export function Experience() {
  return (
    <Section id="experience" index="01" kicker="" title="Experience">
      {/* One panel for the whole run of roles: each row's rail lines up with the
          next, so the timeline reads as a single line through the stack. */}
      <Panel>
        {experience.map((e, i) => (
          <PanelRow key={e.id} index={i} line>
            <MetaRow left={`${e.start} — ${e.end}`} right={e.location} />
            <TitleRow title={e.role} aside={e.organization} />
            <BulletBody bullets={e.bullets} />
            <TagRow>
              {e.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </TagRow>
          </PanelRow>
        ))}
      </Panel>
    </Section>
  );
}
