import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { Dialog, DialogHeader } from "@/components/ui/Dialog";
import { Callout } from "@/components/ui/Callout";
import { Button } from "@/components/ui";
import { useUI } from "@/store/ui";
import { useAssessments } from "@/store/assessments";
import { STUCK_PHASES, type StuckPhase, resolveGoto } from "@/content";

export function ImStuck() {
  const open = useUI((s) => s.stuckOpen);
  const setOpen = useUI((s) => s.setStuckOpen);
  const activeId = useAssessments((s) => s.activeId);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<StuckPhase | null>(null);

  function close() {
    setOpen(false);
    setTimeout(() => setSelected(null), 200);
  }

  return (
    <Dialog open={open} onClose={close} size="lg" labelledBy="stuck-title">
      <DialogHeader
        title={<span id="stuck-title">I'm stuck</span>}
        description="That's okay — let's slow down and find the next question to ask."
        icon={<LifeBuoy className="h-4 w-4" />}
        onClose={close}
      />

      <div className="p-5">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="phases"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <p className="mb-4 text-[13.5px] text-muted">
                Where are you right now? Pick the phase that best matches — the teacher will help you
                figure out what information you're missing.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {STUCK_PHASES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="flex items-center justify-between rounded-xl border border-line bg-surface/50 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-raised"
                  >
                    <span className="text-[14px] font-medium text-fg">{p.label}</span>
                    <ArrowRight className="h-4 w-4 text-subtle" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="space-y-4"
            >
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All phases
              </button>

              <Callout tone="teacher" title="The question to ask yourself" icon={<HelpCircle className="h-4 w-4" />}>
                {selected.question}
              </Callout>

              <div className="rounded-xl border border-line bg-surface/50 p-4">
                <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  What usually unblocks this
                </h4>
                <p className="text-[13.5px] leading-relaxed text-fg/85">{selected.guidance}</p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => {
                  const r = resolveGoto(selected.action.goto, { assessmentId: activeId ?? undefined });
                  close();
                  navigate(r.route);
                }}
              >
                {selected.action.label}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  );
}
