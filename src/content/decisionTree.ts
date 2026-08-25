import type { GotoRef, PhaseId } from "@/types";

/** One selectable "I found ..." option (spec §20). */
export interface FoundOption {
  id: string;
  label: string;
  icon: string;
  group: "Ports" | "Web" | "Access" | "Linux" | "Windows" | "Active Directory" | "Data";
  /** What it means / why it matters, one line. */
  meaning: string;
  goto: GotoRef;
}

export const FOUND_OPTIONS: FoundOption[] = [
  // Ports → service modules
  { id: "found-21", label: "Port 21 (FTP)", icon: "FolderInput", group: "Ports", meaning: "File transfer — check anonymous access and the banner.", goto: { type: "service", id: "ftp" } },
  { id: "found-22", label: "Port 22 (SSH)", icon: "SquareTerminal", group: "Ports", meaning: "Remote admin — read the banner; reuse keys/creds, don't brute force.", goto: { type: "service", id: "ssh" } },
  { id: "found-53", label: "Port 53 (DNS)", icon: "Globe", group: "Ports", meaning: "Try a zone transfer; may indicate an AD Domain Controller.", goto: { type: "service", id: "dns" } },
  { id: "found-80", label: "Port 80/443 (HTTP)", icon: "Globe", group: "Ports", meaning: "The richest surface — start web enumeration.", goto: { type: "service", id: "http" } },
  { id: "found-445", label: "Port 445 (SMB)", icon: "Server", group: "Ports", meaning: "Shares and AD metadata — try null session and enumerate.", goto: { type: "service", id: "smb" } },
  { id: "found-389", label: "Port 389 (LDAP)", icon: "Network", group: "Ports", meaning: "The AD directory — enumerate users, groups, SPNs.", goto: { type: "service", id: "ldap" } },
  { id: "found-3389", label: "Port 3389 (RDP)", icon: "Monitor", group: "Ports", meaning: "Graphical Windows access — test creds (mind lockout).", goto: { type: "service", id: "rdp" } },
  { id: "found-5985", label: "Port 5985 (WinRM)", icon: "SquareTerminal", group: "Ports", meaning: "Scriptable Windows shell — test creds, then evil-winrm.", goto: { type: "service", id: "winrm" } },
  { id: "found-3306", label: "Port 3306 (MySQL)", icon: "Database", group: "Ports", meaning: "Database — try weak/blank root; look for stored creds.", goto: { type: "service", id: "mysql" } },
  { id: "found-1433", label: "Port 1433 (MSSQL)", icon: "Database", group: "Ports", meaning: "Database with command-exec paths (xp_cmdshell).", goto: { type: "service", id: "mssql" } },

  // Web findings
  { id: "found-login", label: "A login page", icon: "LogIn", group: "Web", meaning: "Map the auth: defaults, user enumeration, lockout.", goto: { type: "lesson", id: "web-authentication" } },
  { id: "found-api", label: "An API endpoint", icon: "Braces", group: "Web", meaning: "Test authorization (IDOR/BOLA) and methods.", goto: { type: "lesson", id: "web-authorization" } },
  { id: "found-git", label: "/.git exposed", icon: "GitBranch", group: "Web", meaning: "Dump the repo — source often holds credentials.", goto: { type: "lesson", id: "web-content-discovery" } },
  { id: "found-upload", label: "A file upload", icon: "Upload", group: "Web", meaning: "Test filters and whether uploads execute.", goto: { type: "lesson", id: "web-fileupload" } },
  { id: "found-sqlerror", label: "A SQL error / injectable param", icon: "Bug", group: "Web", meaning: "Confirm SQLi safely before any exploitation.", goto: { type: "lesson", id: "web-sqli" } },

  // Access
  { id: "found-linux-shell", label: "A Linux shell", icon: "Terminal", group: "Access", meaning: "Stabilize, then enumerate: id, sudo -l, SUID.", goto: { type: "lesson", id: "lin-enum" } },
  { id: "found-windows-shell", label: "A Windows shell", icon: "MonitorCog", group: "Access", meaning: "Check whoami /priv first — SeImpersonate is gold.", goto: { type: "lesson", id: "win-enum" } },
  { id: "found-unsure-os", label: "A shell, unsure of the OS", icon: "CircleHelp", group: "Access", meaning: "Identify the OS, then pick the right workflow.", goto: { type: "lesson", id: "os-identification" } },

  // Linux privesc leads
  { id: "found-suid", label: "An unusual SUID binary", icon: "FileKey", group: "Linux", meaning: "Check it on GTFOBins for a root shell.", goto: { type: "lesson", id: "lin-suid" } },
  { id: "found-sudo", label: "sudo -l output", icon: "ShieldQuestion", group: "Linux", meaning: "Branch on the result — NOPASSWD is a quick win.", goto: { type: "lesson", id: "lin-sudo" } },
  { id: "found-cron", label: "A root cron job", icon: "Clock", group: "Linux", meaning: "Can you influence the script or its PATH?", goto: { type: "lesson", id: "lin-cron" } },

  // Windows privesc leads
  { id: "found-seimpersonate", label: "SeImpersonatePrivilege", icon: "KeyRound", group: "Windows", meaning: "Potato/PrintSpoofer to SYSTEM.", goto: { type: "lesson", id: "win-privesc" } },
  { id: "found-service", label: "A modifiable service", icon: "Cog", group: "Windows", meaning: "Point binPath at your payload → run as the service account.", goto: { type: "lesson", id: "win-privesc" } },

  // AD
  { id: "found-domain", label: "A domain / Domain Controller", icon: "Network", group: "Active Directory", meaning: "Switch strategy to AD enumeration.", goto: { type: "lesson", id: "ad-domain" } },
  { id: "found-spn", label: "A service account / SPN", icon: "UserCog", group: "Active Directory", meaning: "Kerberoast it and crack offline.", goto: { type: "lesson", id: "ad-kerberos" } },

  // Data
  { id: "found-cred", label: "A credential", icon: "KeyRound", group: "Data", meaning: "Test it everywhere — reuse is a force multiplier.", goto: { type: "lesson", id: "creds-reuse" } },
  { id: "found-hash", label: "A password hash", icon: "Hash", group: "Data", meaning: "Identify the type; reuse or crack offline.", goto: { type: "lesson", id: "creds-hashes" } },
  { id: "found-database", label: "Database access", icon: "Database", group: "Data", meaning: "Enumerate for credentials and sensitive data.", goto: { type: "lesson", id: "creds-hashes" } },
];

export const FOUND_GROUPS = [
  "Ports",
  "Web",
  "Access",
  "Linux",
  "Windows",
  "Active Directory",
  "Data",
] as const;

/* ---------- "I'm stuck" flow (spec §38, §88) ---------- */

export interface StuckPhase {
  id: PhaseId | "web" | "shell";
  label: string;
  /** The single most useful question to ask right now. */
  question: string;
  /** Concrete guidance: current state → missing info → recommended action. */
  guidance: string;
  action: { label: string; goto: GotoRef };
}

export const STUCK_PHASES: StuckPhase[] = [
  {
    id: "recon",
    label: "Recon",
    question: "Do you actually have a full list of what's exposed?",
    guidance:
      "You may be stuck because you haven't looked widely enough. Confirm DNS (zone transfer + subdomains) and make sure you scanned all ports, not just the top 1000.",
    action: { label: "Full-port scanning", goto: { type: "lesson", id: "scan-full-port" } },
  },
  {
    id: "scanning",
    label: "Scanning",
    question: "Did you scan ALL ports, or just the default 1000?",
    guidance:
      "The most common scanning dead end is a service hiding on a high port. Run -p- and re-read. Also try UDP top ports — SNMP/DNS are easy to miss.",
    action: { label: "Full-port & UDP scanning", goto: { type: "lesson", id: "scan-full-port" } },
  },
  {
    id: "enumeration",
    label: "Enumeration",
    question: "Which service have you NOT fully enumerated?",
    guidance:
      "'Try harder' almost always means 'enumerate harder'. Pick the service you skimmed and go deep: versions, anonymous access, hidden content, users. Re-read output you glossed over.",
    action: { label: "Enumeration methodology", goto: { type: "lesson", id: "found-enumeration" } },
  },
  {
    id: "web",
    label: "Web app",
    question: "Have you mapped the app, or just the front page?",
    guidance:
      "Run content discovery with a bigger wordlist and stack-specific extensions. Read the JavaScript for endpoints. Check every 403. Look for .git, backups, and vhosts.",
    action: { label: "Content discovery", goto: { type: "lesson", id: "web-content-discovery" } },
  },
  {
    id: "exploitation",
    label: "Exploitation",
    question: "Have you confirmed the version AND configuration the exploit needs?",
    guidance:
      "A failing exploit usually means an unmet prerequisite: wrong version, missing config, or wrong payload. Re-read the exploit's requirements and validate each one before retrying.",
    action: { label: "Exploitation methodology", goto: { type: "lesson", id: "exploit-methodology" } },
  },
  {
    id: "shell",
    label: "I have a shell",
    question: "Do you know your user, privileges, and OS?",
    guidance:
      "From a shell, stalls come from incomplete enumeration. Re-run the basics: id/whoami/sudo -l (Linux) or whoami /priv (Windows). Then run peas and triage the highlights.",
    action: { label: "Post-ex enumeration", goto: { type: "lesson", id: "os-identification" } },
  },
  {
    id: "privilege_escalation",
    label: "Privilege escalation",
    question: "Which enumeration category have you not checked?",
    guidance:
      "Work the checklist: Linux → sudo, SUID, capabilities, cron, writable files, groups. Windows → privileges, services, tasks, AlwaysInstallElevated, stored creds. One of these is usually the answer.",
    action: { label: "PrivEsc paths", goto: { type: "lesson", id: "lin-sudo" } },
  },
  {
    id: "post_exploitation",
    label: "Active Directory",
    question: "Have you fed your data into BloodHound?",
    guidance:
      "In AD, being stuck usually means you haven't mapped the graph. Collect with any credential and run 'shortest path to Domain Admins' — the next abusable edge is often right there.",
    action: { label: "BloodHound", goto: { type: "lesson", id: "ad-bloodhound" } },
  },
];
