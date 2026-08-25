import { MapPin, Database, Target, Terminal, ArrowRight, HelpCircle } from "lucide-react";
import type { Assessment } from "@/types";
import { getPhase, nextPhase } from "@/content/phases";
import { PHASE_GUIDE } from "@/content/phaseGuide";

/**
 * The single most important UX element (spec §2, §26, §65): it always answers
 * WHERE AM I / WHAT DO I KNOW / WHAT AM I TRYING TO FIND / WHAT'S NEXT.
 */
export function CurrentStatus({ assessment }: { assessment: Assessment }) {
  const phase = getPhase(assessment.currentPhase);
  const guide = PHASE_GUIDE[assessment.currentPhase];
  const openPorts = assessment.services.filter((s) => s.status === "open");
  const creds = assessment.credentials.length;
  const nxt = nextPhase(assessment.currentPhase);

  const objective = assessment.currentObjective || phase.objective;
  const nextAction = assessment.nextAction || guide?.startHere || (nxt ? `Move toward ${nxt.label}.` : "Assemble the report.");

  const rows = [
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      q: "Where am I?",
      a: `${phase.label}`,
      sub: assessment.asset.ip || assessment.asset.hostname || assessment.asset.domain,
    },
    {
      icon: <Database className="h-3.5 w-3.5" />,
      q: "What do I know?",
      a:
        openPorts.length > 0
          ? `${openPorts.length} open port${openPorts.length === 1 ? "" : "s"}: ${openPorts.map((s) => s.port).join(", ")}`
          : "No open ports recorded yet",
      sub:
        [
          assessment.asset.os && assessment.asset.os !== "unknown" ? `OS: ${assessment.asset.os}` : null,
          creds ? `${creds} credential${creds === 1 ? "" : "s"}` : null,
          assessment.findings.length ? `${assessment.findings.length} findings` : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
    },
    {
      icon: <Target className="h-3.5 w-3.5" />,
      q: "What am I trying to find?",
      a: objective,
    },
    {
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      q: "What should I do next?",
      a: nextAction,
    },
  ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Terminal className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Current status</span>
      </div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-subtle">{r.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-subtle">
                <HelpCircle className="h-3 w-3" /> {r.q}
              </div>
              <div className="mt-0.5 text-[13.5px] font-medium leading-snug text-fg">{r.a}</div>
              {r.sub && <div className="mt-0.5 font-mono text-[11.5px] text-muted">{r.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
