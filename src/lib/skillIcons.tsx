import type { ComponentType } from 'react';
import { Cpu } from 'lucide-react';
import { SiArduino, SiCplusplus, SiCss, SiHtml5, SiJavascript } from 'react-icons/si';

/** Brand mark per project tag, keyed by the tag text as authored in resume.ts
 *  (case-insensitive). Tags without a real brand — e.g. "Embedded Hardware" —
 *  fall back to a generic icon or render with no icon at all. */
const SKILL_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  arduino: SiArduino,
  'c++': SiCplusplus,
  html: SiHtml5,
  css: SiCss,
  javascript: SiJavascript,
  js: SiJavascript,
  'embedded hardware': Cpu,
};

export function getSkillIcon(tag: string) {
  return SKILL_ICONS[tag.trim().toLowerCase()];
}
