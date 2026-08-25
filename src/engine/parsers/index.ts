import type { ParseResult } from "@/types";
import { detectNmap, parseNmap } from "./nmap";
import {
  detectHttp,
  parseHttp,
  detectSmb,
  parseSmb,
  detectDns,
  parseDns,
  detectLinux,
  parseLinux,
  detectWindows,
  parseWindows,
} from "./simple";

export interface Parser {
  id: string;
  label: string;
  detect: (text: string) => boolean;
  parse: (text: string) => ParseResult;
}

/** Order matters: earlier parsers win ties. Nmap is the most structured/common. */
export const PARSERS: Parser[] = [
  { id: "nmap", label: "Nmap", detect: detectNmap, parse: parseNmap },
  { id: "smb", label: "SMB / NetExec", detect: detectSmb, parse: parseSmb },
  { id: "windows", label: "Windows enum", detect: detectWindows, parse: parseWindows },
  { id: "linux", label: "Linux enum", detect: detectLinux, parse: parseLinux },
  { id: "http", label: "HTTP headers", detect: detectHttp, parse: parseHttp },
  { id: "dns", label: "DNS", detect: detectDns, parse: parseDns },
];

/** Generic fallback: extract obvious artifacts without over-claiming. */
function genericParse(text: string): ParseResult {
  const observations: ParseResult["observations"] = [];
  const ips = [...new Set([...text.matchAll(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g)].map((m) => m[1]))].slice(0, 8);
  const urls = [...new Set([...text.matchAll(/\bhttps?:\/\/[^\s"'<>]+/gi)].map((m) => m[0]))].slice(0, 8);
  const creds = [...text.matchAll(/\b(user(?:name)?|pass(?:word)?|pwd)\b\s*[:=]\s*(\S+)/gi)].slice(0, 6);

  if (ips.length) observations.push({ label: `IP addresses seen: ${ips.join(", ")}`, severityHint: "info" });
  if (urls.length) observations.push({ label: `URLs seen: ${urls.slice(0, 4).join(", ")}${urls.length > 4 ? "…" : ""}`, severityHint: "info" });
  if (creds.length) observations.push({ label: `Possible credential-like strings detected (${creds.length})`, detail: "Review manually — record any real credentials in your notes.", severityHint: "notable" });

  return {
    parser: "generic",
    matched: observations.length > 0,
    headline: observations.length ? "Extracted a few artifacts" : "No structured pattern recognized",
    observations,
    suggestions: [
      { label: "Not sure what to do next? Open 'I'm stuck'", goto: { type: "route", id: "#stuck" } },
    ],
    caveat:
      "This output didn't match a known parser, so only obvious artifacts were extracted. You can still record findings and notes manually.",
  };
}

/**
 * Analyze pasted output: detect the best-matching parser and run it.
 * Falls back to a conservative generic extractor.
 */
export function analyzeOutput(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      parser: "none",
      matched: false,
      headline: "Nothing to analyze",
      observations: [],
      suggestions: [],
      caveat: "Paste command output above and analyze it.",
    };
  }
  for (const p of PARSERS) {
    if (p.detect(trimmed)) {
      const result = p.parse(trimmed);
      if (result.matched) return result;
    }
  }
  return genericParse(trimmed);
}

export { parseNmap };
