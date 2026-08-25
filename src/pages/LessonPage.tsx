import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, EmptyState } from "@/components/ui";
import { LessonView } from "@/components/teacher/LessonView";
import { getLesson } from "@/content/lessons";
import { useActiveVars } from "@/hooks/useActiveVars";
import { useProgress } from "@/store/progress";

export function LessonPage() {
  const { id } = useParams();
  const lesson = id ? getLesson(id) : undefined;
  const { vars, assessmentId } = useActiveVars();
  const recordVisit = useProgress((s) => s.recordVisit);

  useEffect(() => {
    if (lesson) recordVisit({ id: `lesson:${lesson.id}`, title: lesson.title, route: `/learn/${lesson.id}` });
  }, [lesson, recordVisit]);

  if (!lesson) {
    return (
      <Page>
        <EmptyState
          title="Lesson not found"
          description="This lesson doesn't exist. Browse all lessons instead."
          action={
            <Link to="/learn">
              <Button variant="primary">Browse lessons</Button>
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All lessons
      </Link>
      <LessonView lesson={lesson} vars={vars} assessmentId={assessmentId} />
    </Page>
  );
}
