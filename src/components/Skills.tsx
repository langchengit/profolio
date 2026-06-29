import type { ComponentType } from 'react';
import { Boxes, Code2, Puzzle, Sigma, Trophy, Workflow } from 'lucide-react';
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
import { Reveal } from './Reveal';

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
      <div className="grid gap-5 md:grid-cols-3">
        {skills.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 70} className="h-full">
            <article className="card h-full p-6">
              <div className="flex items-center gap-2 text-accent">
                <Code2 size={18} />
                <h3 className="font-display text-base font-semibold text-text">
                  {cat.label}
                </h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {cat.items.map((it) => {
                  const Icon = SKILL_ICONS[it];
                  return (
                    <span key={it} className="chip btn btn-ghost gap-1.5">
                      {Icon && <Icon size={14} />}
                      {it}
                    </span>
                  );
                })}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
