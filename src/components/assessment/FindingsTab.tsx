import { useState } from "react";
import { Bug, Plus, Trash2, Pencil } from "lucide-react";
import type { Assessment, Finding, FindingStatus, Severity } from "@/types";
import { cn } from "@/lib/cn";
import {
  Button,
  SeverityBadge,
  EmptyState,
  Dialog,
  DialogHeader,
  Input,
  Textarea,
  Field,
  useToast,
} from "@/components/ui";
import { useAssessments } from "@/store/assessments";

const SEVERITIES: Severity[] = ["info", "low", "medium", "high", "critical"];
const STATUSES: FindingStatus[] = ["discovered", "investigating", "validated", "reported", "retested", "resolved"];

/** Static (purge-safe) active styles per status. */
const statusActive: Record<FindingStatus, string> = {
  discovered: "bg-raised text-fg ring-1 ring-inset ring-line-strong",
  investigating: "bg-info/12 text-info ring-1 ring-inset ring-info/30",
  validated: "bg-caution/12 text-caution ring-1 ring-inset ring-caution/30",
  reported: "bg-teacher/12 text-teacher ring-1 ring-inset ring-teacher/30",
  retested: "bg-info/12 text-info ring-1 ring-inset ring-info/30",
  resolved: "bg-success/12 text-success ring-1 ring-inset ring-success/30",
};

export function FindingsTab({ assessment }: { assessment: Assessment }) {
  const addFinding = useAssessments((s) => s.addFinding);
  const updateFinding = useAssessments((s) => s.updateFinding);
  const deleteFinding = useAssessments((s) => s.deleteFinding);
  const { toast } = useToast();

  const [editing, setEditing] = useState<Finding | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">
          Track weaknesses from discovery to resolution. Only claim what your evidence supports.
        </p>
        <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreating(true)}>
          New finding
        </Button>
      </div>

      {assessment.findings.length === 0 ? (
        <EmptyState
          icon={<Bug className="h-6 w-6" />}
          title="No findings yet"
          description="When you validate a weakness, record it here with evidence, impact, and remediation."
          action={
            <Button variant="secondary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setCreating(true)}>
              Add a finding
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {assessment.findings.map((f) => (
            <div key={f.id} className="group rounded-xl border border-line bg-surface/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <h4 className="text-[14px] font-semibold text-fg">{f.title}</h4>
                  </div>
                  {f.description && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.description}</p>}
                  {f.asset && <p className="mt-1 font-mono text-[12px] text-subtle">Asset: {f.asset}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditing(f)} className="rounded p-1.5 text-subtle hover:bg-raised hover:text-fg">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { deleteFinding(assessment.id, f.id); toast("Finding deleted", "success"); }} className="rounded p-1.5 text-subtle hover:bg-critical/10 hover:text-critical">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateFinding(assessment.id, f.id, { status: st })}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium capitalize transition-all",
                      f.status === st ? statusActive[st] : "text-subtle hover:bg-raised"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <FindingDialog
        open={creating || !!editing}
        finding={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={(data) => {
          if (editing) {
            updateFinding(assessment.id, editing.id, data);
            toast("Finding updated", "success");
          } else {
            addFinding(assessment.id, { title: data.title || "Untitled finding", severity: data.severity || "medium", ...data });
            toast("Finding added", "success");
          }
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function FindingDialog({
  open,
  finding,
  onClose,
  onSave,
}: {
  open: boolean;
  finding: Finding | null;
  onClose: () => void;
  onSave: (data: Partial<Finding>) => void;
}) {
  const [form, setForm] = useState<Partial<Finding>>({});
  // reset form whenever dialog target changes
  const key = finding?.id ?? "new";
  const [lastKey, setLastKey] = useState(key);
  if (open && lastKey !== key) {
    setLastKey(key);
    setForm(finding ?? { severity: "medium", status: "discovered" });
  }
  if (open && !finding && Object.keys(form).length === 0) {
    setForm({ severity: "medium", status: "discovered" });
  }

  const up = (patch: Partial<Finding>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader title={finding ? "Edit finding" : "New finding"} icon={<Bug className="h-4 w-4" />} onClose={onClose} />
      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
        <Field label="Title" required>
          <Input value={form.title ?? ""} onChange={(e) => up({ title: e.target.value })} placeholder="e.g. IDOR in invoice API" autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Severity">
            <div className="flex flex-wrap gap-1.5">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => up({ severity: s })}
                  className={cn("rounded-lg border px-2.5 py-1.5 text-[12px] capitalize", form.severity === s ? "border-primary/50 bg-primary/10 text-fg" : "border-line text-muted hover:border-line-strong")}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Affected asset">
            <Input value={form.asset ?? ""} onChange={(e) => up({ asset: e.target.value })} placeholder="10.10.10.10 / URL" className="font-mono" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={form.description ?? ""} onChange={(e) => up({ description: e.target.value })} rows={3} placeholder="What is the issue?" />
        </Field>
        <Field label="Reproduction steps">
          <Textarea value={form.reproduction ?? ""} onChange={(e) => up({ reproduction: e.target.value })} rows={3} placeholder="How to reproduce it (request/response, commands)…" className="font-mono text-[12.5px]" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Impact (business terms)">
            <Textarea value={form.impact ?? ""} onChange={(e) => up({ impact: e.target.value })} rows={2} placeholder="What can an attacker achieve?" />
          </Field>
          <Field label="Remediation">
            <Textarea value={form.remediation ?? ""} onChange={(e) => up({ remediation: e.target.value })} rows={2} placeholder="Concrete, actionable fix" />
          </Field>
        </div>
        <Field label="Evidence">
          <Textarea value={form.evidence ?? ""} onChange={(e) => up({ evidence: e.target.value })} rows={3} placeholder="Paste supporting output / request / response…" className="font-mono text-[12.5px]" />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t border-line p-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(form)} disabled={!form.title?.trim()}>
          {finding ? "Save changes" : "Add finding"}
        </Button>
      </div>
    </Dialog>
  );
}
