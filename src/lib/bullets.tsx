const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const DOMAIN_PATTERN = /\b[a-z0-9-]+\.(?:com|org|net|io|dev|co)\b/gi;

export function renderBulletText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // First pass: extract [text](url) markdown links
  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;
    const start = match.index!;
    if (start > lastIndex) {
      nodes.push(...renderDomains(text.slice(lastIndex, start), key));
      key += 10;
    }
    nodes.push(
      <a key={key++} href={href} target="_blank" rel="noreferrer"
        className="text-accent underline-offset-2 hover:underline">
        {label}
      </a>
    );
    lastIndex = start + full.length;
  }

  // Remainder: auto-link bare domains
  if (lastIndex < text.length) {
    nodes.push(...renderDomains(text.slice(lastIndex), key));
  }

  return nodes;
}

function renderDomains(text: string, baseKey: number): React.ReactNode[] {
  return text.split(DOMAIN_PATTERN).reduce((acc: React.ReactNode[], part, idx, arr) => {
    acc.push(part);
    const match = text.match(DOMAIN_PATTERN)?.[idx];
    if (match && idx < arr.length - 1) {
      acc.push(
        <a key={baseKey + idx} href={`https://${match}`} target="_blank" rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline">
          {match}
        </a>
      );
    }
    return acc;
  }, []);
}
