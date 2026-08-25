import { Link } from "react-router-dom";
import { FlaskConical, CheckCircle2, ArrowRight, Target } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { DifficultyBadge, Badge } from "@/components/ui";
import { LABS } from "@/content/labs";
import { useProgress } from "@/store/progress";

export function Labs() {
  const completedLabs = useProgress((s) => s.completedLabs);

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Practice"
        title="Mini labs"
        description="Reasoning-first scenarios — no live targets. Each one trains the decision you'll actually face: what do I investigate, and why?"
        icon={<FlaskConical className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {LABS.map((lab) => {
          const done = completedLabs.includes(lab.id);
          return (
            <Link
              key={lab.id}
              to={`/labs/${lab.id}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="mb-2 flex items-center gap-2">
                <DifficultyBadge level={lab.difficulty} />
                <Badge tone="neutral" className="capitalize">
                  {lab.category}
                </Badge>
                {done && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
              </div>
              <h3 className="text-[15px] font-semibold text-fg">{lab.title}</h3>
              <p className="mt-1 flex items-start gap-1.5 text-[12.5px] text-muted">
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {lab.objective}
              </p>
              <p className="mt-2 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-subtle">{lab.situation}</p>
              <div className="mt-3 flex items-center text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Start lab <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
