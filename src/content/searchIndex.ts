import { LESSONS } from "./lessons";
import { SERVICE_MODULES } from "./services";
import { PORTS } from "./ports";
import { GLOSSARY } from "./glossary";
import { REFERENCE } from "./reference";
import { LABS } from "./labs";
import { ALL_NAV } from "@/components/layout/nav";

export type SearchType =
  | "lesson"
  | "service"
  | "command"
  | "port"
  | "glossary"
  | "reference"
  | "lab"
  | "page";

export interface SearchItem {
  id: string;
  type: SearchType;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  /** Lowercased haystack for matching. */
  haystack: string;
  /** For ranking exact-ish hits. */
  keyTerms: string[];
}

function j(...parts: (string | undefined | string[])[]): string {
  return parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const typeIcon: Record<SearchType, string> = {
  lesson: "GraduationCap",
  service: "Server",
  command: "SquareTerminal",
  port: "Network",
  glossary: "BookA",
  reference: "BookMarked",
  lab: "FlaskConical",
  page: "ArrowRight",
};

let _index: SearchItem[] | null = null;

/** Build (once) the flat, searchable index across all content. */
export function buildSearchIndex(): SearchItem[] {
  if (_index) return _index;
  const items: SearchItem[] = [];

  for (const l of LESSONS) {
    items.push({
      id: `lesson:${l.id}`,
      type: "lesson",
      title: l.title,
      subtitle: l.summary,
      route: `/learn/${l.id}`,
      icon: typeIcon.lesson,
      haystack: j(l.title, l.summary, l.categoryLabel, l.keywords, l.objectives),
      keyTerms: l.keywords ?? [],
    });
    for (const c of l.commands ?? []) {
      items.push({
        id: `cmd:${l.id}:${c.id}`,
        type: "command",
        title: c.command,
        subtitle: c.purpose,
        route: `/learn/${l.id}`,
        icon: typeIcon.command,
        haystack: j(c.command, c.purpose, c.tags, c.why),
        keyTerms: c.tags ?? [],
      });
    }
  }

  for (const m of SERVICE_MODULES) {
    items.push({
      id: `svc:${m.id}`,
      type: "service",
      title: `${m.name} — service module`,
      subtitle: m.tagline,
      route: `/services/${m.id}`,
      icon: typeIcon.service,
      haystack: j(m.name, m.tagline, m.what, m.keywords, m.ports.map(String)),
      keyTerms: m.keywords ?? [],
    });
    for (const c of m.commands) {
      items.push({
        id: `svccmd:${m.id}:${c.id}`,
        type: "command",
        title: c.command,
        subtitle: `${m.name}: ${c.purpose}`,
        route: `/services/${m.id}`,
        icon: typeIcon.command,
        haystack: j(c.command, c.purpose, c.tags),
        keyTerms: c.tags ?? [],
      });
    }
  }

  for (const p of PORTS) {
    items.push({
      id: `port:${p.port}`,
      type: "port",
      title: `Port ${p.port} — ${p.service}`,
      subtitle: p.summary,
      route: `/ports?p=${p.port}`,
      icon: typeIcon.port,
      haystack: j(String(p.port), p.service, p.summary, p.keywords),
      keyTerms: [String(p.port), p.service, ...(p.keywords ?? [])],
    });
  }

  for (const t of GLOSSARY) {
    items.push({
      id: `gl-${t.term}`,
      type: "glossary",
      title: t.term,
      subtitle: t.short,
      route: `/glossary?q=${encodeURIComponent(t.term)}`,
      icon: typeIcon.glossary,
      haystack: j(t.term, t.short, t.long, t.related),
      keyTerms: [t.term],
    });
  }

  for (const s of REFERENCE) {
    for (const e of s.entries) {
      items.push({
        id: `ref:${s.id}:${e.command.slice(0, 20)}`,
        type: "reference",
        title: e.command,
        subtitle: `${s.title}: ${e.description}`,
        route: `/reference?s=${s.id}`,
        icon: typeIcon.command,
        haystack: j(e.command, e.description, s.title),
        keyTerms: [],
      });
    }
  }

  for (const l of LABS) {
    items.push({
      id: `lab:${l.id}`,
      type: "lab",
      title: l.title,
      subtitle: l.objective,
      route: `/labs/${l.id}`,
      icon: typeIcon.lab,
      haystack: j(l.title, l.objective, l.situation, l.category),
      keyTerms: [l.category],
    });
  }

  for (const n of ALL_NAV) {
    items.push({
      id: `nav:${n.to}`,
      type: "page",
      title: n.label,
      subtitle: "Go to page",
      route: n.to,
      icon: n.icon,
      haystack: j(n.label, "page navigate"),
      keyTerms: [n.label],
    });
  }

  _index = items;
  return items;
}

/** Rank results: exact key term > title prefix > substring. */
export function searchContent(query: string, limit = 24): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildSearchIndex();
  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of index) {
    let score = 0;
    if (item.keyTerms.some((k) => k.toLowerCase() === q)) score += 100;
    if (item.title.toLowerCase().startsWith(q)) score += 40;
    if (item.title.toLowerCase().includes(q)) score += 20;
    if (item.haystack.includes(q)) score += 10;
    // token overlap
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length > 1 && tokens.every((t) => item.haystack.includes(t))) score += 15;
    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
