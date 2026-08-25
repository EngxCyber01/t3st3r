import type { ParseResult, ParsedObservation } from "@/types";
import { lookupPort } from "@/content/ports";
import { serviceModuleForPort } from "@/content/services";

/**
 * Parse nmap-style port lines. Recognizes both grepable and normal output:
 *   22/tcp  open  ssh      OpenSSH 8.2p1
 *   80/tcp open http
 * Strictly reports what the text shows — it never infers a vulnerability.
 */
const LINE = /^\s*(\d{1,5})\/(tcp|udp)\s+(open|filtered|closed|open\|filtered)\s+([^\s]+)(?:\s+(.*))?$/i;

export function detectNmap(text: string): boolean {
  return text.split(/\r?\n/).some((l) => LINE.test(l)) || /Nmap scan report|PORT\s+STATE\s+SERVICE/i.test(text);
}

export function parseNmap(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const observations: ParsedObservation[] = [];
  const suggestions: ParseResult["suggestions"] = [];
  const seen = new Set<string>();
  let openCount = 0;

  for (const raw of lines) {
    const m = raw.match(LINE);
    if (!m) continue;
    const port = parseInt(m[1], 10);
    const protocol = m[2].toLowerCase() as "tcp" | "udp";
    const stateRaw = m[3].toLowerCase();
    const status: "open" | "filtered" | "closed" =
      stateRaw === "open" ? "open" : stateRaw === "closed" ? "closed" : "filtered";
    const service = (m[4] || "unknown").toLowerCase();
    const version = (m[5] || "").trim() || undefined;

    const key = `${port}/${protocol}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (status === "open") openCount++;

    const info = lookupPort(port);
    const mod = serviceModuleForPort(port);
    const niceService = info?.service ?? service;

    const obs: ParsedObservation = {
      label: `${port}/${protocol} — ${niceService}${status !== "open" ? ` (${status})` : ""}`,
      detail: version
        ? `Version reported: ${version}`
        : info?.summary ?? "Open service.",
      service:
        status === "open"
          ? { port, protocol, service: niceService, version, status }
          : undefined,
      severityHint: status === "open" ? "notable" : "info",
    };

    if (status === "open" && mod) {
      obs.branch = { label: `Enumerate ${mod.name}`, goto: { type: "service", id: mod.id } };
      suggestions.push({
        label: `Start ${mod.name} enumeration (port ${port})`,
        detail: mod.tagline,
        goto: { type: "service", id: mod.id },
      });
    } else if (status === "open" && info?.serviceModuleId) {
      suggestions.push({
        label: `Investigate ${niceService} (port ${port})`,
        goto: { type: "service", id: info.serviceModuleId },
      });
    }
    observations.push(obs);
  }

  // Detect an AD Domain Controller signature (spec: 53/88/389/445)
  const openPorts = observations.filter((o) => o.service).map((o) => o.service!.port);
  const dcSig = [88, 389, 445].filter((p) => openPorts.includes(p));
  if (dcSig.length >= 2 && (openPorts.includes(88) || openPorts.includes(389))) {
    suggestions.unshift({
      label: "This looks like an Active Directory Domain Controller",
      detail: "Kerberos/LDAP/SMB together — switch to the AD workflow.",
      goto: { type: "lesson", id: "ad-domain" },
    });
  }

  const matched = observations.length > 0;
  return {
    parser: "nmap",
    matched,
    headline: matched
      ? `${openCount} open ${openCount === 1 ? "service" : "services"} found`
      : "No port lines recognized",
    observations,
    suggestions,
    caveat:
      "These are the services your scan reported. A port being open is not a vulnerability — enumerate each one before drawing conclusions.",
  };
}
