import type { PhaseId } from "@/types";

/**
 * Smart command categorizer. Given any command, infer which area/phase it
 * belongs to (recon, scanning, web, SMB, Active Directory, privesc, …) from the
 * tool name and tell-tale flags. Rules are ordered specific → general; the
 * first match wins. Falls back to "other" so nothing is ever lost.
 */
export interface CommandCategory {
  id: string;
  label: string;
  icon: string;
  phase: PhaseId;
}

interface Rule {
  cat: CommandCategory;
  patterns: RegExp[];
}

const C = (id: string, label: string, icon: string, phase: PhaseId): CommandCategory => ({
  id,
  label,
  icon,
  phase,
});

export const OTHER_CATEGORY = C("other", "Other / Uncategorized", "SquareTerminal", "enumeration");

// Ordered rules — most specific first.
const RULES: Rule[] = [
  {
    cat: C("reverse-shell", "Reverse Shells", "Terminal", "exploitation"),
    patterns: [/nc\s+-lvnp/, /\/dev\/tcp\//, /\bmsfvenom\b/, /bash\s+-i/, /socat\b.*exec/, /mkfifo/, /reverse.?shell/, /\brlwrap\b/],
  },
  {
    cat: C("file-transfer", "File Transfer", "ArrowLeftRight", "post_exploitation"),
    patterns: [/http\.server/, /impacket-smbserver|smbserver\.py/, /\bcertutil\b/, /:8000\//, /downloadstring|downloadfile/, /invoke-webrequest|\biwr\b/, /\bscp\b/, /\btftp\b/, /\bupload\b/],
  },
  {
    cat: C("pivoting", "Pivoting & Tunneling", "Share2", "post_exploitation"),
    patterns: [/\bchisel\b/, /\bligolo\b/, /proxychains/, /\bsshuttle\b/, /ssh\s+.*-[LDR]\b/, /socat\s+tcp-listen/, /-D\s*9050/],
  },
  {
    cat: C("metasploit", "Metasploit", "Crosshair", "exploitation"),
    patterns: [/msfconsole/, /use\s+(exploit|auxiliary|post)\//, /set\s+rhosts/, /\bmeterpreter\b/, /multi\/handler/],
  },
  {
    cat: C("active-directory", "Active Directory", "Network", "enumeration"),
    patterns: [
      /\bbloodhound(-python)?\b/,
      /\bkerbrute\b/,
      /impacket-(getnpusers|getuserspns|secretsdump|psexec|wmiexec|smbexec|dcomexec|ticketer|goldenpac|addcomputer)/,
      /getnpusers|getuserspns|secretsdump/,
      /\bcertipy\b/,
      /\brubeus\b/,
      /ntlmrelayx/,
      /nxc\s+ldap/,
      /\bldapdomaindump\b/,
      /\bwindapsearch\b/,
      /\bldapsearch\b/,
      /--asreproast|--kerberoast|-just-dc|-request/,
    ],
  },
  {
    cat: C("database", "Databases", "Database", "enumeration"),
    patterns: [/\bmysql\b/, /\bmssqlclient\b/, /\bsqlcmd\b/, /\bpsql\b/, /redis-cli/, /\bmongosh?\b/, /nxc\s+(mssql|mysql|postgres)/, /xp_cmdshell/],
  },
  {
    cat: C("web-exploit", "Web Exploitation", "Bug", "exploitation"),
    patterns: [/\bsqlmap\b/, /\bcommix\b/, /xsstrike/, /\btplmap\b/, /nosqlmap/, /\bwfuzz\b.*(sqli|payload)/],
  },
  {
    cat: C("passwords", "Passwords & Hashes", "KeyRound", "exploitation"),
    patterns: [/\bhashcat\b/, /\bjohn\b/, /\bhydra\b/, /hash-?id(entifier)?/, /\bunshadow\b/, /\bmedusa\b/, /\bncrack\b/, /--continue-on-success/, /2john\b/],
  },
  {
    cat: C("winrm", "WinRM", "SquareTerminal", "enumeration"),
    patterns: [/evil-winrm/, /nxc\s+winrm/],
  },
  {
    cat: C("rdp", "RDP", "Monitor", "enumeration"),
    patterns: [/xfreerdp/, /\brdesktop\b/, /nxc\s+rdp/],
  },
  {
    cat: C("smb", "SMB", "Server", "enumeration"),
    patterns: [/\bsmbclient\b/, /\bsmbmap\b/, /enum4linux/, /rpcclient/, /nxc\s+smb/, /crackmapexec\s+smb/, /\bnmblookup\b/],
  },
  {
    cat: C("ssh", "SSH", "SquareTerminal", "enumeration"),
    patterns: [/^ssh\b/, /\bssh\s+[\w.<@-]+@/, /ssh-audit/, /\bsshpass\b/],
  },
  {
    cat: C("ftp", "FTP", "FolderInput", "enumeration"),
    patterns: [/^ftp\b/, /ftp:\/\//],
  },
  {
    cat: C("snmp", "SNMP", "Network", "enumeration"),
    patterns: [/snmpwalk/, /onesixtyone/, /snmp-?check/, /snmpbulkwalk/],
  },
  {
    cat: C("smtp", "SMTP / Mail", "Mail", "enumeration"),
    patterns: [/smtp-user-enum/, /\bswaks\b/],
  },
  {
    cat: C("dns", "DNS & Recon", "Globe", "recon"),
    patterns: [/\bdig\b/, /dnsrecon/, /dnsenum/, /nslookup/, /subfinder/, /\bamass\b/, /\bfierce\b/, /\bdnsx\b/, /crt\.sh/],
  },
  {
    cat: C("recon", "Host Discovery & Recon", "Radar", "recon"),
    patterns: [/\bwhois\b/, /\bfping\b/, /netdiscover/, /arp-scan/],
  },
  {
    cat: C("scanning", "Scanning", "ScanLine", "scanning"),
    patterns: [/\bnmap\b/, /\bmasscan\b/, /\brustscan\b/, /\bnaabu\b/, /unicornscan/],
  },
  {
    cat: C("windows-privesc", "Windows PrivEsc", "TrendingUp", "privilege_escalation"),
    patterns: [/winpeas/, /printspoofer/, /godpotato/, /juicypotato/, /powerup/, /whoami\s+\/priv/, /accesschk/, /\bsharpup\b/, /\bseatbelt\b/, /alwaysinstallelevated/],
  },
  {
    cat: C("linux-privesc", "Linux PrivEsc", "TrendingUp", "privilege_escalation"),
    patterns: [/linpeas/, /\bpspy\d*/, /sudo\s+-l/, /find\s+\/\s+-perm/, /\bgetcap\b/, /gtfobins/, /\/etc\/shadow/, /linux-exploit-suggester/, /\bcrontab\b/],
  },
  {
    cat: C("web", "HTTP / Web", "Globe", "enumeration"),
    patterns: [/\bcurl\b/, /\bffuf\b/, /gobuster/, /feroxbuster/, /\bdirb\b/, /whatweb/, /\bnikto\b/, /wpscan/, /\bnuclei\b/, /\bwfuzz\b/, /\bhttpx\b/, /https?:\/\//, /\bwget\b/],
  },
  {
    cat: C("post-ex-enum", "Host Enumeration (post-ex)", "Terminal", "post_exploitation"),
    patterns: [/whoami/, /systeminfo/, /net\s+(user|localgroup)/, /\bhostname\b/, /ipconfig/, /ifconfig/, /netstat/, /\bss\s+-/, /ps\s+aux/, /tasklist/, /\buname\b/, /^id\b/],
  },
];

/** Categorize a command → the matching category (or Other). */
export function categorizeCommand(command: string): CommandCategory {
  const c = command.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(c))) return rule.cat;
  }
  return OTHER_CATEGORY;
}

/** All categories that the categorizer can produce (for the override picker). */
export const ALL_CATEGORIES: CommandCategory[] = [
  ...RULES.map((r) => r.cat),
  OTHER_CATEGORY,
];

export function getCategory(id: string): CommandCategory {
  return ALL_CATEGORIES.find((c) => c.id === id) ?? OTHER_CATEGORY;
}
