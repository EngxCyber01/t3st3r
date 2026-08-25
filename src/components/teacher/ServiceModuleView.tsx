import { Link } from "react-router-dom";
import { Target, Eye, Server, TriangleAlert, ArrowRight } from "lucide-react";
import type { ServiceModule } from "@/types";
import { Badge, RiskBadge, Callout } from "@/components/ui";
import { CommandCard } from "./CommandCard";
import { BranchList } from "./GotoLink";
import { getLesson } from "@/content/lessons";

export function ServiceModuleView({
  module,
  assessmentId,
  vars,
}: {
  module: ServiceModule;
  assessmentId?: string;
  vars?: Record<string, string | undefined>;
}) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary" icon={<Server className="h-3 w-3" />}>
            {module.category}
          </Badge>
          {module.ports.map((p) => (
            <Badge key={p} tone="neutral" className="font-mono">
              :{p}
            </Badge>
          ))}
          {module.risk && <RiskBadge risk={module.risk} />}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{module.name}</h1>
        <p className="mt-1.5 text-[15px] text-muted">{module.tagline}</p>
      </header>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface/50 p-4">
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              What it is
            </h3>
            <p className="text-[13.5px] leading-relaxed text-fg/85">{module.what}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface/50 p-4">
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Why it matters
            </h3>
            <p className="text-[13.5px] leading-relaxed text-fg/85">{module.why}</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="mb-1.5 flex items-center gap-2 text-primary">
            <Target className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Objective</span>
          </div>
          <p className="text-[13.5px] leading-relaxed text-fg/90">{module.objective}</p>
        </div>

        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
            Enumeration commands
          </h3>
          <div className="space-y-3">
            {module.commands.map((c) => (
              <CommandCard key={c.id} command={c} vars={vars} assessmentId={assessmentId} />
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-line bg-surface/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-info">
            <Eye className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">What to look for</span>
          </div>
          <ul className="ml-4 list-disc space-y-1 text-[13.5px] text-fg/85 marker:text-info">
            {module.lookFor.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>

        {module.branches.length > 0 && (
          <BranchList branches={module.branches} assessmentId={assessmentId} />
        )}

        {module.commonMistakes && module.commonMistakes.length > 0 && (
          <Callout tone="warning" title="Common mistakes" icon={<TriangleAlert className="h-4 w-4" />}>
            <ul className="ml-4 list-disc space-y-1 marker:text-elevated">
              {module.commonMistakes.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Callout>
        )}

        {module.relatedLessons && module.relatedLessons.length > 0 && (
          <section className="border-t border-line pt-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              Related lessons
            </h3>
            <div className="flex flex-wrap gap-2">
              {module.relatedLessons.map((id) => {
                const l = getLesson(id);
                if (!l) return null;
                return (
                  <Link
                    key={id}
                    to={`/learn/${id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-primary/40 hover:text-fg"
                  >
                    {l.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
