import type { Lesson } from "@/types";

export const foundationLessons: Lesson[] = [
  {
    id: "first-15-minutes",
    title: "Your First 15 Minutes on a Target",
    category: "foundations",
    categoryLabel: "Foundations",
    difficulty: "beginner",
    summary:
      "The exact thought process for a brand-new box: confirm scope, check connectivity, scan once, read carefully, pick one service.",
    estMinutes: 15,
    methodology: ["PTES: Intelligence Gathering", "NIST SP 800-115"],
    objectives: [
      "Confirm you are authorized and the target is reachable",
      "Run a first scan and actually read it",
      "Choose ONE service to investigate first — not all of them",
    ],
    teacherIntro:
      "Okay, we have a new target. Don't start exploiting anything yet. The biggest beginner mistake is running ten tools in the first minute. We're going to move deliberately: confirm scope, confirm we can reach the box, scan once, and then make a single, defensible decision about where to look first.",
    why:
      "Early panic leads to noise and confusion. A calm, ordered first 15 minutes gives you a map of the attack surface and a clear next step — which is worth more than any single exploit.",
    notes: [
      {
        heading: "Step 1 — Scope check",
        body: "Confirm this IP/host is explicitly in scope and you have permission. Everything after this assumes yes. If you can't confirm it, you stop here.",
        tone: "warning",
      },
      {
        heading: "Step 2 — Connectivity",
        body: "Can you even reach it? A quick ping or a single-port check saves you from debugging 'nothing works' for ten minutes. On many labs ICMP is blocked, so don't panic if ping fails — that's why we scan with -Pn if needed.",
      },
      {
        heading: "Step 3 — Scan once, read carefully",
        body: "Run a sensible default scan. While it runs, resist the urge to do five other things. When it finishes, read every line. The open ports ARE your attack surface.",
      },
      {
        heading: "Step 4 — Decide, don't spray",
        body: "You'll usually see a few services. Pick the one most likely to talk: web (80/443) first, because apps reveal a lot fast. SMB (445) is a close second on Windows. Note the others for later — you'll come back.",
        tone: "teacher",
      },
    ],
    commands: [
      {
        id: "f15-ping",
        command: "ping -c 2 <TARGET>",
        platform: "any",
        purpose: "Confirm the host is reachable (and hint at the OS via TTL).",
        why: "A fast reachability check. TTL ~64 suggests Linux, ~128 suggests Windows — a free early hint.",
        exampleOutput: "64 bytes from 10.10.10.10: icmp_seq=1 ttl=63 time=24.1 ms",
        lookFor: ["Replies at all", "TTL value (64≈Linux, 128≈Windows)"],
        commonMistakes: ["Concluding the host is down when ICMP is simply filtered — use nmap -Pn"],
        risk: "low",
        next: "Run the initial nmap scan.",
        tags: ["ping", "connectivity", "ttl"],
      },
      {
        id: "f15-nmap",
        command: "nmap -sC -sV -oA nmap_initial <TARGET>",
        platform: "any",
        purpose: "Default-script + version scan of the top 1000 TCP ports, saved to files.",
        why: "This is the sensible first scan: enough detail to identify services, saved so you never have to rescan just to re-read.",
        flags: [
          { flag: "-sC", meaning: "Run default NSE scripts" },
          { flag: "-sV", meaning: "Detect service versions" },
          { flag: "-oA nmap_initial", meaning: "Save all output formats under nmap_initial.*" },
        ],
        exampleOutput:
          "PORT    STATE SERVICE VERSION\n22/tcp  open  ssh     OpenSSH 8.2p1 Ubuntu\n80/tcp  open  http    Apache httpd 2.4.41\n445/tcp open  microsoft-ds Samba smbd 4.x",
        lookFor: ["Open ports + services", "Version strings", "OS hints (Ubuntu, Samba, IIS)"],
        risk: "low",
        next: "Read it. Then start a full-port scan in the background while you enumerate the obvious service.",
        tags: ["nmap", "initial", "scan"],
      },
    ],
    lookFor: ["A small set of open ports", "Which services are most likely to reveal information", "OS hints from versions"],
    branches: [
      {
        condition: "You see 80 or 443 (HTTP/HTTPS)",
        outcome: "Start with the web app — it usually gives up structure and info quickly.",
        goto: { type: "service", id: "http" },
      },
      {
        condition: "You see 445 (SMB) and a domain name",
        outcome: "This may be Active Directory. Enumerate SMB, then pivot to LDAP/Kerberos.",
        goto: { type: "service", id: "smb" },
      },
      {
        condition: "You only see 22 (SSH)",
        outcome: "SSH alone is rarely the way in. Do a full-port scan — the real service is probably on a higher port.",
        goto: { type: "lesson", id: "scan-full-port" },
      },
    ],
    commonMistakes: [
      "Running aggressive scans and exploits before reading the first result",
      "Enumerating every service at once and losing track",
      "Forgetting to save scan output (-oA)",
    ],
    exercise: {
      id: "f15-ex",
      prompt: "Your initial scan returns the three ports below. What do you investigate FIRST, and why?",
      scenario: "22/tcp open ssh\n80/tcp open http\n445/tcp open microsoft-ds",
      options: [
        "SSH — try to brute force root immediately",
        "HTTP — fingerprint the web app and discover content",
        "SMB — but only after brute forcing SSH",
        "All three at once with every tool you have",
      ],
      answerIndex: 1,
      explanation:
        "Start with HTTP. Web applications reveal a large amount of information quickly (technology, structure, logins, files), and that context helps you prioritize the rest. SSH brute forcing is noisy and usually futile as a first move. SMB is a strong second stop — especially if a domain name appears — but the web app is the fastest way to build a picture. And never spray every tool blindly.",
    },
    next: ["scan-nmap-basics", "svc-http", "scan-full-port"],
    related: ["found-ports-services", "found-enumeration"],
    keywords: ["start", "begin", "first", "methodology", "new target", "where to start"],
  },
  {
    id: "found-how-pentesting-works",
    title: "How a Penetration Test Actually Flows",
    category: "foundations",
    categoryLabel: "Foundations",
    difficulty: "beginner",
    summary:
      "The mental model: recon → scan → enumerate → analyze → validate → exploit → post-ex → report, and why it's iterative, not linear.",
    estMinutes: 8,
    methodology: ["PTES", "NIST SP 800-115"],
    objectives: ["Understand the phases and their purpose", "Internalize that real assessments loop back", "Know what 'done with a phase' means"],
    teacherIntro:
      "People imagine pentesting as 'nmap → exploit → root'. Real assessments almost never look like that. You'll hit dead ends, find a clue in one service that unlocks another, and circle back repeatedly. The phases aren't a straight line — they're a checklist you revisit.",
    why: "If you expect a straight line, a dead end feels like failure. If you expect iteration, a dead end is just information telling you to look elsewhere.",
    notes: [
      {
        heading: "The phases",
        body: "Authorization → Recon → Scanning → Enumeration → Vulnerability Analysis → Validation → Exploitation → Initial Access → Post-Exploitation → Privilege Escalation → Impact → Cleanup → Reporting.",
      },
      {
        heading: "It loops",
        body: "A username found during web enumeration might feed an SMB or AD attack. A shell as a low-priv user sends you back to enumeration — from the inside this time. Following the thread is the skill.",
        tone: "teacher",
      },
      {
        heading: "The real question at every step",
        body: "Not 'which command do I memorize?' but 'what information am I missing, and which action would reveal it?'",
        tone: "info",
      },
    ],
    lookFor: ["Where you are in the lifecycle", "What each phase is trying to answer"],
    commonMistakes: ["Treating a dead end as failure", "Skipping enumeration to rush exploitation"],
    next: ["first-15-minutes", "found-enumeration"],
    keywords: ["methodology", "phases", "lifecycle", "process", "ptes"],
  },
  {
    id: "found-ports-services",
    title: "Ports, Services, and Why They Matter",
    category: "foundations",
    categoryLabel: "Foundations",
    difficulty: "beginner",
    summary: "How to read a port scan: what open/filtered/closed mean, and how a port maps to a service and a workflow.",
    estMinutes: 7,
    objectives: ["Read port states correctly", "Map a port to its likely service", "Know that the version, not just the port, drives next steps"],
    teacherIntro:
      "A port is a numbered door; a service is what's behind it. Scanning finds the doors; enumeration inspects what's behind each. The mapping from port → service → workflow is the backbone of everything we do.",
    why: "If you can look at a scan and immediately think 'that's SMB, that's a web app, that's probably a DC', you can plan an assessment in seconds.",
    notes: [
      { heading: "Port states", body: "open = a service is listening. filtered = a firewall is dropping/blocking, so you can't tell. closed = reachable but nothing listening. 'filtered' is not 'closed' — note it and move on." },
      { heading: "Port ≠ certainty", body: "Port 80 usually means HTTP, but services can run on non-standard ports. Always confirm with version detection (-sV) rather than assuming from the number alone." },
      { heading: "Use the Port Lookup", body: "When you see a port you don't recognize, use this app's Port Lookup to get what it is, what to check, and the commands to run.", tone: "tip" },
    ],
    lookFor: ["open vs filtered vs closed", "Service + version", "Groups of ports that imply a role (53/88/389/445 = DC)"],
    exercise: {
      id: "fps-ex",
      prompt: "You see 53, 88, 389, and 445 open together. What does this strongly suggest?",
      options: ["A web server", "A Linux file server", "An Active Directory Domain Controller", "A database server"],
      answerIndex: 2,
      explanation: "DNS (53), Kerberos (88), LDAP (389), and SMB (445) appearing together is the classic signature of a Windows Active Directory Domain Controller. That should immediately steer you toward the AD workflow.",
    },
    next: ["scan-nmap-basics", "ad-domain"],
    keywords: ["ports", "services", "open", "filtered", "closed"],
  },
  {
    id: "found-enumeration",
    title: "Enumeration: The Skill That Matters Most",
    category: "foundations",
    categoryLabel: "Foundations",
    difficulty: "beginner",
    summary: "Why 'enumerate harder' is the most common good advice in this field, and how to do it systematically.",
    estMinutes: 6,
    objectives: ["Define enumeration precisely", "Adopt a systematic per-service approach", "Recognize when you've under-enumerated"],
    teacherIntro:
      "Enumeration is systematically gathering detailed information about a discovered service. It's unglamorous and it's where assessments are won. 'Try harder' almost always means 'enumerate harder' — you missed something.",
    why: "Exploits are cheap; the hard part is knowing exactly what's there to exploit. Thorough enumeration turns a vague target into a concrete list of things to test.",
    notes: [
      { heading: "Per service, ask the same questions", body: "What version? What does it expose (shares, endpoints, users)? Is anonymous/default access allowed? What does it reveal about other services?" },
      { heading: "Breadth then depth", body: "Get a shallow read of every service first, then go deep on the most promising. Don't rabbit-hole on the first port for an hour before looking at the others." },
      { heading: "Record as you go", body: "Every username, path, and version goes into your notes immediately. The credential you ignore now is the one you'll wish you had in 40 minutes.", tone: "teacher" },
    ],
    lookFor: ["Versions", "Anonymous/default access", "Cross-service clues (a username here unlocks a login there)"],
    commonMistakes: ["Going deep on one service before scanning the rest", "Not writing down small discoveries"],
    next: ["svc-http", "svc-smb"],
    keywords: ["enumeration", "enumerate", "information gathering"],
  },
];
