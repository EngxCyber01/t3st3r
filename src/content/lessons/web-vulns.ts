import type { Lesson } from "@/types";

/** Shared teacher scaffold for a vulnerability-class lesson. */
function vulnLesson(l: Lesson): Lesson {
  return { ...l, category: "web", categoryLabel: "Web Vulnerabilities" };
}

export const webVulnLessons: Lesson[] = [
  vulnLesson({
    id: "web-sqli",
    title: "SQL Injection",
    difficulty: "intermediate",
    category: "web",
    summary: "Recognize injectable input, confirm it safely, and understand impact — without dumping a production database.",
    estMinutes: 10,
    methodology: ["OWASP WSTG-INPV-05"],
    objectives: ["Spot likely injection points", "Confirm with safe, minimal tests", "Understand impact and remediation"],
    teacherIntro:
      "SQL injection happens when user input is concatenated into a query. The instinct is to reach for sqlmap immediately — but first understand where the input goes and confirm the bug with the smallest possible test.",
    why: "SQLi can mean full database read, authentication bypass, and sometimes code execution. It's high impact, which is exactly why you validate carefully and avoid destructive payloads.",
    notes: [
      { heading: "Where", body: "Anywhere input reaches a query: login forms, search boxes, id/sort parameters, headers, and API JSON fields." },
      { heading: "Clues", body: "A single quote causes a 500 or a SQL error; boolean conditions change the page; ORDER BY changes column ordering; time-based payloads delay the response." },
      { heading: "Confirm safely", body: "Start with a quote and error observation, then a boolean pair (' AND 1=1-- vs ' AND 1=2--). Prefer read-only proofs. Never run destructive statements on someone's data.", tone: "warning" },
      { heading: "Validation over assumption", body: "A WAF alert or scanner hit is not proof. A controlled boolean or time difference you can reproduce is.", tone: "teacher" },
      { heading: "Remediation", body: "Parameterized queries / prepared statements. Input validation and least-privilege DB accounts are defense in depth, not the fix." },
    ],
    commands: [
      { id: "sqli-quote", command: "id=1'", platform: "web", purpose: "Probe with a single quote to provoke a SQL error.", why: "A database error or 500 on a lone quote is a strong first indicator.", lookFor: ["SQL syntax error", "500 vs normal 200"], risk: "medium", tags: ["sqli", "web"] },
      { id: "sqli-bool", command: "id=1' AND 1=1-- -   vs   id=1' AND 1=2-- -", platform: "web", purpose: "Boolean test: same input, opposite truth value.", why: "If TRUE returns the record and FALSE doesn't, the input is being evaluated in SQL — a reliable confirmation.", lookFor: ["Page differs between 1=1 and 1=2"], risk: "medium", tags: ["sqli", "boolean"] },
      { id: "sqli-sqlmap", command: "sqlmap -u 'http://<TARGET>/item?id=1' --batch --level 2 --risk 1", platform: "kali", purpose: "Automate confirmation/exploitation once a point is identified.", whenToUse: "After manual confirmation, in an authorized lab, with conservative level/risk.", why: "sqlmap is powerful but blunt — use it to confirm and enumerate, not as a first blind swing.", flags: [{ flag: "--batch", meaning: "Non-interactive defaults" }, { flag: "--risk/--level", meaning: "Keep low to stay conservative" }], risk: "high", commonMistakes: ["Running high risk/level against production", "Skipping manual understanding"], tags: ["sqli", "sqlmap"] },
    ],
    lookFor: ["SQL errors on a quote", "Boolean/time-based differences", "Login bypass with ' OR 1=1"],
    branches: [
      { condition: "Confirmed injectable", outcome: "Enumerate DB read impact conservatively and capture evidence; record as a validated finding.", goto: { type: "phase", id: "impact" }, risk: "high" },
    ],
    commonMistakes: ["Treating a scanner hit as confirmed", "Destructive payloads on real data"],
    next: ["web-authorization"],
    keywords: ["sqli", "sql injection", "sqlmap", "database", "injection"],
  }),
  vulnLesson({
    id: "web-xss",
    title: "Cross-Site Scripting (XSS)",
    difficulty: "intermediate",
    category: "web",
    summary: "Reflected, stored, and DOM XSS: where input echoes into pages and how to prove it without spraying alert() everywhere.",
    estMinutes: 8,
    methodology: ["OWASP WSTG-INPV-01/02"],
    objectives: ["Distinguish reflected/stored/DOM", "Prove execution in the right context", "Understand real impact"],
    teacherIntro:
      "XSS is about your input being rendered as code in someone's browser. The three flavors — reflected, stored, DOM — differ in where the input lives, but the test is the same idea: find where input is echoed and whether the browser executes it.",
    why: "XSS can hijack sessions, perform actions as the victim, and pivot to admin. Stored XSS in an admin-viewed field is especially serious.",
    notes: [
      { heading: "Find the reflection", body: "Enter a unique marker (e.g. zzq123) and search the response and DOM for where it appears. Context (HTML body, attribute, JS, URL) decides the payload." },
      { heading: "Prove carefully", body: "A harmless proof (document.title change, a benign console log, or a controlled callback) demonstrates execution without disrupting users. Reserve session-stealing PoCs for authorized, scoped tests.", tone: "warning" },
      { heading: "Stored is worse", body: "If your input persists and renders for other users (especially admins), impact climbs sharply." },
      { heading: "Remediation", body: "Context-aware output encoding, a strong Content-Security-Policy, and framework auto-escaping." },
    ],
    commands: [
      { id: "xss-marker", command: "search=zzq123<u>zzq</u>", platform: "web", purpose: "Inject a unique marker with a harmless tag to test reflection/rendering.", why: "Shows whether input is encoded or rendered, and in what context.", lookFor: ["Marker rendered as bold/underline vs escaped text"], risk: "low", tags: ["xss", "reflection"] },
    ],
    lookFor: ["Unencoded reflection of your input", "Input that persists and re-renders", "Sinks like innerHTML in JS"],
    commonMistakes: ["Only trying alert(1) in one context", "Not checking the rendering context"],
    next: ["web-authorization"],
    keywords: ["xss", "cross-site scripting", "reflected", "stored", "dom"],
  }),
  vulnLesson({
    id: "web-cmdi",
    title: "OS Command Injection",
    difficulty: "intermediate",
    category: "web",
    summary: "When input reaches a shell: recognize it, confirm with a benign command, and understand why it's critical.",
    estMinutes: 7,
    methodology: ["OWASP WSTG-INPV-12"],
    objectives: ["Identify command-exec sinks", "Confirm with harmless commands", "Grasp the severity"],
    teacherIntro:
      "Command injection is when your input is passed to a system shell. Features like 'ping this host' or 'convert this file' are prime suspects. Confirm with the most benign command possible — you don't need to run anything destructive to prove it.",
    why: "Command injection is usually direct code execution on the server — about as impactful as web bugs get. That's exactly why the proof should be minimal and safe.",
    notes: [
      { heading: "Where", body: "Any feature that likely shells out: network tools (ping/nslookup), file conversion, backups, or admin utilities." },
      { heading: "Confirm benignly", body: "Chain a harmless command with ; | && and observe output or timing (e.g. a controlled sleep). id or whoami output is proof enough — no need for anything destructive.", tone: "warning" },
      { heading: "Remediation", body: "Avoid shelling out; use language-native libraries. If unavoidable, use strict allow-lists and argument arrays, never string concatenation." },
    ],
    commands: [
      { id: "cmdi-test", command: "host=127.0.0.1;id", platform: "web", purpose: "Append a benign command to a parameter that likely reaches a shell.", why: "If the response includes 'uid=...', input is executing on the OS.", lookFor: ["uid=/gid= output", "command output appended to the page"], risk: "high", tags: ["command injection", "rce"] },
      { id: "cmdi-time", command: "host=127.0.0.1 && sleep 5", platform: "web", purpose: "Blind confirmation via timing.", why: "When output isn't reflected, a reliable delay you can toggle confirms execution.", lookFor: ["~5s delay only when payload present"], risk: "high", tags: ["command injection", "blind"] },
    ],
    lookFor: ["Command output in the response", "Toggleable time delays", "Errors mentioning sh/bash/cmd"],
    branches: [
      { condition: "Confirmed execution", outcome: "This is RCE — record it as critical, capture evidence, and proceed to controlled access within scope.", goto: { type: "phase", id: "exploitation" }, risk: "critical" },
    ],
    commonMistakes: ["Destructive test commands", "Assuming a WAF block means no bug"],
    next: ["web-sqli"],
    keywords: ["command injection", "rce", "os command", "shell"],
  }),
  vulnLesson({
    id: "web-lfi",
    title: "Path Traversal & LFI",
    difficulty: "intermediate",
    category: "web",
    summary: "Reading files outside the web root via traversal, and when local file inclusion escalates to code execution.",
    estMinutes: 7,
    methodology: ["OWASP WSTG-ATHZ-01", "WSTG-INPV"],
    objectives: ["Spot file parameters", "Read out-of-scope files safely", "Know LFI→RCE escalation paths"],
    teacherIntro:
      "When a parameter names a file (?page=, ?file=, ?template=), the app might let you climb out of its directory with ../ and read arbitrary files — or include and execute them.",
    why: "File read alone can leak configs, credentials, and source. Local file inclusion can escalate to code execution via log poisoning or PHP wrappers — a common HTB path.",
    notes: [
      { heading: "Confirm read", body: "Request a known file with traversal (../../../../etc/passwd on Linux, or a Windows equivalent). Getting its contents confirms traversal." },
      { heading: "Escalate to RCE", body: "If the included file is executed (classic PHP LFI), techniques like log poisoning or php://filter/wrappers can turn read into execute. Understand the mechanism before trying it.", tone: "info" },
      { heading: "Remediation", body: "Never build file paths from user input. Use fixed identifiers mapped server-side, canonicalize and validate, and disable dangerous wrappers." },
    ],
    commands: [
      { id: "lfi-passwd", command: "page=../../../../etc/passwd", platform: "web", purpose: "Test path traversal to a known file.", why: "Returning /etc/passwd content confirms traversal/LFI.", lookFor: ["root:x:0:0: line", "file contents in the response"], risk: "medium", tags: ["lfi", "traversal"] },
    ],
    lookFor: ["File-naming parameters", "/etc/passwd or win.ini contents", "PHP wrappers accepted"],
    commonMistakes: ["Only trying one traversal depth", "Missing the LFI→RCE escalation"],
    next: ["web-cmdi"],
    keywords: ["lfi", "path traversal", "file inclusion", "directory traversal"],
  }),
  vulnLesson({
    id: "web-ssrf",
    title: "Server-Side Request Forgery (SSRF)",
    difficulty: "advanced",
    category: "web",
    summary: "Make the server fetch a URL you control to reach internal services and cloud metadata.",
    estMinutes: 7,
    methodology: ["OWASP WSTG-INPV-19", "OWASP A10"],
    objectives: ["Identify URL-fetch features", "Reach internal-only resources", "Understand cloud metadata impact"],
    teacherIntro:
      "SSRF is tricking the server into making requests for you. Any feature that fetches a URL — webhooks, image loaders, PDF generators, link previews — is a candidate. The prize is usually internal services the server can reach but you can't.",
    why: "SSRF can expose internal admin panels, unauthenticated internal APIs, and — in cloud environments — instance metadata that yields credentials.",
    notes: [
      { heading: "Confirm", body: "Point the fetch at a listener you control and watch for the callback. Then pivot to internal targets (127.0.0.1, 169.254.169.254, internal hostnames)." },
      { heading: "Cloud metadata", body: "In cloud labs, the metadata endpoint (169.254.169.254) can return role credentials — high impact. Treat with care and stay in scope.", tone: "warning" },
      { heading: "Remediation", body: "Allow-list destinations, resolve and validate hosts, block link-local/internal ranges, and require authentication on internal services." },
    ],
    commands: [
      { id: "ssrf-callback", command: "url=http://<YOUR_LISTENER>/ssrf-test", platform: "web", purpose: "Make the server call back to you to confirm SSRF.", why: "A hit on your listener proves the server fetches attacker-controlled URLs.", lookFor: ["Inbound request from the target's IP"], risk: "medium", tags: ["ssrf"] },
    ],
    lookFor: ["URL/host parameters", "Callbacks to your listener", "Access to internal-only services"],
    next: ["web-authorization"],
    keywords: ["ssrf", "server side request forgery", "metadata", "internal"],
  }),
  vulnLesson({
    id: "web-fileupload",
    title: "Insecure File Upload",
    difficulty: "intermediate",
    category: "web",
    summary: "When upload filters are weak, an uploaded file can become a web shell — if you can also reach it.",
    estMinutes: 6,
    methodology: ["OWASP WSTG-BUSL-09"],
    objectives: ["Test filter strength", "Determine if uploads are executable/served", "Understand the chain to RCE"],
    teacherIntro:
      "File upload is dangerous when two things line up: the app accepts a file it shouldn't, and that file lands somewhere it gets executed or served. You need both — an accepted web shell that never runs is just a file.",
    why: "A successful malicious upload is often direct code execution. It's also a great lesson in chaining: upload + path + execution.",
    notes: [
      { heading: "Test the filter", body: "Try disallowed extensions, double extensions, content-type mismatches, and magic-byte tricks. Note exactly what passes." },
      { heading: "Find where it lands", body: "An accepted shell is useless if you can't reach it or it isn't executed. Locate the upload path (content discovery helps) and confirm execution.", tone: "tip" },
      { heading: "Remediation", body: "Validate by content not extension, store outside the web root, randomize names, and serve with non-executable handlers." },
    ],
    lookFor: ["Weak extension/content-type checks", "Predictable upload paths", "Whether the path executes code"],
    branches: [
      { condition: "You uploaded and executed a shell", outcome: "You have code execution — move to a stable foothold within scope.", goto: { type: "phase", id: "initial_access" }, risk: "critical" },
    ],
    next: ["web-content-discovery"],
    keywords: ["file upload", "web shell", "rce", "upload"],
  }),
];
