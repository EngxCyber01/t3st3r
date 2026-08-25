import { Link } from "react-router-dom";
import {
  Target,
  Brain,
  Eye,
  TriangleAlert,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import type { Lesson } from "@/types";
import { Callout } from "@/components/ui/Callout";
import { DifficultyBadge, Badge, Button } from "@/components/ui";
import { CommandCard } from "./CommandCard";
import { ExerciseCard } from "./ExerciseCard";
import { BranchList } from "./GotoLink";
import { useProgress } from "@/store/progress";
import { getLesson } from "@/content/lessons";

const noteTone = {
  default: "info",
  info: "info",
  warning: "warning",
  success: "success",
  teacher: "teacher",
  tip: "tip",
} as const;

export function LessonView({
  lesson,
  assessmentId,
  vars,
}: {
  lesson: Lesson;
  assessmentId?: string;
  vars?: Record<string, string | undefined>;
}) {
  const done = useProgress((s) => s.completedLessons.includes(lesson.id));
  const toggle = useProgress((s) => s.toggleLesson);

  return (
    <article className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">{lesson.categoryLabel ?? lesson.category}</Badge>
          <DifficultyBadge level={lesson.difficulty} />
          {lesson.estMinutes && (
            <Badge tone="neutral" icon={<Clock className="h-3 w-3" />}>
              {lesson.estMinutes} min
            </Badge>
          )}
          {lesson.methodology?.map((m) => (
            <Badge key={m} tone="neutral">
              {m}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{lesson.title}</h1>
        <p className="mt-1.5 text-[15px] text-muted">{lesson.summary}</p>
        <div className="mt-4">
          <Button
            variant={done ? "subtle" : "secondary"}
            size="sm"
            leftIcon={done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            onClick={() => toggle(lesson.id)}
          >
            {done ? "Completed" : "Mark as complete"}
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Teacher intro */}
        <Callout tone="teacher" title="Teacher">
          {lesson.teacherIntro}
        </Callout>

        {/* Objective + Why */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Objective</span>
            </div>
            <ul className="space-y-1.5">
              {lesson.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] text-fg/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
          {lesson.why && (
            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-teacher">
                <Brain className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Why it matters</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-fg/85">{lesson.why}</p>
            </div>
          )}
        </div>

        {/* Notes / concept blocks */}
        {lesson.notes?.map((n, i) => (
          <div key={i}>
            {n.tone && n.tone !== "default" ? (
              <Callout tone={noteTone[n.tone]} title={n.heading}>
                {n.body}
              </Callout>
            ) : (
              <div className="rounded-xl border border-line bg-surface/40 p-4">
                {n.heading && <h3 className="mb-1.5 text-[14px] font-semibold text-fg">{n.heading}</h3>}
                <p className="text-[13.5px] leading-relaxed text-fg/85">{n.body}</p>
              </div>
            )}
          </div>
        ))}

        {/* Commands */}
        {lesson.commands && lesson.commands.length > 0 && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">Commands</h3>
            <div className="space-y-3">
              {lesson.commands.map((c) => (
                <CommandCard key={c.id} command={c} vars={vars} assessmentId={assessmentId} />
              ))}
            </div>
          </section>
        )}

        {/* Look for */}
        {lesson.lookFor && lesson.lookFor.length > 0 && (
          <div className="rounded-xl border border-line bg-surface/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-info">
              <Eye className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">What to look for</span>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-[13.5px] text-fg/85 marker:text-info">
              {lesson.lookFor.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Branches */}
        {lesson.branches && lesson.branches.length > 0 && (
          <section>
            <BranchList branches={lesson.branches} assessmentId={assessmentId} />
          </section>
        )}

        {/* Common mistakes */}
        {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
          <Callout tone="warning" title="Common mistakes" icon={<TriangleAlert className="h-4 w-4" />}>
            <ul className="ml-4 list-disc space-y-1 marker:text-elevated">
              {lesson.commonMistakes.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Callout>
        )}

        {/* Exercise */}
        {lesson.exercise && <ExerciseCard exercise={lesson.exercise} />}

        {/* Next / related */}
        {(lesson.next?.length || lesson.related?.length) && (
          <section className="border-t border-line pt-5">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              <ArrowRight className="h-3.5 w-3.5" /> Continue
            </h3>
            <div className="flex flex-wrap gap-2">
              {[...(lesson.next ?? []), ...(lesson.related ?? [])].map((id) => {
                const l = getLesson(id);
                const label = l?.title ?? (id.startsWith("svc-") ? `${id.slice(4).toUpperCase()} module` : id);
                const to = l ? `/learn/${id}` : id.startsWith("svc-") ? `/services/${id.slice(4)}` : `/learn/${id}`;
                return (
                  <Link
                    key={id}
                    to={to}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-primary/40 hover:text-fg"
                  >
                    {label}
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
