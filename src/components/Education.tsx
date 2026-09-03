import { education } from '../data/resume';
import { Section } from './Section';
import { MetaRow, Panel, PanelRow, Tag, TagRow, TitleRow } from './Panel';

export function Education() {
  return (
    <Section id="education" index="02" kicker="" title="Education">
      {/* Date-ordered like Experience, so the rows share the same timeline rail. */}
      <Panel>
        {education.map((e, i) => (
          <PanelRow key={e.id} index={i} line>
            <MetaRow left={`${e.start} — ${e.end}`} right={e.location} />
            <TitleRow title={e.school} aside={e.credential} />
            {e.detail && (
              // Detail is authored as one line per result, so each becomes a tag.
              <TagRow>
                {e.detail.split('\n').map((d) => (
                  <Tag key={d}>{d}</Tag>
                ))}
              </TagRow>
            )}
          </PanelRow>
        ))}
      </Panel>
    </Section>
  );
}
