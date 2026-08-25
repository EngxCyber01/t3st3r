import type { GlossaryTerm } from "@/types";

/** Searchable definitions; `short` also powers inline tooltips (spec §80). */
export const GLOSSARY: GlossaryTerm[] = [
  { term: "Reconnaissance", short: "Gathering information about a target before active testing.", long: "The first phase: collecting data about the target from passive (no-touch) and active sources to build a picture of the attack surface.", category: "concept", related: ["Enumeration", "Attack surface"] },
  { term: "Enumeration", short: "Systematically gathering detailed information about a discovered service.", long: "Turning 'a service exists' into 'here is exactly what it exposes' — versions, shares, users, endpoints. The highest-yield skill in the field.", category: "concept", related: ["Reconnaissance"] },
  { term: "Attack surface", short: "The sum of all points where a target can be interacted with or attacked.", category: "concept", related: ["Enumeration"] },
  { term: "Foothold", short: "Your first access into a target environment.", long: "Also 'initial access' — the first shell or valid session on an in-scope system.", category: "concept", related: ["Initial access", "Shell"] },
  { term: "Initial access", short: "The first foothold on a target, before any escalation.", category: "phase", related: ["Foothold", "Privilege escalation"] },
  { term: "Privilege escalation", short: "Moving from limited access to higher privileges (e.g. user → root/SYSTEM).", category: "phase", related: ["Foothold", "Lateral movement"] },
  { term: "Lateral movement", short: "Using access on one system to reach others in the network.", category: "phase", related: ["Credential reuse"] },
  { term: "Persistence", short: "Maintaining access across reboots or credential changes.", long: "Techniques to keep access. In authorized tests it must be tracked and cleaned up.", category: "phase", related: ["Cleanup"] },
  { term: "CVE", short: "Common Vulnerabilities and Exposures — a unique ID for a known vulnerability.", category: "concept", related: ["CVSS", "Exploit"] },
  { term: "CVSS", short: "A scoring system that rates vulnerability severity from 0–10.", category: "concept", related: ["CVE"] },
  { term: "Exploit", short: "Code or a technique that leverages a vulnerability to produce an effect.", category: "concept", related: ["Payload", "CVE"] },
  { term: "Payload", short: "The code that runs after an exploit succeeds (e.g. a reverse shell).", category: "concept", related: ["Exploit", "Shell"] },
  { term: "Shell", short: "Interactive command-line access to a system.", long: "Ranges from a fragile 'dumb' shell to a full interactive TTY. Stabilize dumb shells early.", category: "concept", related: ["TTY", "Reverse shell"] },
  { term: "TTY", short: "A proper interactive terminal; enables job control, editors, and sudo prompts.", category: "concept", related: ["PTY", "Shell"] },
  { term: "PTY", short: "Pseudo-terminal — what you spawn to upgrade a dumb shell to a full TTY.", category: "concept", related: ["TTY", "Shell"] },
  { term: "Reverse shell", short: "The target connects back to you, giving you a shell (vs a bind shell).", category: "concept", related: ["Shell", "Payload"] },
  { term: "SUID", short: "A Linux permission bit making a binary run as its owner (often root).", long: "find / -perm -4000 lists them. GTFOBins-exploitable SUID-root binaries are a top Linux privesc path.", category: "linux", related: ["SGID", "GTFOBins"] },
  { term: "SGID", short: "Like SUID, but the binary runs with the group's privileges.", category: "linux", related: ["SUID"] },
  { term: "Capabilities", short: "Fine-grained Linux privileges granted to binaries (e.g. cap_setuid).", category: "linux", related: ["SUID"] },
  { term: "GTFOBins", short: "A catalog of Unix binaries that can be abused to escalate or break out.", category: "linux", related: ["SUID"] },
  { term: "ACL", short: "Access Control List — who can do what to an object.", long: "In AD, abusable ACL edges (GenericAll, WriteDACL) chain into domain compromise.", category: "ad", related: ["SPN", "DCSync"] },
  { term: "SPN", short: "Service Principal Name — links a service to an account; the target of Kerberoasting.", category: "ad", related: ["Kerberos", "Kerberoasting"] },
  { term: "Kerberos", short: "The authentication protocol at the heart of Active Directory.", category: "ad", related: ["SPN", "NTLM"] },
  { term: "Kerberoasting", short: "Requesting service tickets for SPN accounts to crack their passwords offline.", category: "ad", related: ["SPN", "AS-REP roasting"] },
  { term: "AS-REP roasting", short: "Getting crackable hashes from accounts with Kerberos pre-auth disabled.", category: "ad", related: ["Kerberos"] },
  { term: "NTLM", short: "A Windows authentication protocol; its hashes are often reusable (pass-the-hash).", category: "ad", related: ["Pass-the-hash", "Kerberos"] },
  { term: "Pass-the-hash", short: "Authenticating with an NTLM hash directly, without knowing the password.", category: "ad", related: ["NTLM", "Credential reuse"] },
  { term: "DCSync", short: "Abusing replication rights to pull password hashes from a Domain Controller.", category: "ad", related: ["ACL", "Kerberos"] },
  { term: "Credential reuse", short: "Testing a found credential across many services — a huge force multiplier.", category: "concept", related: ["Pass-the-hash"] },
  { term: "IDOR", short: "Insecure Direct Object Reference — accessing others' data by changing an ID.", category: "web", related: ["BOLA", "Authorization"] },
  { term: "BOLA", short: "Broken Object Level Authorization — the API-focused name for IDOR.", category: "web", related: ["IDOR"] },
  { term: "SSRF", short: "Server-Side Request Forgery — making the server fetch a URL you choose.", category: "web", related: ["Attack surface"] },
  { term: "SSTI", short: "Server-Side Template Injection — injecting into a template engine, often leading to RCE.", category: "web", related: ["Exploit"] },
  { term: "LFI", short: "Local File Inclusion — including local files via a vulnerable parameter; can escalate to RCE.", category: "web", related: ["Path traversal"] },
  { term: "Path traversal", short: "Using ../ sequences to read files outside the intended directory.", category: "web", related: ["LFI"] },
  { term: "XSS", short: "Cross-Site Scripting — your input runs as script in another user's browser.", category: "web", related: ["CSRF"] },
  { term: "RCE", short: "Remote Code Execution — running your commands on the target. Usually critical.", category: "concept", related: ["Exploit", "Payload"] },
  { term: "Null session", short: "An unauthenticated SMB connection that sometimes reveals shares and users.", category: "network", related: ["SMB"] },
  { term: "SMB", short: "Server Message Block — Windows file sharing and a rich AD enumeration surface.", category: "network", related: ["Null session", "NetExec"] },
  { term: "NetExec", short: "A network execution/enumeration tool (nxc); the successor to CrackMapExec.", category: "network", related: ["SMB", "Pass-the-hash"] },
  { term: "Zone transfer", short: "An AXFR request that can dump an entire DNS zone if misconfigured.", category: "network", related: ["DNS"] },
  { term: "Pivoting", short: "Routing traffic through a compromised host to reach otherwise-unreachable networks.", category: "concept", related: ["Lateral movement"] },
];

export const GLOSSARY_MAP: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((t) => [t.term.toLowerCase(), t])
);

export function lookupTerm(term: string): GlossaryTerm | undefined {
  return GLOSSARY_MAP[term.toLowerCase()];
}
