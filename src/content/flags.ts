/* ============================================================
   Command breakdown engine — explains a command part by part.
   Given a command string, it identifies the tool and every flag,
   and returns an accurate, tool-aware meaning for each part so the
   UI can show "what each piece does" for EVERY command (spec §16).
   It only explains tokens it actually knows — it never guesses.
   ============================================================ */

export interface FlagInfo {
  meaning: string;
  /** "you can also use…" alternative. */
  alt?: string;
}

export interface CommandPart {
  part: string;
  meaning: string;
  alt?: string;
}

/** <TARGET> / <DOMAIN> style placeholders. */
const PLACEHOLDERS: Record<string, string> = {
  TARGET: "the target host or IP you're testing",
  IP: "the target IP address",
  DOMAIN: "the target domain name",
  HOSTNAME: "the target hostname",
  USER: "a username",
  PASS: "a password",
  PORT: "a port number",
  PORTS: "the specific ports to scan (e.g. 22,80,445)",
  URL: "a target URL",
  NS: "the name server to query",
  YOUR_IP: "your own machine's IP — use your VPN/tun0 address, not the LAN one",
  YOUR_LISTENER: "your listener's URL/host that the target calls back to",
  NTLM_HASH: "an NTLM hash (used for pass-the-hash)",
  HASH: "a hash value",
  WORDLIST: "path to a wordlist",
  BASELINE_SIZE: "the baseline response size to filter out (from the default response)",
};

/** Tool-agnostic tokens (operators, redirects, shared idioms). */
const COMMON: Record<string, FlagInfo> = {
  "|": { meaning: "pipe — feed this command's output into the next one" },
  "&&": { meaning: "run the next command only if this one succeeds" },
  ";": { meaning: "run the commands one after another" },
  ">": { meaning: "redirect output into a file (overwrite)" },
  ">>": { meaning: "redirect output into a file (append)" },
  "2>/dev/null": { meaning: "discard error messages (send stderr to /dev/null)" },
  "2>nul": { meaning: "discard error messages (Windows)" },
  FUZZ: {
    meaning: "insertion point — each line of the wordlist is placed here in turn",
    alt: "you can put FUZZ in the path, a header, or a parameter",
  },
};

/** Unambiguous flags — same meaning regardless of tool. */
const GENERIC: Record<string, FlagInfo> = {
  // nmap output / scan controls
  "-oA": { meaning: "save results in ALL formats (normal, greppable, XML)", alt: "-oN normal only, -oG greppable, -oX XML" },
  "-oN": { meaning: "save normal-format output to a file" },
  "-oG": { meaning: "save greppable output to a file" },
  "-oX": { meaning: "save XML output to a file" },
  "-sC": { meaning: "run nmap's default NSE scripts (safe, informative)" },
  "-sV": { meaning: "detect the service/version behind each port" },
  "-sS": { meaning: "SYN 'stealth' scan (half-open)" },
  "-sT": { meaning: "full TCP connect scan" },
  "-sU": { meaning: "UDP scan (slower — limit the port count)" },
  "-sn": { meaning: "ping/host-discovery only, no port scan" },
  "-Pn": { meaning: "skip host discovery — treat the host as up (use when ping is filtered)" },
  "-p-": { meaning: "scan ALL 65535 TCP ports" },
  "--top-ports": { meaning: "scan the N most common ports" },
  "--min-rate": { meaning: "send at least N packets/sec — speeds the scan up" },
  "--script": { meaning: "run specific NSE script(s) or a category" },
  // dig
  "+noall": { meaning: "reset all of dig's output sections (start from nothing)" },
  "+answer": { meaning: "show only the ANSWER section — combine with +noall for clean output" },
  "+short": { meaning: "terse output — just the values", alt: "great for scripting" },
  "+trace": { meaning: "trace the delegation from the root servers down" },
  axfr: { meaning: "request a full DNS zone transfer (dumps every record if allowed)" },
  // NetExec (nxc) modules & switches
  "--shares": { meaning: "list SMB shares and your access to them" },
  "--users": { meaning: "enumerate domain users" },
  "--pass-pol": { meaning: "read the password/lockout policy" },
  "--rid-brute": { meaning: "enumerate users/groups by cycling RIDs" },
  "--continue-on-success": { meaning: "keep going after a valid login (don't stop at the first)" },
  "--asreproast": { meaning: "request AS-REP hashes for pre-auth-disabled accounts" },
  "--kerberoast": { meaning: "request Kerberoast (TGS) hashes for SPN accounts" },
  // impacket
  "-request": { meaning: "actually request the tickets/hashes (not just list)" },
  "-just-dc": { meaning: "dump only the domain controller's account hashes (DCSync)" },
  "-no-pass": { meaning: "don't prompt for a password (e.g. AS-REP roasting without creds)" },
  "-dc-ip": { meaning: "the domain controller's IP to talk to" },
  "-windows-auth": { meaning: "use Windows (NTLM) authentication instead of SQL auth" },
  "-usersfile": { meaning: "a file of usernames to try" },
  "-sam": { meaning: "the saved SAM hive to read local hashes from" },
  "-system": { meaning: "the saved SYSTEM hive (holds the key that decrypts the SAM)" },
  "-smb2support": { meaning: "enable SMB2 on the throwaway SMB server" },
  // recon
  "-silent": { meaning: "output results only — suppress the banner/noise" },
  // misc unambiguous
  "-lvnp": { meaning: "listen, verbose, numeric (no DNS), on the given port" },
  "-tulpn": { meaning: "show TCP+UDP listening sockets, the owning process, and numeric ports" },
  "-ano": { meaning: "all connections, numeric addresses, with the owning PID" },
  "-uwcqv": { meaning: "accesschk: show permissions, quiet banner, verbose" },
};

/** Tool-specific meanings for AMBIGUOUS flags (e.g. -u, -p, -c). */
const TOOLS: Record<string, Record<string, FlagInfo>> = {
  dig: {
    ANY: { meaning: "request every record type (A, MX, NS, TXT, …)", alt: "or ask for one type: A / MX / NS / TXT" },
    "@": { meaning: "query this specific name server (prefix the server with @)" },
  },
  nmap: {
    "-p": { meaning: "scan only these ports (e.g. -p80 or -p22,80,445)" },
    "-A": { meaning: "aggressive: version + OS detection + scripts + traceroute" },
    "-O": { meaning: "attempt OS detection" },
    "-v": { meaning: "verbose output" },
  },
  ffuf: {
    "-u": { meaning: "the target URL, with FUZZ marking the insertion point" },
    "-w": { meaning: "wordlist to spray", alt: "SecLists is a great default" },
    "-mc": { meaning: "match these HTTP status codes (mc = match code)" },
    "-fc": { meaning: "filter OUT these status codes (fc = filter code)" },
    "-fs": { meaning: "filter OUT responses of this size (fs = filter size)" },
    "-e": { meaning: "append these extensions to each word (e.g. .php,.bak)" },
    "-H": { meaning: "add a request header (used here for vhost fuzzing)" },
    "-t": { meaning: "number of concurrent threads — tune to avoid hammering the target" },
    "-recursion": { meaning: "recurse into discovered directories" },
  },
  feroxbuster: {
    "-u": { meaning: "the target URL" },
    "-w": { meaning: "wordlist to use" },
  },
  gobuster: {
    "-u": { meaning: "the target URL" },
    "-w": { meaning: "wordlist to use" },
    "-x": { meaning: "file extensions to append (e.g. php,txt,bak)" },
    dir: { meaning: "directory/file brute-force mode" },
  },
  curl: {
    "-I": { meaning: "HEAD request — fetch only the response headers" },
    "-s": { meaning: "silent — hide the progress meter" },
    "-S": { meaning: "still show errors when silent" },
    "-k": { meaning: "ignore TLS certificate errors (labs use self-signed certs)" },
    "-L": { meaning: "follow redirects" },
    "-X": { meaning: "set the HTTP method (GET/POST/PUT/…)" },
    "-H": { meaning: "add a request header" },
    "-d": { meaning: "send this data in the request body (implies POST)" },
    "-o": { meaning: "write the response to a file" },
    "-sSIk": { meaning: "combined: silent + show-errors + headers-only + ignore-cert" },
    "-Ik": { meaning: "combined: headers-only + ignore-cert" },
    "--user": { meaning: "credentials for HTTP/FTP auth (user:pass)" },
  },
  whatweb: {
    "-a": { meaning: "aggression level 1–4 (higher = more requests, more detail)" },
  },
  smbclient: {
    "-N": { meaning: "no password — try a null session" },
    "-L": { meaning: "list the available shares" },
    "-U": { meaning: "the username to authenticate as" },
    "-c": { meaning: "run these smbclient commands non-interactively" },
  },
  nxc: {
    "-u": { meaning: "username (or a file of usernames)" },
    "-p": { meaning: "password (or a file of passwords)" },
    "-H": { meaning: "authenticate with an NTLM hash (pass-the-hash)" },
    "-M": { meaning: "run a NetExec module (e.g. spider_plus, gpp_password)" },
    "-d": { meaning: "the domain to authenticate against" },
  },
  ldapsearch: {
    "-x": { meaning: "simple authentication (used here for an anonymous bind)" },
    "-H": { meaning: "the LDAP server URI (ldap://host or ldaps://host)" },
    "-b": { meaning: "the search base DN (e.g. DC=corp,DC=local)" },
    "-s": { meaning: "search scope (base / one / sub)" },
    "-D": { meaning: "the bind DN (who you authenticate as)" },
    "-w": { meaning: "the bind password" },
  },
  ldapdomaindump: {
    "-u": { meaning: "the username (DOMAIN\\user)" },
    "-p": { meaning: "the password" },
  },
  hashcat: {
    "-m": { meaning: "hash mode/type (e.g. 1000 NTLM, 13100 Kerberoast, 18200 AS-REP)" },
    "-a": { meaning: "attack mode (0 = straight wordlist)" },
    "-r": { meaning: "rule file that mutates each word (e.g. best64)" },
    "-o": { meaning: "write cracked results to this file" },
  },
  hydra: {
    "-l": { meaning: "a single username" },
    "-L": { meaning: "a file of usernames" },
    "-p": { meaning: "a single password" },
    "-P": { meaning: "a file of passwords" },
    "-f": { meaning: "stop after the first valid login is found" },
    "-s": { meaning: "target a non-default port" },
  },
  ssh: {
    "-i": { meaning: "use this private key file to authenticate" },
    "-v": { meaning: "verbose — shows the auth methods being negotiated" },
    "-L": { meaning: "local port forward (tunnel a remote port to you)" },
    "-D": { meaning: "open a dynamic SOCKS proxy for pivoting" },
  },
  wget: {
    "-r": { meaning: "recursively download everything reachable" },
    "-m": { meaning: "mirror mode (recursive + timestamps)" },
  },
  find: {
    "-perm": { meaning: "match files by permission bits (e.g. -4000 = SUID)" },
    "-type": { meaning: "restrict to a file type (f = regular file)" },
    "-name": { meaning: "match by filename/pattern" },
    "-writable": { meaning: "match files you can write to" },
    "-exec": { meaning: "run a command on each match (this is what makes some SUID binaries dangerous)" },
    "-not": { meaning: "negate the next condition" },
    "-path": { meaning: "match against the whole path" },
    "-quit": { meaning: "stop after the first match" },
  },
  getcap: {
    "-r": { meaning: "recurse through the whole filesystem" },
  },
  snmpwalk: {
    "-v2c": { meaning: "use SNMP version 2c" },
    "-c": { meaning: "the community string (try 'public' / 'private')" },
  },
  onesixtyone: {
    "-c": { meaning: "a file of community strings to try" },
  },
  xfreerdp: {
    "/u:": { meaning: "the username" },
    "/p:": { meaning: "the password" },
    "/v:": { meaning: "the target host to connect to" },
    "/cert:ignore": { meaning: "accept the self-signed certificate (labs)" },
    "/dynamic-resolution": { meaning: "resize the RDP session cleanly" },
  },
  "evil-winrm": {
    "-i": { meaning: "the target IP" },
    "-u": { meaning: "the username" },
    "-p": { meaning: "the password" },
    "-S": { meaning: "use HTTPS (WinRM over TLS, port 5986)" },
  },
  mysql: {
    "-h": { meaning: "the database host" },
    "-u": { meaning: "the database username" },
    "-p": { meaning: "prompt for the password (no space before the value)" },
  },
  psql: {
    "-h": { meaning: "the database host" },
    "-U": { meaning: "the database username" },
  },
  whoami: {
    "/priv": { meaning: "list your token privileges (look for SeImpersonate!)" },
    "/groups": { meaning: "list your group memberships" },
    "/all": { meaning: "everything: user, groups, and privileges" },
  },
  findstr: {
    "/si": { meaning: "search subdirectories (/s), case-insensitive (/i)" },
  },
  reg: {
    "/v": { meaning: "query a specific registry value" },
  },
  nc: {
    "-l": { meaning: "listen for an incoming connection" },
  },
  certutil: {
    "-urlcache": { meaning: "use the URL cache subsystem (the download trick)" },
    "-f": { meaning: "force overwrite of the existing file" },
  },
  subfinder: {
    "-d": { meaning: "the domain to enumerate subdomains for" },
    "-silent": { meaning: "output only the results" },
  },
  httpx: {
    "-silent": { meaning: "output only the live URLs" },
  },
  python3: {
    "-m": { meaning: "run a module as a script (e.g. http.server)" },
    "-c": { meaning: "run the given code string inline" },
  },
  ls: {
    "-la": { meaning: "long listing, including hidden files" },
  },
};

/** Tool-level alternatives ("you could also use…"). */
const TOOL_ALTS: Record<string, string> = {
  ffuf: "gobuster and feroxbuster do the same content discovery.",
  gobuster: "ffuf and feroxbuster are alternatives.",
  feroxbuster: "ffuf and gobuster are alternatives.",
  nxc: "nxc is NetExec — the successor to CrackMapExec (cme).",
  dig: "host and nslookup do simpler one-off lookups.",
  hashcat: "John the Ripper (john) is an alternative offline cracker.",
  smbclient: "nxc (NetExec) can also list and spider shares.",
  hydra: "medusa and ncrack are alternative online password tools.",
  whatweb: "httpx and wappalyzer also fingerprint web tech.",
};

function normalizeTool(token: string): string {
  let t = token.replace(/^['"]|['"]$/g, "");
  // strip a leading path: /usr/bin/find -> find
  if (t.includes("/")) t = t.split("/").filter(Boolean).pop() ?? t;
  t = t.toLowerCase();
  if (t === "netexec" || t === "crackmapexec" || t === "cme") return "nxc";
  if (t.startsWith("impacket-")) return "impacket";
  if (/getnpusers|getuserspns|secretsdump|mssqlclient/.test(t)) return "impacket";
  return t;
}

function lookupFlag(tool: string, tok: string): FlagInfo | undefined {
  const toolDict = TOOLS[tool];
  // try exact, then a couple of value-stripped variants
  const variants = [tok];
  if (/[:=]/.test(tok)) variants.push(tok.replace(/([:=]).*$/, "$1")); // /u:admin -> /u:
  if (/^(-{1,2}[a-z]+)\d/i.test(tok)) variants.push(tok.replace(/\d.*$/, "")); // -p80 -> -p
  for (const v of variants) {
    if (toolDict?.[v]) return toolDict[v];
    if (GENERIC[v]) return GENERIC[v];
  }
  return undefined;
}

const IMPACKET_FLAGS: Record<string, FlagInfo> = {
  LOCAL: { meaning: "parse the supplied hives locally (offline), not over the network" },
};

/**
 * Explain a command part by part. Curated flags (authored on the Command)
 * take priority; everything else is derived from the dictionaries above.
 * Unknown tokens are skipped — the breakdown never invents a meaning.
 */
export function explainCommandParts(
  command: string,
  curated?: { flag: string; meaning: string }[]
): CommandPart[] {
  const out: CommandPart[] = [];
  const seen = new Set<string>();
  const push = (part: string, meaning: string, alt?: string) => {
    if (seen.has(part)) return;
    seen.add(part);
    out.push({ part, meaning, alt });
  };

  for (const f of curated ?? []) push(f.flag, f.meaning);

  for (const line of command.split("\n")) {
    const toks = line.trim().split(/\s+/).filter(Boolean);
    if (!toks.length) continue;
    let tool = normalizeTool(toks[0]);
    if ((tool === "sudo" || tool === "doas") && toks[1]) tool = normalizeTool(toks[1]);

    for (const raw of toks) {
      const tok = raw.replace(/^['"]|['"]$/g, "");

      const ph = tok.match(/^<([A-Z_]+)>$/);
      if (ph && PLACEHOLDERS[ph[1]]) {
        push(tok, PLACEHOLDERS[ph[1]]);
        continue;
      }
      if (tok.includes("FUZZ")) {
        push("FUZZ", COMMON.FUZZ.meaning, COMMON.FUZZ.alt);
        continue;
      }
      if (COMMON[tok]) {
        push(tok, COMMON[tok].meaning, COMMON[tok].alt);
        continue;
      }
      if (tool === "impacket" && IMPACKET_FLAGS[tok]) {
        push(tok, IMPACKET_FLAGS[tok].meaning);
        continue;
      }
      // dig @server style — target a specific name server
      if (tok.startsWith("@") && tok.length > 1) {
        push(tok, "query this specific name server (the @ prefix picks the server)");
        continue;
      }
      // Look the token up in the tool-aware + generic dictionaries. This matches
      // both flags (-u, --script, +noall, /priv) and bare keywords (ANY, axfr,
      // dir). Unknown tokens — paths, values, filenames — return nothing and are
      // skipped, so a breakdown never invents a meaning.
      const info = lookupFlag(tool, tok);
      if (info) push(tok, info.meaning, info.alt);
    }
  }

  return out;
}

/** The tool this command's first line uses (for the alternatives note). */
export function commandTool(command: string): string {
  const first = command.split("\n")[0].trim().split(/\s+/)[0] ?? "";
  let tool = normalizeTool(first);
  const toks = command.split("\n")[0].trim().split(/\s+/);
  if ((tool === "sudo" || tool === "doas") && toks[1]) tool = normalizeTool(toks[1]);
  return tool;
}

/** "You could also use…" note for the command's tool, if any. */
export function commandAlternatives(command: string): string | undefined {
  return TOOL_ALTS[commandTool(command)];
}
