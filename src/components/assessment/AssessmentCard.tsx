import { Link } from "react-router-dom";
import { Target, Bug, Server, ArrowRight, Trash2, Beaker } from "lucide-react";
import type { Assessment } from "@/types";
import { assessmentProgress } from "@/store/assessments";
import { getPhase } from "@/content/phases";
import { ProgressBar, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { timeAgo } from "@/lib/utils";

const envLabel: Record<Assessment["environment"], string> = {
  htb: "Hack The Box",
  thm: "TryHackMe",
  ctf: "CTF",
  personal: "Personal Lab",
  authorized: "Authorized Pentest",
  other: "Other",
};

export function AssessmentCard({
  assessment,
  onDelete,
}: {
  assessment: Assessment;
  onDelete?: (id: string) => void;
}) {
  const phase = getPhase(assessment.currentPhase);
  const progress = assessmentProgress(assessment);
  const openPorts = assessment.services.filter((s) => s.status === "open");

  return (
    <div className="group relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-panel">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-fg">{assessment.name}</h3>
            {assessment.isDemo && (
              <Badge tone="info" icon={<Beaker className="h-3 w-3" />}>
                demo
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[12.5px] text-muted">
            <Target className="h-3.5 w-3.5" />
            {assessment.asset.ip || assessment.asset.hostname || assessment.asset.domain || "no target"}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(assessment.id)}
            className="shrink-0 rounded-lg p-1.5 text-subtle opacity-0 transition-all hover:bg-critical/10 hover:text-critical group-hover:opacity-100"
            aria-label="Delete assessment"
            title={assessment.isDemo ? "Delete demo assessment" : "Delete assessment"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="teacher" icon={<Icon name={phase.icon} className="h-3 w-3" />}>
          {phase.label}
        </Badge>
        <Badge tone="neutral">{envLabel[assessment.environment]}</Badge>
        {assessment.asset.os && assessment.asset.os !== "unknown" && (
          <Badge tone="neutral" className="capitalize">
            {assessment.asset.os}
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <ProgressBar value={progress} showLabel />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-[12.5px]">
        <div className="flex items-center gap-1.5 text-muted">
          <Server className="h-3.5 w-3.5 text-info" />
          {openPorts.length > 0 ? (
            <span className="font-mono">{openPorts.map((s) => s.port).join(", ")}</span>
          ) : (
            <span>No ports yet</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted">
          <Bug className="h-3.5 w-3.5 text-elevated" />
          {assessment.findings.length} findings
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[11.5px] text-subtle">Updated {timeAgo(assessment.updatedAt)}</span>
        <Link to={`/a/${assessment.id}`}>
          <Button size="sm" variant="subtle" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Continue
          </Button>
        </Link>
      </div>
    </div>
  );
}
