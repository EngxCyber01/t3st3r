import { useMemo, useState } from "react";
import { GraduationCap, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Page, PageHeader } from "@/components/layout/Page";
import { Chip, ProgressBar, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { LessonCard } from "@/components/teacher/LessonCard";
import { LESSONS, LESSON_CATEGORIES, lessonsByCategory } from "@/content/lessons";
import { useProgress } from "@/store/progress";
import { overallLessonProgress } from "@/lib/skills";
import type { Difficulty } from "@/types";

const DIFFS: Difficulty[] = ["beginner", "easy", "intermediate", "hard", "advanced"];

export function Learn() {
  const completed = useProgress((s) => s.completedLessons);
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const overall = overallLessonProgress(completed);

  const categories = useMemo(
    () =>
      LESSON_CATEGORIES.map((c) => ({
        cat: c,
        lessons: lessonsByCategory(c.id).filter((l) => diff === "all" || l.difficulty === diff),
      })).filter((x) => x.lessons.length > 0),
    [diff]
  );

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Learn"
        title="Learn to think like a pentester"
        description="Structured, practical lessons in the teacher format: what, why, run it, interpret it, decide the next step."
        icon={<GraduationCap className="h-5 w-5" />}
        actions={
          <Link to="/learn/first-15-minutes">
            <Button variant="primary" leftIcon={<Rocket className="h-4 w-4" />}>
              First 15 Minutes
            </Button>
          </Link>
        }
      />

      {/* Overall progress */}
      <div className="mb-6 rounded-2xl border border-line bg-surface/60 p-4">
        <div className="mb-2 flex items-center justify-between text-[13px]">
          <span className="text-muted">
            {completed.length} of {LESSONS.length} lessons complete
          </span>
          <span className="font-mono text-fg">{overall}%</span>
        </div>
        <ProgressBar value={overall} />
      </div>

      {/* Difficulty filter */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <Chip active={diff === "all"} onClick={() => setDiff("all")}>
          All
        </Chip>
        {DIFFS.map((d) => (
          <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>
            <span className="capitalize">{d}</span>
          </Chip>
        ))}
      </div>

      <div className="space-y-8">
        {categories.map(({ cat, lessons }) => (
          <section key={cat.id}>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-raised text-primary">
                <Icon name={cat.icon} className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-fg">{cat.label}</h2>
                <p className="text-[12.5px] text-muted">{cat.description}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
