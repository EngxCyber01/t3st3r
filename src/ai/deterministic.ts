import type {
  AnalysisInput,
  AnalysisResult,
  AnalysisClaim,
  ExplanationInput,
  NextStepInput,
  NextStepResult,
  TeacherAIProvider,
} from "@/types";
import { analyzeOutput } from "@/engine/parsers";
import { lookupTerm } from "@/content/glossary";
import { getLesson } from "@/content/lessons";

/**
 * The deterministic "teacher engine" — works with NO external AI (spec §62).
 * Critically, it labels every claim as OBSERVED / INFERENCE / HYPOTHESIS
 * and never invents facts (spec §13, §61).
 */
export const deterministicProvider: TeacherAIProvider = {
  id: "deterministic",
  label: "Built-in engine (no AI)",
  requiresKey: false,

  async analyzeOutput({ output }: AnalysisInput): Promise<AnalysisResult> {
    const result = analyzeOutput(output);
    const claims: AnalysisClaim[] = [];

    // OBSERVED — straight from the parsed output.
    for (const obs of result.observations) {
      claims.push({ kind: "observed", text: obs.detail ? `${obs.label} — ${obs.detail}` : obs.label });
    }

    // INFERENCE — reasonable interpretation the suggestions encode.
    for (const s of result.suggestions.slice(0, 3)) {
      claims.push({ kind: "inference", text: s.detail ? `${s.label}: ${s.detail}` : s.label });
    }

    // HYPOTHESIS — the standing reminder that leads are not proof.
    if (result.caveat) {
      claims.push({ kind: "hypothesis", text: result.caveat });
    }

    return {
      provider: this.id,
      summary: result.headline ?? "Analysis complete.",
      claims,
      suggestions: result.suggestions,
      raw: output,
    };
  },

  async explainConcept({ concept }: ExplanationInput): Promise<string> {
    const term = lookupTerm(concept);
    if (term) return term.long ? `${term.short}\n\n${term.long}` : term.short;
    const lesson = getLesson(concept);
    if (lesson) return `${lesson.title}: ${lesson.summary}`;
    return `No built-in definition for "${concept}". Try the Glossary or search (Ctrl+K).`;
  },

  async suggestNextStep({ known }: NextStepInput): Promise<NextStepResult> {
    const has = (k: string) => known.some((x) => x.toLowerCase().includes(k));
    if (has("shell") && !has("privilege")) {
      return {
        recommendation: "Enumerate your current context before anything else.",
        rationale: "Every escalation path depends on who you are and what you can reach. Establish identity, privileges, and OS first.",
        command: "id; sudo -l    # Linux    |    whoami /priv    # Windows",
      };
    }
    if (has("web") || has("http")) {
      return {
        recommendation: "Map the web application with content discovery.",
        rationale: "You need the app's real structure — unlinked directories, files, and endpoints — before testing any vulnerability.",
        command: "ffuf -u http://<TARGET>/FUZZ -w <wordlist> -mc all -fc 404",
      };
    }
    if (has("smb") || has("445")) {
      return {
        recommendation: "Enumerate SMB: banner, shares, and (if domain-joined) users.",
        rationale: "SMB leaks OS/domain info and often allows anonymous share access — a fast route to credentials or the AD workflow.",
        command: "nxc smb <TARGET> -u '' -p '' --shares",
      };
    }
    if (has("port") || has("scan")) {
      return {
        recommendation: "Enumerate the highest-yield open service first (usually web, then SMB).",
        rationale: "Prioritize by information yield; keep other services on your list to revisit.",
      };
    }
    return {
      recommendation: "Start with a sensible scan, then read it carefully.",
      rationale: "The open ports are your entire attack surface. Scan once, read every line, and pick one service to enumerate.",
      command: "nmap -sC -sV -oA nmap/initial <TARGET>",
    };
  },
};
