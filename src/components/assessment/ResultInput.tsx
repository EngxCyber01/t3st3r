import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardPaste,
  Sparkles,
  Eye,
  FlaskConical,
  Plus,
  FileText,
  CircleDot,
} from "lucide-react";
import { Textarea, Button, Badge, Callout, useToast } from "@/components/ui";
import { GotoLink } from "@/components/teacher/GotoLink";
import { analyzeOutput } from "@/engine/parsers";
import type { ParseResult } from "@/types";
import { useAssessments } from "@/store/assessments";

export function ResultInput({ assessmentId }: { assessmentId: string }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const addService = useAssessments((s) => s.addService);
  const addNote = useAssessments((s) => s.addNote);
  const addEvidence = useAssessments((s) => s.addEvidence);
  const { toast } = useToast();

  const foundServices = result?.observations.flatMap((o) => (o.service ? [o.service] : [])) ?? [];

  function analyze() {
    if (!text.trim()) return;
    setResult(analyzeOutput(text));
  }

  function recordServices() {
    foundServices.forEach((svc) =>
      addService(assessmentId, {
        port: svc.port,
        protocol: svc.protocol,
        service: svc.service,
        version: svc.version,
        status: svc.status,
      })
    );
    toast(`Recorded ${foundServices.length} service${foundServices.length === 1 ? "" : "s"}`, "success");
  }

  function saveOutput() {
    addEvidence(assessmentId, {
      title: `Output (${result?.parser ?? "raw"}) — ${new Date().toLocaleTimeString()}`,
      kind: "output",
      content: text,
    });
    toast("Saved raw output as evidence", "success");
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardPaste className="h-4 w-4 text-primary" />
        <h3 className="text-[14px] font-semibold text-fg">I ran the command — here's the output</h3>
      </div>
      <p className="mb-3 text-[12.5px] text-muted">
        Paste what your tool returned. The teacher interprets it conservatively — it never invents
        results, and it labels every claim as observed, inference, or hypothesis.
      </p>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={"22/tcp open ssh\n80/tcp open http\n445/tcp open microsoft-ds"}
        className="font-mono text-[12.5px]"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" leftIcon={<Sparkles className="h-4 w-4" />} onClick={analyze} disabled={!text.trim()}>
          Analyze result
        </Button>
        {text && (
          <Button variant="ghost" size="sm" onClick={() => { setText(""); setResult(null); }}>
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-4 border-t border-line pt-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary" icon={<CircleDot className="h-3 w-3" />}>
                Parser: {result.parser}
              </Badge>
              <span className="text-[14px] font-semibold text-fg">{result.headline}</span>
            </div>

            {!result.matched && (
              <Callout tone="info">
                {result.caveat ?? "No structured pattern recognized — you can still record notes and findings manually."}
              </Callout>
            )}

            {/* Claims with epistemic labels (spec §13) */}
            {result.observations.length > 0 && (
              <div className="space-y-1.5">
                {result.observations.map((o, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg border border-line bg-base/40 px-3 py-2">
                    <span className="mt-0.5 shrink-0">
                      {o.severityHint === "notable" ? (
                        <span className="text-primary">
                          <Eye className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <CircleDot className="h-3.5 w-3.5 text-subtle" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] text-fg">{o.label}</div>
                      {o.detail && <div className="text-[12px] text-muted">{o.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Record actions */}
            {(foundServices.length > 0 || result.matched) && (
              <div className="flex flex-wrap gap-2">
                {foundServices.length > 0 && (
                  <Button size="sm" variant="subtle" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={recordServices}>
                    Record {foundServices.length} service{foundServices.length === 1 ? "" : "s"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FileText className="h-3.5 w-3.5" />}
                  onClick={saveOutput}
                >
                  Save output as evidence
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    addNote(assessmentId, { type: "observation", content: result.headline ?? "Analyzed output", tags: [result.parser] });
                    toast("Added observation to notes", "success");
                  }}
                >
                  Add observation to notes
                </Button>
              </div>
            )}

            {/* Next steps (decision engine) */}
            {result.suggestions.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  What does it mean → what to do next
                </h4>
                <div className="space-y-2">
                  {result.suggestions
                    .filter((s) => !(s.goto.type === "route" && s.goto.id.startsWith("#")))
                    .map((s, i) => (
                      <GotoLink
                        key={i}
                        goto={s.goto}
                        label={s.label}
                        detail={s.detail}
                        assessmentId={assessmentId}
                        tone={i === 0 ? "primary" : "default"}
                      />
                    ))}
                </div>
              </div>
            )}

            {result.caveat && result.matched && (
              <Callout tone="warning" icon={<FlaskConical className="h-4 w-4" />}>
                {result.caveat}
              </Callout>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
