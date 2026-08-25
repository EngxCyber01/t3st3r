import type { Lesson } from "@/types";

export const postLessons: Lesson[] = [
  {
    id: "os-identification",
    title: "Which OS Am I On?",
    category: "post",
    categoryLabel: "Post-Exploitation",
    difficulty: "beginner",
    summary: "Safe, fast ways to tell Linux from Windows the moment you get a shell — so you pick the right workflow.",
    estMinutes: 4,
    objectives: ["Identify the OS from a shell", "Choose the correct post-ex path"],
    teacherIntro:
      "You have a shell but you're not sure what you're standing on. Before enumerating, confirm the OS — the commands and escalation paths are completely different. A couple of harmless commands settle it.",
    why: "Running Linux commands on Windows (or vice versa) wastes time and creates confusing errors. Two seconds of identification saves ten minutes of flailing.",
    notes: [
      { heading: "Tells", body: "`ver` or `echo %OS%` works on Windows; `uname -a` works on Linux. Path separators (\\ vs /), the prompt style, and whether `dir` vs `ls` works are all quick hints." },
      { heading: "From outside", body: "Before you even have a shell, nmap -O, TTL (64≈Linux, 128≈Windows), and service banners (Samba vs microsoft-ds, OpenSSH vs Windows) usually tell you.", tone: "tip" },
    ],
    commands: [
      { id: "os-uname", command: "uname -a || ver", platform: "any", purpose: "Print the OS identity (one of these two will work).", why: "uname succeeds on Linux; ver succeeds on Windows cmd — the one that returns tells you where you are.", lookFor: ["Linux kernel string", "Microsoft Windows [Version ...]"], risk: "low", tags: ["os", "identify"] },
    ],
    lookFor: ["uname vs ver", "Path separators", "Prompt style"],
    branches: [
      { condition: "Linux", outcome: "Open the Linux post-exploitation workflow.", goto: { type: "lesson", id: "lin-enum" } },
      { condition: "Windows", outcome: "Open the Windows post-exploitation workflow.", goto: { type: "lesson", id: "win-enum" } },
    ],
    next: ["lin-enum", "win-enum", "shell-stabilize"],
    keywords: ["os", "identify", "linux", "windows", "uname", "ver"],
  },
  {
    id: "shell-stabilize",
    title: "Stabilizing a Shell",
    category: "post",
    categoryLabel: "Post-Exploitation",
    difficulty: "beginner",
    summary: "Turn a fragile reverse shell into a proper interactive TTY so you can work without pain.",
    estMinutes: 5,
    objectives: ["Upgrade a dumb shell to a PTY", "Fix terminal size and behavior", "Know why it matters"],
    teacherIntro:
      "A raw reverse shell can't use tab-completion, arrow keys, sudo, or text editors, and dies on Ctrl-C. Before doing real work, upgrade it to a full interactive TTY. Two minutes now saves constant frustration.",
    why: "Many escalation steps (sudo prompts, editors, interactive tools) simply don't work in a dumb shell. Stabilizing is a prerequisite, not a nicety.",
    notes: [
      { heading: "The classic upgrade", body: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")' → Ctrl-Z → `stty raw -echo; fg` → Enter → `export TERM=xterm`. Now you have a usable terminal." },
      { heading: "Fix the size", body: "In another terminal run `stty size`, then in the shell `stty rows <R> cols <C>` so editors render correctly." },
      { heading: "Windows", body: "For Windows, prefer a proper channel from the start — evil-winrm or a well-behaved C2/meterpreter session beats a raw nc shell.", tone: "tip" },
    ],
    commands: [
      { id: "shell-pty", command: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'", platform: "linux", purpose: "Spawn a pseudo-terminal for an interactive shell.", why: "Gives you job control and interactive program support.", lookFor: ["A normal-looking bash prompt"], risk: "low", next: "Background with Ctrl-Z and run stty raw -echo; fg.", tags: ["shell", "pty", "stabilize"] },
    ],
    lookFor: ["Working tab-completion and arrows", "sudo/editors function", "Ctrl-C no longer kills the shell"],
    next: ["lin-enum"],
    keywords: ["shell", "stabilize", "pty", "tty", "reverse shell"],
  },
];
