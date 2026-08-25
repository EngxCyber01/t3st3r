import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  NotebookPen,
  Bug,
  Camera,
  Milestone,
  FileText,
  ListTree,
  Database,
  ArrowLeft,
  Target,
} from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Tabs, type TabItem, ProgressBar, Badge, Button, EmptyState } from "@/components/ui";
import { Dialog, DialogHeader } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { WorkflowSidebar } from "@/components/assessment/WorkflowSidebar";
import { KnowledgePanel } from "@/components/assessment/KnowledgePanel";
import { TeacherTab } from "@/components/assessment/TeacherTab";
import { NotesTab } from "@/components/assessment/NotesTab";
import { FindingsTab } from "@/components/assessment/FindingsTab";
import { EvidenceTab } from "@/components/assessment/EvidenceTab";
import { TimelineTab } from "@/components/assessment/TimelineTab";
import { ReportTab } from "@/components/assessment/ReportTab";
import { useAssessments, assessmentProgress } from "@/store/assessments";
import { getPhase } from "@/content/phases";
import type { PhaseId } from "@/types";

const TABS: TabItem[] = [
  { id: "teacher", label: "Teacher", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <NotebookPen className="h-4 w-4" /> },
  { id: "findings", label: "Findings", icon: <Bug className="h-4 w-4" /> },
  { id: "evidence", label: "Evidence", icon: <Camera className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline", icon: <Milestone className="h-4 w-4" /> },
  { id: "report", label: "Report", icon: <FileText className="h-4 w-4" /> },
];

export function AssessmentWorkspace() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const assessment = useAssessments((s) => s.assessments.find((a) => a.id === id));
  const setActive = useAssessments((s) => s.setActive);
  const setPhase = useAssessments((s) => s.setPhase);

  const [tab, setTab] = useState(params.get("tab") ?? "teacher");
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);

  // Mark active + honor ?phase= deep links
  useEffect(() => {
    if (id) setActive(id);
  }, [id, setActive]);

  useEffect(() => {
    const p = params.get("phase") as PhaseId | null;
    if (p && assessment && assessment.currentPhase !== p) {
      setPhase(assessment.id, p);
    }
    const t = params.get("tab");
    if (t && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!assessment) {
    return (
      <Page>
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="Assessment not found"
          description="It may have been deleted. Head back to the dashboard to pick another or start fresh."
          action={
            <Link to="/">
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          }
        />
      </Page>
    );
  }

  const phase = getPhase(assessment.currentPhase);
  const progress = assessmentProgress(assessment);
  const withCounts: TabItem[] = TABS.map((t) =>
    t.id === "notes"
      ? { ...t, count: assessment.notes.length }
      : t.id === "findings"
        ? { ...t, count: assessment.findings.length }
        : t.id === "evidence"
          ? { ...t, count: assessment.evidence.length }
          : t
  );

  function selectPhase(p: PhaseId) {
    setPhase(assessment!.id, p);
    setShowWorkflow(false);
  }

  function changeTab(t: string) {
    setTab(t);
    const next = new URLSearchParams(params);
    next.set("tab", t);
    next.delete("phase");
    setParams(next, { replace: true });
  }

  return (
    <Page width="full" className="!py-0">
      {/* Sticky header strip */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-base/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate("/")} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold text-fg">{assessment.name}</h1>
              {assessment.isDemo && <Badge tone="info">demo</Badge>}
            </div>
            <div className="flex items-center gap-2 font-mono text-[12px] text-muted">
              <Target className="h-3 w-3" />
              {assessment.asset.ip || assessment.asset.hostname || assessment.asset.domain}
            </div>
          </div>
          <Badge tone="teacher" icon={<Icon name={phase.icon} className="h-3 w-3" />} className="ml-1">
            {phase.label}
          </Badge>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden w-40 sm:block">
              <ProgressBar value={progress} showLabel size="sm" />
            </div>
            <Button size="sm" variant="secondary" className="lg:hidden" leftIcon={<ListTree className="h-3.5 w-3.5" />} onClick={() => setShowWorkflow(true)}>
              Phases
            </Button>
            <Button size="sm" variant="secondary" className="xl:hidden" leftIcon={<Database className="h-3.5 w-3.5" />} onClick={() => setShowKnowledge(true)}>
              Knowledge
            </Button>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex gap-6 py-6">
        {/* Left: workflow */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-32">
            <WorkflowSidebar assessment={assessment} onSelect={selectPhase} />
          </div>
        </aside>

        {/* Center: tabs */}
        <main className="min-w-0 flex-1">
          <Tabs items={withCounts} active={tab} onChange={changeTab} className="mb-5" layoutId="ws-tab" />
          {tab === "teacher" && <TeacherTab assessment={assessment} />}
          {tab === "notes" && <NotesTab assessment={assessment} />}
          {tab === "findings" && <FindingsTab assessment={assessment} />}
          {tab === "evidence" && <EvidenceTab assessment={assessment} />}
          {tab === "timeline" && <TimelineTab assessment={assessment} />}
          {tab === "report" && <ReportTab assessment={assessment} />}
        </main>

        {/* Right: knowledge */}
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-32">
            <KnowledgePanel assessment={assessment} />
          </div>
        </aside>
      </div>

      {/* Mobile drawers */}
      <Dialog open={showWorkflow} onClose={() => setShowWorkflow(false)} size="sm">
        <DialogHeader title="Pentest lifecycle" icon={<ListTree className="h-4 w-4" />} onClose={() => setShowWorkflow(false)} />
        <div className="p-4">
          <WorkflowSidebar assessment={assessment} onSelect={selectPhase} />
        </div>
      </Dialog>
      <Dialog open={showKnowledge} onClose={() => setShowKnowledge(false)} size="sm">
        <DialogHeader title="Assessment knowledge" icon={<Database className="h-4 w-4" />} onClose={() => setShowKnowledge(false)} />
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <KnowledgePanel assessment={assessment} />
        </div>
      </Dialog>
    </Page>
  );
}
