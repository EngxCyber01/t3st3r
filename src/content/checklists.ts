import type { Checklist } from "@/types";

/** Reusable phase checklists (spec §72). */
export const CHECKLISTS: Checklist[] = [
  {
    id: "chk-before",
    title: "Before Testing",
    phase: "authorization",
    items: [
      "Written authorization is in hand and current",
      "Scope (targets, IPs, domains) is confirmed",
      "Exclusions and off-limits systems are noted",
      "Testing window and constraints are agreed",
      "Emergency contact / rules of engagement understood",
      "Evidence storage location is ready",
    ],
  },
  {
    id: "chk-recon",
    title: "Reconnaissance",
    phase: "recon",
    items: [
      "DNS records and any zone transfer attempted",
      "Subdomains enumerated (passive + active)",
      "IP ranges / ownership confirmed in scope",
      "Technologies fingerprinted",
      "Discovered hosts added to /etc/hosts",
    ],
  },
  {
    id: "chk-scan",
    title: "Scanning",
    phase: "scanning",
    items: [
      "Default TCP scan run and saved (-oA)",
      "Full-port scan (-p-) completed",
      "Version + script scan on open ports",
      "UDP top ports checked",
      "Open ports recorded in the assessment",
    ],
  },
  {
    id: "chk-enum",
    title: "Service Enumeration",
    phase: "enumeration",
    items: [
      "Each open service enumerated for version + config",
      "Web: content discovery + auth mapping",
      "SMB: shares, null/guest, users, policy",
      "Anonymous/default access tested per service",
      "Every username, path, and version noted",
    ],
  },
  {
    id: "chk-post",
    title: "Post-Exploitation",
    phase: "post_exploitation",
    items: [
      "Current user and privileges identified",
      "OS and patch level recorded",
      "Network, processes, and services enumerated",
      "Credential locations searched",
      "Escalation vectors triaged by likelihood",
    ],
  },
  {
    id: "chk-cleanup",
    title: "Cleanup",
    phase: "cleanup",
    items: [
      "Uploaded tools/files removed",
      "Created accounts removed",
      "Added SSH keys / persistence removed",
      "Modified configs restored",
      "Cleanup actions documented honestly",
    ],
  },
  {
    id: "chk-report",
    title: "Reporting",
    phase: "reporting",
    items: [
      "Every finding has evidence attached",
      "Severities are consistent and justified",
      "Impact stated in business terms",
      "Remediation is concrete and actionable",
      "Timeline assembled",
      "Report reviewed for accuracy (no over-claiming)",
    ],
  },
];
