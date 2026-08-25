import { GraduationCap, ArrowRight, CheckCircle2, Compass, Server, Play, Eye, TerminalSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Assessment, Command } from "@/types";
import { getPhase, nextPhase } from "@/content/phases";
import { PHASE_GUIDE } from "@/content/phaseGuide";
import { PLAYBOOK } from "@/content/playbook";
import { getCategory } from "@/content/categorize";
import { serviceModuleForPort } from "@/content/services";
import { Button, Callout, useToast } from "@/components/ui";
import { CurrentStatus } from "./CurrentStatus";
import { ResultInput } from "./ResultInput";
import { CommandCard } from "@/components/teacher/CommandCard";
import { GotoLink } from "@/components/teacher/GotoLink";
import { useAssessments } from "@/store/assessments";
import { useUserCommands, type UserCommand } from "@/store/userCommands";
import { useActiveVars } from "@/hooks/useActiveVars";
import { useUI } from "@/store/ui";

function ucToCommand(uc: UserCommand): Command {
  return { id: uc.id, command: uc.command, platform: "any", purpose: uc.note || "Your command", risk: uc.risk };
}

export function TeacherTab({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const phase = getPhase(assessment.currentPhase);
  const guide = PHASE_GUIDE[assessment.currentPhase];
  const nxt = nextPhase(assessment.currentPhase);
  const completePhase = useAssessments((s) => s.completePhase);
  const setPhase = useAssessments((s) => s.setPhase);
  const addTimeline = useAssessments((s) => s.addTimeline);
  const setFoundOpen = useUI((s) => s.setFoundOpen);
  const { toast } = useToast();
  const { vars } = useActiveVars();
  const playbook = PLAYBOOK[assessment.currentPhase];
  const userCommands = useUserCommands((s) => s.commands);
  const removeUserCommand = useUserCommands((s) => s.remove);
  const myPhaseCommands = userCommands.filter(
    (uc) => getCategory(uc.category).phase === assessment.currentPhase
  );

  const openServiceMods = assessment.services
    .filter((s) => s.status === "open")
    .map((s) => ({ port: s.port, mod: serviceModuleForPort(s.port) }))
    .filter((x) => x.mod);

  function advance() {
    completePhase(assessment.id, assessment.currentPhase);
    if (nxt) {
      setPhase(assessment.id, nxt.id);
      addTimeline(assessment.id, "phase", `Advanced to ${nxt.label}`);
      toast(`Phase complete → ${nxt.label}`, "success");
    } else {
      toast("Final phase marked complete", "success");
    }
  }

  return (
    <div className="space-y-5">
      <CurrentStatus assessment={assessment} />

      {/* Teacher card for the phase */}
      <div className="rounded-2xl border border-teacher/25 bg-teacher/5 p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-teacher">
          <GraduationCap className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Teacher — {phase.label}</span>
        </div>
        <p className="text-[14.5px] leading-relaxed text-fg/90">{phase.teacher}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={advance}>
            {nxt ? `Done — go to ${nxt.short}` : "Mark phase complete"}
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Compass className="h-4 w-4" />} onClick={() => setFoundOpen(true)}>
            I found something
          </Button>
        </div>
      </div>

      {/* Phase playbook — the actual commands to run now */}
      {playbook && (
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5">
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Play className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Start here</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-fg/90">{playbook.startHere}</p>
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Commands for this phase
            </h3>
            <div className="space-y-3">
              {playbook.commands.map((c) => (
                <CommandCard key={c.id} command={c} vars={vars} assessmentId={assessment.id} />
              ))}
            </div>
          </div>

          {myPhaseCommands.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <TerminalSquare className="h-3.5 w-3.5" /> Your commands
              </h3>
              <div className="space-y-3">
                {myPhaseCommands.map((uc) => (
                  <CommandCard
                    key={uc.id}
                    command={ucToCommand(uc)}
                    vars={vars}
                    assessmentId={assessment.id}
                    onDelete={() => removeUserCommand(uc.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface/50 p-3.5">
            <div className="mb-2 flex items-center gap-2 text-info">
              <Eye className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">What's important to find</span>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-[13px] text-fg/85 marker:text-info">
              {playbook.lookFor.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* What should I read (deep-dive lessons) */}
      {guide?.recommend?.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
            What should I do in this phase?
          </h3>
          <div className="space-y-2">
            {guide.recommend.map((r, i) => (
              <GotoLink
                key={i}
                goto={r.goto}
                label={r.label}
                detail={r.detail}
                assessmentId={assessment.id}
                tone={i === 0 ? "primary" : "default"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Discovered services → jump to modules */}
      {openServiceMods.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
            <Server className="h-3.5 w-3.5" /> Enumerate your discovered services
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {openServiceMods.map(({ port, mod }) => (
              <button
                key={port}
                onClick={() => navigate(`/services/${mod!.id}`)}
                className="group flex items-center gap-3 rounded-xl border border-line bg-surface/50 p-3 text-left transition-all hover:border-primary/40 hover:bg-raised"
              >
                <span className="rounded-md bg-primary/12 px-2 py-1 font-mono text-[12px] text-primary">:{port}</span>
                <span className="flex-1 text-[13px] font-medium text-fg">{mod!.name}</span>
                <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paste result */}
      <ResultInput assessmentId={assessment.id} />

      {assessment.currentPhase === "authorization" && !assessment.scope.authorized && (
        <Callout tone="warning" title="Scope not yet confirmed">
          You haven't confirmed authorization for this assessment. Only proceed against systems you're
          permitted to test.
        </Callout>
      )}
    </div>
  );
}
