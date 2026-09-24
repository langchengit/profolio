import { awards } from '../data/resume';
import { Section } from './Section';
import { MetaRow, NumberedList } from './Panel';
import { Reveal } from './Reveal';

export function Awards() {
  return (
    <Section id="awards" index="05" title="Awards">
      {/* Categories aren't a sequence, so they sit side by side as their own
          columns — but only from `lg`, since three columns at tablet width
          squeeze each list to a few words per line. */}
      <div className="grid items-start gap-10 lg:grid-cols-3 lg:gap-8">
        {awards.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 60}>
            <MetaRow left={cat.label} />
            <div className="mt-5">
              <NumberedList items={cat.items} />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
