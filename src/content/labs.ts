import type { Lab } from "@/types";

/** Reasoning-first mini labs (spec §41–43). No live targets — these train decision-making. */
export const LABS: Lab[] = [
  {
    id: "lab-nmap-triage",
    title: "Triage the Scan",
    difficulty: "beginner",
    category: "scanning",
    situation:
      "You just created an assessment for 10.10.10.10 and your initial scan returned three ports. You have no other information yet.",
    known: ["22/tcp open ssh OpenSSH 8.2p1 Ubuntu", "80/tcp open http Apache 2.4.41", "445/tcp open microsoft-ds Samba 4.x"],
    objective: "Decide, with justification, what to investigate first and what to queue for later.",
    hints: [
      "Which service usually reveals the most information fastest?",
      "The Samba banner tells you something about the OS.",
      "You don't have credentials yet — does that affect SSH?",
    ],
    questions: [
      { q: "Which service should you enumerate first, and why?", a: "HTTP (80). Web apps reveal structure, technology, logins, and files quickly, giving you context to prioritize everything else. It's the highest information yield with no credentials required." },
      { q: "Is this host Linux or Windows? How do you know?", a: "Linux. The banners say so: OpenSSH on Ubuntu and Samba (the Linux SMB implementation) rather than native Windows 'microsoft-ds'. TTL from a ping would corroborate (~64)." },
      { q: "Should you brute force SSH now?", a: "No. SSH is hardened and you have no user list or credentials. Brute forcing is noisy and usually futile. Reuse any credentials you find elsewhere instead." },
    ],
    solution:
      "Start with HTTP: fingerprint the stack (whatweb), read robots.txt and source, then run content discovery. In parallel, do a light SMB check (nxc smb, null-session share listing) since Samba may expose shares. Keep SSH in reserve for credential reuse. The OS is Linux, so if you get a shell later you'll switch to the Linux post-ex workflow.",
    lessonsLearned: ["Prioritize by information yield", "Read banners for OS clues", "Don't brute force without a reason"],
    relatedLessons: ["first-15-minutes", "scan-interpreting", "svc-http"],
  },
  {
    id: "lab-sudo-branch",
    title: "The sudo -l Decision",
    difficulty: "easy",
    category: "linux",
    situation: "You have a shell as www-data on a Linux host and run sudo -l.",
    known: ["Output: (root) NOPASSWD: /usr/bin/tar"],
    objective: "Determine whether this is an escalation path and how you'd use it.",
    hints: ["Can tar run other programs?", "Think about GTFOBins.", "NOPASSWD means you don't even need a password."],
    questions: [
      { q: "Is this exploitable?", a: "Yes. tar has a checkpoint action that can execute a command, and you can run it as root without a password. That's a direct route to a root shell." },
      { q: "What general principle does this illustrate?", a: "Any binary you can run as root that can execute other commands (or write files, or read arbitrary files) is effectively root. Recognizing that capability — not memorizing every binary — is the skill. GTFOBins catalogs the exact techniques." },
    ],
    solution:
      "Use tar's GTFOBins escape: sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh. Because sudo runs it as root with NOPASSWD, the spawned shell is root. Capture proof (id showing uid=0) and record the finding.",
    lessonsLearned: ["NOPASSWD entries are top priority", "GTFOBins turns 'can run X' into root", "Think in capabilities, not memorized exploits"],
    relatedLessons: ["lin-sudo", "lin-suid"],
  },
  {
    id: "lab-smb-null",
    title: "Anonymous SMB",
    difficulty: "easy",
    category: "services",
    situation: "445 is open on a domain-joined Windows host. You have no credentials yet.",
    known: ["nxc smb shows domain:corp.local, signing:False", "Null session lists a non-default share 'profiles' with READ"],
    objective: "Decide what to do with anonymous read access and what the signing status implies.",
    hints: ["What might be inside a 'profiles' share?", "signing:False matters for a specific attack class.", "This is a domain — think about next steps."],
    questions: [
      { q: "What's your immediate next action?", a: "Spider and read the 'profiles' share. User profile directories often contain configs, scripts, or files with credentials. Any credential found should then be tested across services." },
      { q: "Why note signing:False?", a: "SMB signing not being required enables NTLM relay attacks in the right conditions. It's worth recording as it may become relevant when you have a coercion primitive." },
      { q: "This is AD — what changes?", a: "You shift to the AD workflow: harvest usernames (RID cycling once you have any cred, or from the share), consider AS-REP roasting, and plan to feed everything into BloodHound." },
    ],
    solution:
      "Read the profiles share for secrets; extract any credential and test reuse (nxc across smb/winrm/rdp). Record domain:corp.local and signing:False. Move into AD enumeration: users, password policy, roasting, then BloodHound to find a path to Domain Admin.",
    lessonsLearned: ["Anonymous read can leak credentials", "Record signing status for relay potential", "A domain name pivots you into the AD workflow"],
    relatedLessons: ["svc-smb", "ad-smb", "creds-reuse"],
  },
  {
    id: "lab-http-403",
    title: "The Stubborn 403",
    difficulty: "intermediate",
    category: "web",
    situation: "Content discovery reports /admin returning 403 Forbidden. You're tempted to move on.",
    known: ["/admin → 403", "/admin/ → 403", "Server: nginx"],
    objective: "Extract value from a 403 instead of treating it as a dead end.",
    hints: ["A 403 confirms the path exists.", "Does content inside /admin also 403?", "Think about headers, methods, and path tricks."],
    questions: [
      { q: "What does the 403 actually tell you?", a: "That /admin exists but access is denied at this level. Existence is itself information — keep enumerating inside it and try to reach specific files." },
      { q: "What are legitimate next tests?", a: "Enumerate files within /admin (it may allow /admin/login.php even if the index is blocked), try alternate methods, inspect headers, and test path-normalization quirks. Also check whether authentication changes the result." },
    ],
    solution:
      "Treat the 403 as a signpost. Fuzz for files inside /admin, since directory listing may be blocked while specific files are served. Revisit with any credentials you obtain. Note it and continue mapping — a confirmed-but-protected admin area is a strong lead, not a wall.",
    lessonsLearned: ["403 confirms existence", "Enumerate inside protected directories", "Revisit protected paths after getting creds"],
    relatedLessons: ["web-content-discovery", "web-authentication"],
  },
  {
    id: "lab-win-priv",
    title: "One Privilege to SYSTEM",
    difficulty: "intermediate",
    category: "windows",
    situation: "You landed a shell as a service account after exploiting a web app. whoami /priv shows a familiar line.",
    known: ["SeImpersonatePrivilege  Enabled", "Host is standalone (not domain-joined)"],
    objective: "Identify the escalation path from this single privilege.",
    hints: ["Service accounts frequently have this.", "There's a well-known tool family for it.", "You don't need a kernel exploit."],
    questions: [
      { q: "What's the escalation path?", a: "SeImpersonatePrivilege enables token-impersonation attacks. Tools like PrintSpoofer (or the 'potato' family) impersonate the SYSTEM token to give you a SYSTEM shell." },
      { q: "Why prefer this over a kernel exploit?", a: "It's reliable, doesn't risk crashing the host, and doesn't depend on a specific unpatched build. Misconfiguration/privilege paths beat memory-corruption exploits when available." },
    ],
    solution:
      "Run PrintSpoofer (PrintSpoofer.exe -i -c cmd) to obtain nt authority\\system. Confirm with whoami, capture proof, then hunt credentials (SAM/LSASS) and assess impact. Because it's standalone, focus on local impact rather than domain escalation.",
    lessonsLearned: ["whoami /priv is the Windows sudo -l", "SeImpersonate → SYSTEM via potato/PrintSpoofer", "Prefer misconfig paths over kernel exploits"],
    relatedLessons: ["win-enum", "win-privesc", "win-creds"],
  },
];

export const LAB_MAP: Record<string, Lab> = Object.fromEntries(LABS.map((l) => [l.id, l]));
