import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Compass,
  GraduationCap,
  BookMarked,
  Workflow,
  Rocket,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldHalf,
} from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, Card, SectionHeading, EmptyState, ProgressBar, Stat, ConfirmDialog, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { AssessmentCard } from "@/components/assessment/AssessmentCard";
import { useAssessments } from "@/store/assessments";
import { useProgress } from "@/store/progress";
import { useUI } from "@/store/ui";
import { computeSkills, overallLessonProgress } from "@/lib/skills";
import { timeAgo } from "@/lib/utils";

export function Dashboard() {
  const navigate = useNavigate();
  const assessments = useAssessments((s) => s.assessments);
  const deleteAssessment = useAssessments((s) => s.deleteAssessment);
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const pendingAssessment = assessments.find((a) => a.id === pendingDelete);
  const completedLessons = useProgress((s) => s.completedLessons);
  const completedLabs = useProgress((s) => s.completedLabs);
  const lastVisited = useProgress((s) => s.lastVisited);
  const setFoundOpen = useUI((s) => s.setFoundOpen);

  const skills = computeSkills(completedLessons).slice(0, 4);
  const overall = overallLessonProgress(completedLessons);

  const quickActions = [
    { label: "New Assessment", desc: "Start a guided engagement", icon: "Plus", to: "/new", primary: true },
    { label: "First 15 Minutes", desc: "The default starting lesson", icon: "Rocket", to: "/learn/first-15-minutes" },
    { label: "Pentest Flow", desc: "The whole lifecycle, visualized", icon: "Workflow", to: "/flow" },
    { label: "Quick Reference", desc: "Command cheat sheets", icon: "BookMarked", to: "/reference" },
  ];

  return (
    <Page width="wide">
      {/* Hero / welcome */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface to-base p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[12px] font-medium text-primary">
              <ShieldHalf className="h-3.5 w-3.5" />
              Personal pentesting teacher
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-fg">
              Welcome back. Ready to work a target?
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              You bring the target; the teacher walks you through recon, scanning, enumeration,
              exploitation, privilege escalation, and reporting — always answering{" "}
              <span className="text-fg">“what do I do next, and why?”</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate("/new")}>
                New Assessment
              </Button>
              <Button variant="outline" leftIcon={<Compass className="h-4 w-4" />} onClick={() => setFoundOpen(true)}>
                I found something
              </Button>
              <Button variant="ghost" leftIcon={<GraduationCap className="h-4 w-4" />} onClick={() => navigate("/learn")}>
                Learn
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Assessments" value={assessments.length} icon={<Workflow className="h-3.5 w-3.5" />} tone="primary" />
            <Stat label="Lessons done" value={completedLessons.length} icon={<GraduationCap className="h-3.5 w-3.5" />} tone="info" />
            <Stat label="Labs done" value={completedLabs.length} icon={<TrendingUp className="h-3.5 w-3.5" />} tone="success" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Assessments */}
        <div className="lg:col-span-2">
          <SectionHeading
            title="Your assessments"
            description="Pick up where you left off, or start a new target."
            icon={<Workflow className="h-5 w-5" />}
            action={
              <Link to="/new">
                <Button size="sm" variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                  New
                </Button>
              </Link>
            }
          />
          {assessments.length === 0 ? (
            <EmptyState
              icon={<Workflow className="h-6 w-6" />}
              title="No assessments yet"
              description="Create your first authorized-lab assessment and the teacher will guide you from the very first command."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate("/new")}>
                  Start an assessment
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {assessments.map((a) => (
                <AssessmentCard key={a.id} assessment={a} onDelete={setPendingDelete} />
              ))}
            </div>
          )}

          {/* Quick actions */}
          <SectionHeading title="Quick actions" icon={<Rocket className="h-5 w-5" />} className="mt-8" />
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((qa) => (
              <Link
                key={qa.label}
                to={qa.to}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-raised text-primary">
                  <Icon name={qa.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-fg">{qa.label}</div>
                  <div className="text-[12.5px] text-muted">{qa.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column: skills + recent */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-fg">
                <TrendingUp className="h-4 w-4 text-primary" /> Skill progress
              </h3>
              <Link to="/progress" className="text-[12.5px] text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="text-muted">Overall</span>
                <span className="font-mono text-fg">{overall}%</span>
              </div>
              <ProgressBar value={overall} tone="primary" />
            </div>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.skill}>
                  <div className="mb-1 flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Icon name={s.icon} className="h-3.5 w-3.5" />
                      {s.skill}
                    </span>
                    <span className="font-mono text-subtle">
                      {s.done}/{s.total}
                    </span>
                  </div>
                  <ProgressBar value={s.percent} tone="info" size="sm" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-fg">
              <Clock className="h-4 w-4 text-primary" /> Recently visited
            </h3>
            {lastVisited.length === 0 ? (
              <p className="text-[13px] text-muted">
                Nothing yet. Open a lesson or service module and it'll show up here.
              </p>
            ) : (
              <ul className="space-y-1">
                {lastVisited.slice(0, 6).map((v) => (
                  <li key={v.id}>
                    <Link
                      to={v.route}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-raised hover:text-fg"
                    >
                      <span className="truncate">{v.title}</span>
                      <span className="shrink-0 text-[11px] text-subtle">{timeAgo(v.at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onCancel={() => setPendingDelete(null)}
        title="Delete this assessment?"
        message={
          pendingAssessment ? (
            <>
              <span className="font-medium text-fg">{pendingAssessment.name}</span> and all of its notes,
              findings, evidence, and history will be permanently removed. This can't be undone.
            </>
          ) : undefined
        }
        confirmLabel="Delete assessment"
        onConfirm={() => {
          if (pendingDelete) {
            deleteAssessment(pendingDelete);
            toast("Assessment deleted", "success");
          }
          setPendingDelete(null);
        }}
      />
    </Page>
  );
}
