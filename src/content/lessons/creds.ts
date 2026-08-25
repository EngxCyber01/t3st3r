import type { Lesson } from "@/types";

export const credsLessons: Lesson[] = [
  {
    id: "creds-reuse",
    title: "Credential Reuse: The Great Multiplier",
    category: "creds",
    categoryLabel: "Credentials",
    difficulty: "beginner",
    summary: "One credential found anywhere should be tested everywhere. Reuse turns a small find into full access.",
    estMinutes: 6,
    objectives: ["Adopt a reuse-first mindset", "Spray a found credential across services", "Understand pass-the-hash"],
    teacherIntro:
      "You found a password — in a config file, a share, a database. The single most productive next step is to try it everywhere: SSH, SMB, WinRM, RDP, the web login, the database. People reuse credentials relentlessly, and so do systems.",
    why: "Reuse is often the difference between one foothold and the whole network. It costs seconds to test and frequently pays off dramatically.",
    notes: [
      { heading: "Test broadly", body: "For a user:pass, try it against every service you found. NetExec makes this fast across SMB/WinRM/RDP/LDAP/SSH/MSSQL." },
      { heading: "Hashes reuse too", body: "An NTLM hash is often usable directly (pass-the-hash) — nxc smb <TARGET> -u <USER> -H <HASH>. Try reuse before spending hours cracking.", tone: "tip" },
      { heading: "Mind lockouts", body: "Reuse of ONE credential across services is low risk. Spraying MANY passwords at MANY accounts risks lockouts — that's a different, more careful operation.", tone: "warning" },
    ],
    commands: [
      { id: "creds-nxc-spray", command: "nxc smb <TARGET> -u <USER> -p <PASS> --continue-on-success", platform: "kali", purpose: "Test a credential across hosts/services via NetExec.", why: "Rapidly confirms where a found credential is valid.", lookFor: ["[+] valid", "(Pwn3d!) = admin access"], risk: "medium", next: "Where it's admin, that's likely your next foothold.", tags: ["credentials", "netexec", "reuse"] },
      { id: "creds-pth", command: "nxc smb <TARGET> -u <USER> -H <NTLM_HASH>", platform: "kali", purpose: "Pass-the-hash: authenticate with an NTLM hash directly.", why: "Skips cracking entirely when the hash itself is accepted.", lookFor: ["[+] valid with -H", "admin over SMB"], risk: "high", tags: ["credentials", "pass-the-hash", "ntlm"] },
    ],
    lookFor: ["Where a credential is valid", "Admin (Pwn3d!) results", "Hashes usable without cracking"],
    branches: [
      { condition: "The credential grants admin somewhere", outcome: "Use it for access on that host and continue enumeration from the new vantage point.", goto: { type: "phase", id: "initial_access" }, risk: "high" },
    ],
    next: ["creds-hashes", "creds-spraying"],
    keywords: ["credential reuse", "pass the hash", "netexec", "reuse", "spray"],
  },
  {
    id: "creds-hashes",
    title: "Identifying and Cracking Hashes",
    category: "creds",
    categoryLabel: "Credentials",
    difficulty: "intermediate",
    summary: "Recognize a hash type, pick the right mode, and crack offline with hashcat/john — plus when not to bother.",
    estMinutes: 7,
    objectives: ["Identify hash formats", "Choose hashcat modes", "Decide crack vs reuse"],
    teacherIntro:
      "You've got a hash. First identify what it is, then decide whether to crack it or reuse it directly. Cracking is offline and unlimited (no lockouts), but it's not always necessary — some hashes are usable as-is.",
    why: "Recognizing hash types and knowing the right tool/mode turns a wall of hex into credentials — and knowing when reuse beats cracking saves hours.",
    notes: [
      { heading: "Identify", body: "Use context and format. NTLM is 32 hex chars; $6$ is sha512crypt (Linux shadow); Kerberoast hashes start $krb5tgs$; AS-REP $krb5asrep$. hashid/name-that-hash help." },
      { heading: "Crack", body: "hashcat -m <mode> hashes rockyou.txt. Common modes: 1000 (NTLM), 1800 (sha512crypt), 13100 (Kerberoast), 18200 (AS-REP). A good wordlist + rules cracks most lab hashes." },
      { heading: "Or don't", body: "NTLM hashes are frequently reusable via pass-the-hash — try reuse first. Crack when you need the cleartext (e.g. reuse on a web login).", tone: "tip" },
    ],
    commands: [
      { id: "creds-hashid", command: "hashid -m '<HASH>'", platform: "kali", purpose: "Identify a hash's likely type and hashcat mode.", why: "Choosing the wrong mode wastes time; this narrows it down.", lookFor: ["Suggested hashcat mode(s)"], risk: "low", tags: ["hash", "identify"] },
      { id: "creds-hashcat", command: "hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt -r rules/best64.rule", platform: "kali", purpose: "Crack hashes offline with a wordlist and rules.", why: "Offline cracking has no lockout risk and recovers cleartext for reuse.", flags: [{ flag: "-m", meaning: "Hash mode (type)" }, { flag: "-r", meaning: "Rule file to mutate words" }], lookFor: ["Recovered plaintext", "Status: Cracked"], risk: "low", next: "Reuse the recovered password across services.", tags: ["hashcat", "cracking", "rockyou"] },
    ],
    lookFor: ["Hash type", "Correct hashcat mode", "Whether reuse avoids cracking"],
    next: ["creds-reuse"],
    keywords: ["hash", "hashcat", "john", "cracking", "ntlm", "kerberoast"],
  },
  {
    id: "creds-spraying",
    title: "Password Spraying (Carefully)",
    category: "creds",
    categoryLabel: "Credentials",
    difficulty: "intermediate",
    summary: "One weak password against many users — powerful, but you must respect lockout policy and authorization.",
    estMinutes: 6,
    objectives: ["Understand spraying vs brute forcing", "Check lockout policy first", "Choose realistic candidate passwords"],
    teacherIntro:
      "Password spraying tries a single likely password against many accounts, staying under lockout thresholds. It's effective against domains with weak password habits — but doing it without checking the lockout policy can lock out real users.",
    why: "Spraying finds the one user with 'Winter2024!' without tripping lockouts — if you're disciplined. It's a scalpel, not a hammer.",
    notes: [
      { heading: "Policy first", body: "Get the lockout threshold and window (from enum4linux/nxc). Stay well under it — one attempt per account per window is safest.", tone: "warning" },
      { heading: "Realistic candidates", body: "Season+year, Company123!, and the username itself are common. Quality of guesses beats quantity here." },
      { heading: "Authorization", body: "Spraying is intrusive and can cause disruption. It belongs only in scoped, authorized engagements and labs.", tone: "warning" },
    ],
    commands: [
      { id: "creds-spray-nxc", command: "nxc smb <TARGET> -u users.txt -p 'Winter2024!' --continue-on-success", platform: "kali", purpose: "Spray one password across a user list.", why: "Tests many accounts with a single password, minimizing lockout risk.", lookFor: ["[+] valid pairs", "avoid repeated failures on the same account"], risk: "high", commonMistakes: ["Not checking lockout policy first", "Spraying many passwords quickly"], tags: ["spraying", "netexec", "passwords"] },
    ],
    lookFor: ["Lockout threshold", "A single valid pair", "Signs you're approaching lockout"],
    next: ["creds-reuse", "ad-kerberos"],
    keywords: ["password spraying", "spray", "lockout", "netexec", "passwords"],
  },
];
