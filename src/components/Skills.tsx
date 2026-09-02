import type { ComponentType } from 'react';
import { Boxes, Puzzle, Sigma, Trophy, Workflow } from 'lucide-react';
import {
  SiCplusplus,
  SiDevpost,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiVercel,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { VscVscode } from 'react-icons/vsc';
import { skills } from '../data/resume';
import { Section } from './Section';
import { MetaRow, Panel, PanelRow, Tag, TagRow } from './Panel';

const SKILL_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  Java: DiJava,
  'C++': SiCplusplus,
  Python: SiPython,
  JavaScript: SiJavascript,
  'HTML/CSS': SiHtml5,
  Tailwind: SiTailwindcss,
  Git: SiGit,
  NodeJS: SiNodedotjs,
  GitHub: SiGithub,
  'VS Code': VscVscode,
  Vercel: SiVercel,
  DevPost: SiDevpost,
  'Data Structures': Boxes,
  Algorithms: Workflow,
  'Competitive Programming': Trophy,
  Mathematics: Sigma,
  'Problem Solving': Puzzle,
};

export function Skills() {
  return (
    <Section id="skills" index="04" kicker="My toolkit" title="Skills">
      {/* Categories aren't a sequence, so no connecting line — the category
          label takes the meta slot and the items are the tag row. */}
      <Panel>
        {skills.map((cat, i) => (
          <PanelRow key={cat.id} index={i}>
            <MetaRow left={cat.label} right={`${cat.items.length} items`} />
            <TagRow className="mt-5">
              {cat.items.map((it) => {
                const Icon = SKILL_ICONS[it];
                return (
                  <Tag key={it}>
                    {Icon && <Icon size={13} />}
                    {it}
                  </Tag>
                );
              })}
            </TagRow>
          </PanelRow>
        ))}
      </Panel>
    </Section>
  );
}
