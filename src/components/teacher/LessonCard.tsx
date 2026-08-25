import { Link } from "react-router-dom";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import type { Lesson } from "@/types";
import { DifficultyBadge } from "@/components/ui";
import { useProgress } from "@/store/progress";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const done = useProgress((s) => s.completedLessons.includes(lesson.id));
  return (
    <Link
      to={`/learn/${lesson.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface"
    >
      <div className="mb-2 flex items-center gap-2">
        <DifficultyBadge level={lesson.difficulty} />
        {lesson.estMinutes && (
          <span className="flex items-center gap-1 text-[11.5px] text-subtle">
            <Clock className="h-3 w-3" />
            {lesson.estMinutes}m
          </span>
        )}
        {done && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
      </div>
      <h3 className="text-[14px] font-semibold leading-tight text-fg">{lesson.title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-muted">{lesson.summary}</p>
      <div className="mt-3 flex items-center text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open lesson <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
