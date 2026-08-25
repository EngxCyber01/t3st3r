import type { ParseResult, ParsedObservation } from "@/types";

/* ============================================================
   Each parser is conservative: it reports only what the text
   shows and suggests next steps — it never claims a vulnerability.
   ============================================================ */

/* ---------- HTTP (curl -I / whatweb) ---------- */
export function detectHttp(text: string): boolean {
  return /^HTTP\/\d|^Server:|X-Powered-By:|Set-Cookie:|whatweb|WWW-Authenticate:/im.test(text);
}
export function parseHttp(text: string): ParseResult {
  const obs: ParsedObservation[] = [];
  const suggestions: ParseResult["suggestions"] = [];
  const grab = (re: RegExp) => text.match(re)?.[1]?.trim();

  const status = grab(/^HTTP\/\d(?:\.\d)?\s+(\d{3}[^\r\n]*)/im);
  const server = grab(/^Server:\s*([^\r\n]+)/im);
  const powered = grab(/^X-Powered-By:\s*([^\r\n]+)/im);
  const location = grab(/^Location:\s*([^\r\n]+)/im);
  const auth = grab(/^WWW-Authenticate:\s*([^\r\n]+)/im);
  const cookies = [...text.matchAll(/^Set-Cookie:\s*([^=;\r\n]+)/gim)].map((m) => m[1].trim());

  if (status) obs.push({ label: `Response status: ${status}`, severityHint: "info" });
  if (server) obs.push({ label: `Server: ${server}`, detail: "Web server / version reported by the header.", severityHint: "notable" });
  if (powered) obs.push({ label: `X-Powered-By: ${powered}`, detail: "Backend technology hint.", severityHint: "notable" });
  if (location) obs.push({ label: `Redirects to: ${location}`, detail: "Follow the redirect — the real app may be elsewhere.", severityHint: "notable" });
  if (auth) obs.push({ label: `Auth required: ${auth}`, detail: "An authentication scheme is in play.", severityHint: "notable" });
  if (cookies.length) obs.push({ label: `Cookies set: ${cookies.join(", ")}`, detail: "Session cookies — note names/flags.", severityHint: "info" });

  // Security header gaps (observed absence, stated cautiously)
  const missing: string[] = [];
  if (!/Content-Security-Policy:/i.test(text)) missing.push("Content-Security-Policy");
  if (!/Strict-Transport-Security:/i.test(text)) missing.push("Strict-Transport-Security");
  if (missing.length && (server || status)) {
    obs.push({ label: `Not present in this response: ${missing.join(", ")}`, detail: "Header absence is worth noting, not itself proof of a flaw.", severityHint: "info" });
  }

  suggestions.push({ label: "Continue web enumeration", detail: "Fingerprint, read source, run content discovery.", goto: { type: "service", id: "http" } });
  suggestions.push({ label: "Content discovery methodology", goto: { type: "lesson", id: "web-content-discovery" } });

  return {
    parser: "http",
    matched: obs.length > 0,
    headline: server ? `Web server: ${server}` : "HTTP response parsed",
    observations: obs,
    suggestions,
    caveat: "A version string is a lead, not a confirmed vulnerability. Enumerate and validate.",
  };
}

/* ---------- SMB (nxc / smbclient / enum4linux) ---------- */
export function detectSmb(text: string): boolean {
  return /\bSMB\b.*\d{1,3}(\.\d{1,3}){3}|microsoft-ds|smbclient|enum4linux|signing:|Disk\s+Permissions|IPC\$/i.test(text);
}
export function parseSmb(text: string): ParseResult {
  const obs: ParsedObservation[] = [];
  const suggestions: ParseResult["suggestions"] = [];

  const domain = text.match(/domain:([^\s)]+)/i)?.[1];
  const signing = text.match(/signing:(True|False)/i)?.[1];
  const os = text.match(/\[\*\]\s*(Windows[^\r\n(]+)/i)?.[1]?.trim();

  if (os) obs.push({ label: `Host: ${os}`, severityHint: "notable" });
  if (domain) {
    obs.push({ label: `Domain: ${domain}`, detail: "Domain-joined — likely Active Directory.", severityHint: "notable" });
    suggestions.push({ label: "Switch to the Active Directory workflow", goto: { type: "lesson", id: "ad-domain" } });
  }
  if (signing) {
    obs.push({ label: `SMB signing required: ${signing}`, detail: signing.toLowerCase() === "false" ? "Signing not required — note for potential relay." : "Signing enforced.", severityHint: signing.toLowerCase() === "false" ? "notable" : "info" });
  }

  // Shares: lines like "sharename   READ" or smbclient "Disk" listing
  const shareLines = [...text.matchAll(/^\s*([A-Za-z0-9_.$-]+)\s+(READ|WRITE|READ,WRITE|Disk|No Access)/gim)];
  const shares = shareLines.map((m) => `${m[1]} (${m[2]})`).filter((s) => !/^(ADMIN\$|C\$|IPC\$)/i.test(s));
  if (shares.length) {
    obs.push({ label: `Shares: ${shares.join(", ")}`, detail: "Non-default/readable shares are worth spidering for secrets.", severityHint: "notable" });
    suggestions.push({ label: "Spider readable shares for credentials", goto: { type: "service", id: "smb" } });
  }

  suggestions.push({ label: "SMB enumeration module", goto: { type: "service", id: "smb" } });

  return {
    parser: "smb",
    matched: obs.length > 0,
    headline: domain ? `SMB host in domain ${domain}` : "SMB output parsed",
    observations: obs,
    suggestions,
    caveat: "Recorded exactly what the output shows. Verify share access and reuse any credentials you find.",
  };
}

/* ---------- DNS (dig axfr / ANY) ---------- */
export function detectDns(text: string): boolean {
  return /\bIN\s+(A|AAAA|MX|NS|TXT|SOA|CNAME)\b|axfr|Transfer failed|ANSWER SECTION/i.test(text);
}
export function parseDns(text: string): ParseResult {
  const obs: ParsedObservation[] = [];
  const records = [...text.matchAll(/^([A-Za-z0-9_.-]+)\.?\s+\d*\s*IN\s+(A|AAAA|MX|NS|TXT|CNAME)\s+([^\r\n]+)/gim)];
  const hosts = new Set<string>();
  for (const r of records) {
    const [, name, type, val] = r;
    if (type === "A" || type === "AAAA" || type === "CNAME") hosts.add(name);
    obs.push({ label: `${type} ${name} → ${val.trim()}`, severityHint: type === "A" ? "notable" : "info" });
  }
  const suggestions: ParseResult["suggestions"] = [];
  if (hosts.size) {
    suggestions.push({ label: `Add ${hosts.size} discovered host(s) to /etc/hosts and scan them`, goto: { type: "lesson", id: "scan-nmap-basics" } });
  }
  suggestions.push({ label: "DNS enumeration module", goto: { type: "service", id: "dns" } });
  return {
    parser: "dns",
    matched: obs.length > 0,
    headline: obs.length ? `${obs.length} DNS record(s) parsed` : "DNS output parsed",
    observations: obs,
    suggestions,
    caveat: "Each new hostname is a new target — but confirm it's in scope before touching it.",
  };
}

/* ---------- Linux enumeration (id / sudo -l / SUID / uname) ---------- */
export function detectLinux(text: string): boolean {
  return /uid=\d+.*gid=\d+|may run the following commands|perm -4000|Linux \S+ \d|\/bin\/(bash|sh)/i.test(text);
}
export function parseLinux(text: string): ParseResult {
  const obs: ParsedObservation[] = [];
  const suggestions: ParseResult["suggestions"] = [];

  const idm = text.match(/uid=\d+\(([^)]+)\).*?groups=([^\r\n]+)/i);
  if (idm) {
    obs.push({ label: `Current user: ${idm[1]}`, detail: `Groups: ${idm[2]}`, severityHint: "notable" });
    if (/\b(sudo|docker|lxd|adm|disk|wheel)\b/i.test(idm[2])) {
      obs.push({ label: "Interesting group membership detected", detail: "docker/lxd/disk/sudo groups can be escalation paths.", severityHint: "notable" });
    }
  }
  if (/uid=0\(root\)/i.test(text)) {
    obs.push({ label: "You are root (uid=0)", detail: "Already highest privilege on this host.", severityHint: "notable" });
  }

  const kernel = text.match(/Linux \S+ (\d+\.\d+\.\d+\S*)/i)?.[1];
  if (kernel) obs.push({ label: `Kernel: ${kernel}`, severityHint: "info" });

  if (/NOPASSWD:/i.test(text)) {
    const entries = [...text.matchAll(/NOPASSWD:\s*([^\r\n]+)/gi)].map((m) => m[1].trim());
    obs.push({ label: `Passwordless sudo: ${entries.join(", ")}`, detail: "Top-priority escalation lead — check each binary on GTFOBins.", severityHint: "notable" });
    suggestions.push({ label: "Exploit sudo misconfiguration", goto: { type: "lesson", id: "lin-sudo" } });
  } else if (/may run the following commands/i.test(text)) {
    obs.push({ label: "sudo entries present (password may be required)", severityHint: "notable" });
    suggestions.push({ label: "Interpret sudo -l", goto: { type: "lesson", id: "lin-sudo" } });
  } else if (/not allowed to run sudo/i.test(text)) {
    obs.push({ label: "No sudo rights", detail: "Pivot to SUID, capabilities, cron, and writable files.", severityHint: "info" });
    suggestions.push({ label: "SUID & capabilities path", goto: { type: "lesson", id: "lin-suid" } });
  }

  const suid = [...text.matchAll(/^(\/\S+)\s*$/gim)].map((m) => m[1]).filter((p) => /\/(find|vim|nmap|python|perl|bash|cp|tar|nano|less|more|env|awk)\b/i.test(p));
  if (suid.length) {
    obs.push({ label: `Notable SUID binaries: ${suid.join(", ")}`, detail: "Check these on GTFOBins.", severityHint: "notable" });
    suggestions.push({ label: "SUID escalation", goto: { type: "lesson", id: "lin-suid" } });
  }

  if (!suggestions.length) suggestions.push({ label: "Linux enumeration methodology", goto: { type: "lesson", id: "lin-enum" } });

  return {
    parser: "linux",
    matched: obs.length > 0,
    headline: idm ? `Linux context: ${idm[1]}` : "Linux output parsed",
    observations: obs,
    suggestions,
    caveat: "Leads are not exploits — confirm each before acting, and record what you find.",
  };
}

/* ---------- Windows enumeration (whoami /priv, systeminfo) ---------- */
export function detectWindows(text: string): boolean {
  return /Se[A-Z]\w+Privilege|Microsoft Windows \[Version|whoami|BUILTIN\\|NT AUTHORITY/i.test(text);
}
export function parseWindows(text: string): ParseResult {
  const obs: ParsedObservation[] = [];
  const suggestions: ParseResult["suggestions"] = [];

  const dangerous = ["SeImpersonatePrivilege", "SeAssignPrimaryTokenPrivilege", "SeBackupPrivilege", "SeRestorePrivilege", "SeDebugPrivilege", "SeTakeOwnershipPrivilege", "SeLoadDriverPrivilege"];
  const present = dangerous.filter((p) => new RegExp(p, "i").test(text));
  if (present.length) {
    obs.push({ label: `High-value privileges: ${present.join(", ")}`, detail: "Each maps to a known escalation technique.", severityHint: "notable" });
    suggestions.push({ label: "Windows privilege escalation", goto: { type: "lesson", id: "win-privesc" } });
  }
  if (/SeImpersonatePrivilege/i.test(text)) {
    obs.push({ label: "SeImpersonatePrivilege → potato/PrintSpoofer to SYSTEM", severityHint: "notable" });
  }

  const ver = text.match(/Microsoft Windows \[Version ([\d.]+)\]/i)?.[1] || text.match(/OS Name:\s*([^\r\n]+)/i)?.[1];
  if (ver) obs.push({ label: `Windows: ${ver}`, severityHint: "info" });

  if (/Administrators/i.test(text) && /whoami|groups/i.test(text)) {
    obs.push({ label: "Membership in Administrators indicated", detail: "Confirm and leverage — you may already be able to reach SYSTEM.", severityHint: "notable" });
  }

  if (!suggestions.length) suggestions.push({ label: "Windows enumeration methodology", goto: { type: "lesson", id: "win-enum" } });

  return {
    parser: "windows",
    matched: obs.length > 0,
    headline: present.length ? "Escalation-relevant privileges found" : "Windows output parsed",
    observations: obs,
    suggestions,
    caveat: "Recorded exactly what the output shows. Confirm privileges before running any technique.",
  };
}
