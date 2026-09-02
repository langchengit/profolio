import { awards } from '../data/resume';
import { Section } from './Section';
import { MetaRow, NumberedList } from './Panel';
import { Reveal } from './Reveal';

export function Awards() {
  return (
    <Section id="awards" index="05" kicker="Recognition" title="Awards">
      {/* Categories aren't a sequence, so they sit side by side as their own
          columns instead of stacking as timeline rows. */}
      <div className="grid gap-8 sm:grid-cols-3">
        {awards.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 60}>
            <MetaRow
              left={cat.label}
              right={`${cat.items.length} ${cat.items.length === 1 ? 'award' : 'awards'}`}
            />
            <div className="mt-5">
              <NumberedList items={cat.items} />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
