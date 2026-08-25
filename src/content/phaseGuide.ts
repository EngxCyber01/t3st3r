import type { GotoRef, PhaseId } from "@/types";

/** For each phase: what the teacher recommends running / reading next. */
export interface PhaseGuide {
  /** "What should I run / read?" — ordered content references. */
  recommend: { label: string; detail?: string; goto: GotoRef }[];
  /** A short pointer to the single best starting action. */
  startHere?: string;
}

export const PHASE_GUIDE: Record<PhaseId, PhaseGuide> = {
  authorization: {
    startHere: "Confirm scope, then move to recon.",
    recommend: [
      { label: "Before-testing checklist", detail: "Authorization, scope, exclusions, evidence", goto: { type: "route", id: "/reference" } },
      { label: "How a pentest actually flows", goto: { type: "lesson", id: "found-how-pentesting-works" } },
    ],
  },
  recon: {
    startHere: "Enumerate DNS and confirm what names/hosts exist.",
    recommend: [
      { label: "DNS reconnaissance", detail: "Zone transfer + subdomains", goto: { type: "lesson", id: "recon-dns" } },
      { label: "Passive vs active recon", goto: { type: "lesson", id: "recon-passive-active" } },
    ],
  },
  scanning: {
    startHere: "Run a default scan, then a full-port scan.",
    recommend: [
      { label: "Nmap: the sensible first scan", goto: { type: "lesson", id: "scan-nmap-basics" } },
      { label: "Full-port & UDP scans", goto: { type: "lesson", id: "scan-full-port" } },
      { label: "Reading a scan & deciding", goto: { type: "lesson", id: "scan-interpreting" } },
    ],
  },
  enumeration: {
    startHere: "Enumerate the highest-yield open service first (usually web, then SMB).",
    recommend: [
      { label: "Enumeration methodology", goto: { type: "lesson", id: "found-enumeration" } },
      { label: "HTTP / web enumeration", goto: { type: "service", id: "http" } },
      { label: "SMB enumeration", goto: { type: "service", id: "smb" } },
    ],
  },
  vuln_analysis: {
    startHere: "Turn enumerated detail into concrete, testable hypotheses.",
    recommend: [
      { label: "From version to validated vulnerability", goto: { type: "lesson", id: "exploit-methodology" } },
      { label: "Web vulnerability classes", goto: { type: "route", id: "/web" } },
    ],
  },
  validation: {
    startHere: "Confirm the suspected issue with the safest possible test.",
    recommend: [
      { label: "Exploitation methodology", goto: { type: "lesson", id: "exploit-methodology" } },
      { label: "The Burp workflow (manual validation)", goto: { type: "lesson", id: "web-burp" } },
    ],
  },
  exploitation: {
    startHere: "Leverage a validated weakness deliberately and within scope.",
    recommend: [
      { label: "Metasploit workflow", goto: { type: "lesson", id: "exploit-metasploit" } },
      { label: "File transfer (get tools in / loot out)", goto: { type: "lesson", id: "file-transfer" } },
    ],
  },
  initial_access: {
    startHere: "Stabilize the shell and identify the OS before anything else.",
    recommend: [
      { label: "Which OS am I on?", goto: { type: "lesson", id: "os-identification" } },
      { label: "Stabilizing a shell", goto: { type: "lesson", id: "shell-stabilize" } },
    ],
  },
  post_exploitation: {
    startHere: "Enumerate from inside: identity, privileges, network, credentials.",
    recommend: [
      { label: "Linux: first enumeration", goto: { type: "lesson", id: "lin-enum" } },
      { label: "Windows: first enumeration", goto: { type: "lesson", id: "win-enum" } },
      { label: "Hunting credentials (Windows)", goto: { type: "lesson", id: "win-creds" } },
    ],
  },
  privilege_escalation: {
    startHere: "Enumerate escalation vectors before exploiting any of them.",
    recommend: [
      { label: "Linux: sudo -l and its branches", goto: { type: "lesson", id: "lin-sudo" } },
      { label: "Linux: SUID & capabilities", goto: { type: "lesson", id: "lin-suid" } },
      { label: "Windows: services, tasks & privileges", goto: { type: "lesson", id: "win-privesc" } },
    ],
  },
  impact: {
    startHere: "Demonstrate impact conservatively and capture evidence.",
    recommend: [
      { label: "Evidence & the timeline", goto: { type: "lesson", id: "report-evidence" } },
      { label: "Credential reuse (lateral movement)", goto: { type: "lesson", id: "creds-reuse" } },
    ],
  },
  cleanup: {
    startHere: "Remove everything you introduced; document each change.",
    recommend: [{ label: "Cleanup checklist", goto: { type: "route", id: "/reference" } }],
  },
  reporting: {
    startHere: "Assemble the report from your recorded findings and evidence.",
    recommend: [
      { label: "Writing a good finding", goto: { type: "lesson", id: "report-findings" } },
      { label: "Severity & CVSS basics", goto: { type: "lesson", id: "report-severity" } },
      { label: "Open the report builder", goto: { type: "route", id: "/a/:id?tab=report" } },
    ],
  },
};
