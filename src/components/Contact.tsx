import type { ReactNode } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { contact } from '../data/resume';
import { GithubIcon, LinkedinIcon } from './BrandIcons';
import { Section } from './Section';
import { Reveal } from './Reveal';

function formatPhone(p: string): string {
  const m = p.replace(/[^\d+]/g, '');
  if (m.startsWith('+1') && m.length === 12) {
    const d = m.slice(2);
    return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return p;
}

function ContactLink({
  href,
  icon,
  label,
  value,
  external,
}: {
  href?: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="text-accent">{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono text-[11px] uppercase tracking-wider text-faint">
          {label}
        </span>
        <span className="block truncate text-sm text-text">{value}</span>
      </span>
      {href && (
        <ArrowUpRight
          size={15}
          className="ml-auto text-faint transition group-hover:text-accent"
        />
      )}
    </>
  );

  if (!href) {
    return <div className="card flex items-center gap-3 p-4">{inner}</div>;
  }
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="card group flex items-center gap-3 p-4"
    >
      {inner}
    </a>
  );
}

export function Contact() {
  return (
    <Section id="contact" index="06" kicker="Say hello" title="Let's connect">
      <Reveal>
        <div className="card p-8 sm:p-12">
          <p className="max-w-xl text-lg text-muted">
            I'm always open to new opportunities, collaborations, and good
            conversations. The fastest way to reach me is email.
          </p>

          <a
            href={`mailto:${contact.email}`}
            className="btn btn-primary mt-7 text-base"
          >
            <Mail size={18} /> {contact.email}
          </a>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contact.linkedin && (
              <ContactLink
                href={contact.linkedin}
                icon={<LinkedinIcon size={18} />}
                label="LinkedIn"
                value="Connect"
                external
              />
            )}
            {contact.github && (
              <ContactLink
                href={contact.github}
                icon={<GithubIcon size={18} />}
                label="GitHub"
                value="Follow"
                external
              />
            )}
            {contact.phone && (
              <ContactLink
                href={`tel:${contact.phone}`}
                icon={<Phone size={18} />}
                label="Phone"
                value={formatPhone(contact.phone)}
              />
            )}
            <ContactLink
              icon={<MapPin size={18} />}
              label="Location"
              value={contact.location}
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
