import { useState } from "react";
import { Camera, Plus, Trash2, FileText } from "lucide-react";
import type { Assessment } from "@/types";
import { Button, Input, Textarea, Field, EmptyState, Badge, useToast } from "@/components/ui";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useAssessments } from "@/store/assessments";
import { formatTime } from "@/lib/utils";

export function EvidenceTab({ assessment }: { assessment: Assessment }) {
  const addEvidence = useAssessments((s) => s.addEvidence);
  const deleteEvidence = useAssessments((s) => s.deleteEvidence);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<"output" | "request" | "note" | "screenshot-ref">("output");

  function add() {
    if (!content.trim()) return;
    addEvidence(assessment.id, { title: title.trim() || "Evidence", kind, content: content.trim() });
    setTitle("");
    setContent("");
    toast("Evidence saved", "success");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface/60 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-semibold text-fg">Capture evidence</h3>
        </div>
        <p className="mb-3 text-[12.5px] text-muted">
          Save command output, requests/responses, or references to screenshots. Capture in the moment —
          reconstructing later is error-prone.
        </p>
        <div className="space-y-2.5">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. nmap initial scan output" />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {(["output", "request", "note", "screenshot-ref"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-md px-2.5 py-1 text-[12px] transition-colors ${
                  kind === k ? "bg-primary/12 text-primary" : "text-subtle hover:bg-raised"
                }`}
              >
                {k === "screenshot-ref" ? "screenshot ref" : k}
              </button>
            ))}
          </div>
          <Field label={kind === "screenshot-ref" ? "Reference / path / URL" : "Content"}>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder={kind === "screenshot-ref" ? "path/to/screenshot.png or a URL" : "Paste the raw output / request…"}
              className="font-mono text-[12.5px]"
            />
          </Field>
          <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={add} disabled={!content.trim()}>
            Save evidence
          </Button>
        </div>
      </div>

      {assessment.evidence.length === 0 ? (
        <EmptyState icon={<Camera className="h-6 w-6" />} title="No evidence yet" description="Save outputs and references here so your report writes itself." />
      ) : (
        <div className="space-y-3">
          {assessment.evidence.map((e) => (
            <div key={e.id} className="group rounded-xl border border-line bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-info" />
                <span className="text-[13.5px] font-medium text-fg">{e.title}</span>
                <Badge tone="neutral">{e.kind}</Badge>
                <span className="text-[11px] text-subtle">{formatTime(e.createdAt)}</span>
                <button
                  onClick={() => { deleteEvidence(assessment.id, e.id); toast("Evidence deleted", "success"); }}
                  className="ml-auto rounded p-1 text-subtle opacity-0 transition-opacity hover:text-critical group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <CodeBlock code={e.content} language={e.kind} copyable dense />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
