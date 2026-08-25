/** Small runtime helpers shared across the app. */

/** Collision-resistant id without external deps. */
export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-5);
  return `${prefix}_${time}${rand}`;
}

/** Copy text to the clipboard, returning success. Falls back for older browsers. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Format an ISO timestamp as a short local time (HH:MM). */
export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Format an ISO timestamp as a friendly relative string. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  if (Number.isNaN(secs)) return "";
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Format an ISO timestamp as a readable date. */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/** Clamp a number into a range. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Replace <TARGET> / <IP> style tokens in a command template. */
export function fillTemplate(
  template: string,
  vars: Record<string, string | undefined>
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    if (!value) continue;
    const token = new RegExp(`<${key}>`, "gi");
    out = out.replace(token, value);
  }
  return out;
}

/** Case-insensitive substring test used by search. */
export function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Turn a pasted literal command into a fillable template by replacing the
 * user's concrete values (target, LHOST, domain, wordlist, ports) with the
 * corresponding <PLACEHOLDER>. So `nmap -p- 10.10.10.10` → `nmap -p- <TARGET>`,
 * which then auto-fills for any target. Order matters (longest/most-specific
 * first) so we don't partially replace one value inside another.
 */
export function templatizeCommand(
  command: string,
  values: { target?: string; lhost?: string; domain?: string; wordlist?: string; ports?: string }
): string {
  let out = command;
  const swaps: [string | undefined, string][] = [
    [values.wordlist, "<WORDLIST>"],
    [values.domain, "<DOMAIN>"],
    [values.lhost, "<YOUR_IP>"],
    [values.target, "<TARGET>"],
    [values.ports, "<PORTS>"],
  ];
  for (const [value, token] of swaps) {
    const v = value?.trim();
    if (!v) continue;
    // Escape regex special chars; replace all exact occurrences.
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc, "g"), token);
  }
  return out;
}

/** List the <PLACEHOLDER> tokens present in a string. */
export function placeholdersIn(text: string): string[] {
  return Array.from(new Set(text.match(/<[A-Za-z_]+>/g) ?? []));
}

/** Debounce a function. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number
): (...args: A) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** Pluralize a noun. */
export function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : pluralForm ?? `${singular}s`;
}
