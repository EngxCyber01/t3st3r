import { Link } from "react-router-dom";
import { TrendingUp, GraduationCap, FlaskConical, Workflow, RotateCcw } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Stat, ProgressBar, Button, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { useProgress } from "@/store/progress";
import { useAssessments } from "@/store/assessments";
import { computeSkills, overallLessonProgress } from "@/lib/skills";
import { LESSONS } from "@/content/lessons";
import { LABS } from "@/content/labs";

export function Progress() {
  const completedLessons = useProgress((s) => s.completedLessons);
  const completedLabs = useProgress((s) => s.completedLabs);
  const reset = useProgress((s) => s.reset);
  const assessments = useAssessments((s) => s.assessments);
  const { toast } = useToast();

  const skills = computeSkills(completedLessons);
  const overall = overallLessonProgress(completedLessons);

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Progress"
        title="Your progress"
        description="Track lessons, labs, and skill growth. Clicking a skill opens its lessons."
        icon={<TrendingUp className="h-5 w-5" />}
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={() => {
              reset();
              toast("Learning progress reset", "success");
            }}
          >
            Reset
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Overall" value={`${overall}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="primary" />
        <Stat label="Lessons" value={`${completedLessons.length}/${LESSONS.length}`} icon={<GraduationCap className="h-3.5 w-3.5" />} tone="info" />
        <Stat label="Labs" value={`${completedLabs.length}/${LABS.length}`} icon={<FlaskConical className="h-3.5 w-3.5" />} tone="success" />
        <Stat label="Assessments" value={assessments.length} icon={<Workflow className="h-3.5 w-3.5" />} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-[15px] font-semibold text-fg">Skill matrix</h2>
        <div className="space-y-4">
          {skills.map((s) => (
            <Link key={s.skill} to={`/learn`} className="block">
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-fg">
                  <Icon name={s.icon} className="h-4 w-4 text-primary" />
                  {s.skill}
                </span>
                <span className="font-mono text-subtle">
                  {s.done}/{s.total} · {s.percent}%
                </span>
              </div>
              <ProgressBar value={s.percent} tone={s.percent >= 66 ? "success" : s.percent >= 33 ? "primary" : "info"} />
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
