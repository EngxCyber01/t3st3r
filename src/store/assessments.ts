import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import { PHASES } from "@/content/phases";
import type {
  Assessment,
  CommandExecution,
  Credential,
  DiscoveredService,
  EvidenceItem,
  Finding,
  Note,
  NoteType,
  PhaseId,
  PhaseState,
  Severity,
  TimelineEvent,
  TimelineKind,
} from "@/types";

function freshPhases(active: PhaseId): PhaseState[] {
  return PHASES.map((p) => ({
    id: p.id,
    status: p.id === active ? "active" : "pending",
  }));
}

export interface NewAssessmentInput {
  name: string;
  environment: Assessment["environment"];
  startingPoint: Assessment["startingPoint"];
  scope: Assessment["scope"];
  asset: Assessment["asset"];
  isDemo?: boolean;
}

interface AssessmentsState {
  assessments: Assessment[];
  activeId: string | null;

  createAssessment: (input: NewAssessmentInput) => string;
  deleteAssessment: (id: string) => void;
  setActive: (id: string | null) => void;
  getById: (id: string) => Assessment | undefined;
  updateAssessment: (id: string, patch: Partial<Assessment>) => void;

  setPhase: (id: string, phase: PhaseId) => void;
  completePhase: (id: string, phase: PhaseId) => void;
  setObjective: (id: string, objective?: string, nextAction?: string) => void;

  addService: (id: string, svc: Omit<DiscoveredService, "id" | "createdAt">) => void;
  removeService: (id: string, serviceId: string) => void;

  addNote: (id: string, note: { type: NoteType; content: string; tags?: string[] }) => void;
  updateNote: (id: string, noteId: string, patch: Partial<Note>) => void;
  deleteNote: (id: string, noteId: string) => void;
  toggleNotePin: (id: string, noteId: string) => void;

  addFinding: (id: string, finding: Partial<Finding> & { title: string; severity: Severity }) => string;
  updateFinding: (id: string, findingId: string, patch: Partial<Finding>) => void;
  deleteFinding: (id: string, findingId: string) => void;

  addCommand: (id: string, cmd: Omit<CommandExecution, "id" | "timestamp">) => void;
  addEvidence: (id: string, ev: Omit<EvidenceItem, "id" | "createdAt">) => void;
  deleteEvidence: (id: string, evId: string) => void;
  addCredential: (id: string, cred: Omit<Credential, "id" | "createdAt">) => void;

  addTimeline: (id: string, kind: TimelineKind, label: string, detail?: string) => void;

  setAssetOS: (id: string, os: "linux" | "windows" | "unknown") => void;
}

function touch(a: Assessment): Assessment {
  return { ...a, updatedAt: new Date().toISOString() };
}

/** Mutate one assessment in the array immutably. */
function mapOne(
  list: Assessment[],
  id: string,
  fn: (a: Assessment) => Assessment
): Assessment[] {
  return list.map((a) => (a.id === id ? touch(fn(a)) : a));
}

export const useAssessments = create<AssessmentsState>()(
  persist(
    (set, get) => ({
      assessments: [],
      activeId: null,

      createAssessment: (input) => {
        const now = new Date().toISOString();
        const active: PhaseId =
          input.startingPoint === "have_shell"
            ? "post_exploitation"
            : input.startingPoint === "have_creds"
              ? "enumeration"
              : input.startingPoint === "known_web" || input.startingPoint === "known_ports"
                ? "enumeration"
                : "authorization";
        const a: Assessment = {
          id: uid("as"),
          name: input.name,
          environment: input.environment,
          startingPoint: input.startingPoint,
          scope: input.scope,
          asset: input.asset,
          currentPhase: active,
          phases: freshPhases(active),
          services: [],
          notes: [],
          findings: [],
          history: [],
          timeline: [
            {
              id: uid("tl"),
              kind: "milestone",
              label: "Assessment created",
              detail: input.name,
              timestamp: now,
            },
          ],
          evidence: [],
          credentials: [],
          currentObjective: undefined,
          nextAction: undefined,
          isDemo: input.isDemo,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ assessments: [a, ...s.assessments], activeId: a.id }));
        return a.id;
      },

      deleteAssessment: (id) =>
        set((s) => ({
          assessments: s.assessments.filter((a) => a.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),

      setActive: (activeId) => set({ activeId }),

      getById: (id) => get().assessments.find((a) => a.id === id),

      updateAssessment: (id, patch) =>
        set((s) => ({ assessments: mapOne(s.assessments, id, (a) => ({ ...a, ...patch })) })),

      setPhase: (id, phase) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            currentPhase: phase,
            phases: a.phases.map((p) =>
              p.id === phase
                ? { ...p, status: "active" }
                : p.status === "active"
                  ? { ...p, status: "pending" }
                  : p
            ),
          })),
        })),

      completePhase: (id, phase) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            phases: a.phases.map((p) => (p.id === phase ? { ...p, status: "done" } : p)),
          })),
        })),

      setObjective: (id, currentObjective, nextAction) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({ ...a, currentObjective, nextAction })),
        })),

      addService: (id, svc) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            // avoid duplicate port/proto
            if (a.services.some((x) => x.port === svc.port && x.protocol === svc.protocol)) {
              return a;
            }
            const service: DiscoveredService = {
              ...svc,
              id: uid("svc"),
              createdAt: new Date().toISOString(),
            };
            return {
              ...a,
              services: [...a.services, service].sort((x, y) => x.port - y.port),
              timeline: [
                ...a.timeline,
                {
                  id: uid("tl"),
                  kind: "service",
                  label: `${svc.port}/${svc.protocol} ${svc.service} discovered`,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }),
        })),

      removeService: (id, serviceId) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            services: a.services.filter((x) => x.id !== serviceId),
          })),
        })),

      addNote: (id, note) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            const now = new Date().toISOString();
            const n: Note = {
              id: uid("note"),
              type: note.type,
              content: note.content,
              tags: note.tags ?? [],
              createdAt: now,
              updatedAt: now,
            };
            return { ...a, notes: [n, ...a.notes] };
          }),
        })),

      updateNote: (id, noteId, patch) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            notes: a.notes.map((n) =>
              n.id === noteId ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
            ),
          })),
        })),

      deleteNote: (id, noteId) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            notes: a.notes.filter((n) => n.id !== noteId),
          })),
        })),

      toggleNotePin: (id, noteId) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            notes: a.notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)),
          })),
        })),

      addFinding: (id, finding) => {
        const fid = uid("find");
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            const now = new Date().toISOString();
            const f: Finding = {
              id: fid,
              title: finding.title,
              severity: finding.severity,
              status: finding.status ?? "discovered",
              asset: finding.asset,
              description: finding.description,
              evidence: finding.evidence,
              reproduction: finding.reproduction,
              impact: finding.impact,
              remediation: finding.remediation,
              references: finding.references,
              createdAt: now,
              updatedAt: now,
            };
            return {
              ...a,
              findings: [f, ...a.findings],
              timeline: [
                ...a.timeline,
                {
                  id: uid("tl"),
                  kind: "finding",
                  label: `Finding: ${finding.title}`,
                  detail: finding.severity.toUpperCase(),
                  timestamp: now,
                },
              ],
            };
          }),
        }));
        return fid;
      },

      updateFinding: (id, findingId, patch) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            findings: a.findings.map((f) =>
              f.id === findingId ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f
            ),
          })),
        })),

      deleteFinding: (id, findingId) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            findings: a.findings.filter((f) => f.id !== findingId),
          })),
        })),

      addCommand: (id, cmd) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            const now = new Date().toISOString();
            const c: CommandExecution = { ...cmd, id: uid("cmd"), timestamp: now };
            return {
              ...a,
              history: [c, ...a.history].slice(0, 200),
              timeline: [
                ...a.timeline,
                {
                  id: uid("tl"),
                  kind: "command",
                  label: cmd.command.length > 60 ? cmd.command.slice(0, 60) + "…" : cmd.command,
                  timestamp: now,
                },
              ],
            };
          }),
        })),

      addEvidence: (id, ev) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            const item: EvidenceItem = { ...ev, id: uid("ev"), createdAt: new Date().toISOString() };
            return { ...a, evidence: [item, ...a.evidence] };
          }),
        })),

      deleteEvidence: (id, evId) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            evidence: a.evidence.filter((e) => e.id !== evId),
          })),
        })),

      addCredential: (id, cred) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => {
            const c: Credential = { ...cred, id: uid("cred"), createdAt: new Date().toISOString() };
            return {
              ...a,
              credentials: [c, ...a.credentials],
              timeline: [
                ...a.timeline,
                {
                  id: uid("tl"),
                  kind: "credential",
                  label: `Credential recorded${cred.username ? `: ${cred.username}` : ""}`,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }),
        })),

      addTimeline: (id, kind, label, detail) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            timeline: [
              ...a.timeline,
              { id: uid("tl"), kind, label, detail, timestamp: new Date().toISOString() },
            ],
          })),
        })),

      setAssetOS: (id, os) =>
        set((s) => ({
          assessments: mapOne(s.assessments, id, (a) => ({
            ...a,
            asset: { ...a.asset, os },
            timeline: [
              ...a.timeline,
              {
                id: uid("tl"),
                kind: "milestone",
                label: `OS identified: ${os}`,
                timestamp: new Date().toISOString(),
              },
            ],
          })),
        })),
    }),
    { name: "pt.assessments.v1" }
  )
);

/* ---------- Derived helpers (not part of the store) ---------- */

/** Progress 0-100 based on completed phases + activity signals. */
export function assessmentProgress(a: Assessment): number {
  const done = a.phases.filter((p) => p.status === "done").length;
  const base = (done / a.phases.length) * 100;
  // small nudge for the active phase to feel "in progress"
  const active = a.phases.some((p) => p.status === "active") ? 100 / a.phases.length / 2 : 0;
  return Math.min(100, Math.round(base + active));
}
