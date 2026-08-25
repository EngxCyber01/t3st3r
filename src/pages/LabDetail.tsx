import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Target, Lightbulb, HelpCircle, GraduationCap, CheckCircle2, Circle, Eye } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, DifficultyBadge, Badge, Callout, EmptyState } from "@/components/ui";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Accordion } from "@/components/ui/Accordion";
import { LAB_MAP } from "@/content/labs";
import { getLesson } from "@/content/lessons";
import { useProgress } from "@/store/progress";

export function LabDetail() {
  const { id } = useParams();
  const lab = id ? LAB_MAP[id] : undefined;
  const done = useProgress((s) => (id ? s.completedLabs.includes(id) : false));
  const toggle = useProgress((s) => s.toggleLab);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  if (!lab) {
    return (
      <Page>
        <EmptyState
          title="Lab not found"
          action={
            <Link to="/labs">
              <Button variant="primary">All labs</Button>
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <Link to="/labs" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All labs
      </Link>

      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <div className="mb-2 flex items-center gap-2">
            <DifficultyBadge level={lab.difficulty} />
            <Badge tone="neutral" className="capitalize">
              {lab.category}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{lab.title}</h1>
        </header>

        <div className="rounded-2xl border border-line bg-surface/50 p-4">
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">The situation</h3>
          <p className="text-[14px] leading-relaxed text-fg/90">{lab.situation}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface/50 p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">What you know</h3>
            <CodeBlock code={lab.known.join("\n")} language="known" copyable={false} dense />
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Objective</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-fg/90">{lab.objective}</p>
          </div>
        </div>

        {/* Progressive hints */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-caution">
            <Lightbulb className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hints</span>
          </div>
          <div className="space-y-2">
            {lab.hints.slice(0, revealedHints).map((h, i) => (
              <Callout key={i} tone="tip">
                {h}
              </Callout>
            ))}
            {revealedHints < lab.hints.length && (
              <Button variant="secondary" size="sm" onClick={() => setRevealedHints((n) => n + 1)}>
                Reveal hint {revealedHints + 1} of {lab.hints.length}
              </Button>
            )}
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-info">
            <HelpCircle className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Think it through</span>
          </div>
          <div className="space-y-2">
            {lab.questions.map((q, i) => (
              <Accordion key={i} title={q.q}>
                {q.a}
              </Accordion>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div>
          {!showSolution ? (
            <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => setShowSolution(true)}>
              Reveal teacher walkthrough
            </Button>
          ) : (
            <div className="rounded-2xl border border-teacher/25 bg-teacher/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-teacher">
                <GraduationCap className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Teacher walkthrough</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-fg/90">{lab.solution}</p>
              <div className="mt-3 border-t border-teacher/20 pt-3">
                <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">Lessons learned</h4>
                <ul className="ml-4 list-disc space-y-1 text-[13px] text-fg/85 marker:text-teacher">
                  {lab.lessonsLearned.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Related + complete */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap gap-2">
            {lab.relatedLessons?.map((lid) => {
              const l = getLesson(lid);
              if (!l) return null;
              return (
                <Link key={lid} to={`/learn/${lid}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-primary/40 hover:text-fg">
                  {l.title}
                </Link>
              );
            })}
          </div>
          <Button
            variant={done ? "subtle" : "primary"}
            leftIcon={done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            onClick={() => toggle(lab.id)}
          >
            {done ? "Completed" : "Mark complete"}
          </Button>
        </div>
      </div>
    </Page>
  );
}
