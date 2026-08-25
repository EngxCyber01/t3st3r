import { Download } from "lucide-react";
import type { Assessment, TimelineKind } from "@/types";
import { Button, EmptyState, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatTime, formatDate, copyToClipboard } from "@/lib/utils";

const kindMeta: Record<TimelineKind, { icon: string; color: string }> = {
  phase: { icon: "Flag", color: "text-primary" },
  command: { icon: "SquareTerminal", color: "text-info" },
  finding: { icon: "Bug", color: "text-elevated" },
  service: { icon: "Server", color: "text-info" },
  note: { icon: "NotebookPen", color: "text-muted" },
  access: { icon: "DoorOpen", color: "text-critical" },
  credential: { icon: "KeyRound", color: "text-caution" },
  milestone: { icon: "Milestone", color: "text-teacher" },
};

export function TimelineTab({ assessment }: { assessment: Assessment }) {
  const { toast } = useToast();
  const events = [...assessment.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  function exportTimeline() {
    const lines = events.map(
      (e) => `${formatDate(e.timestamp)} ${formatTime(e.timestamp)} — [${e.kind}] ${e.label}${e.detail ? ` (${e.detail})` : ""}`
    );
    copyToClipboard(`Timeline — ${assessment.name}\n\n${lines.join("\n")}`);
    toast("Timeline copied to clipboard", "success");
  }

  if (events.length === 0) {
    return <EmptyState icon={<Icon name="Milestone" className="h-6 w-6" />} title="No events yet" description="Milestones appear here as you work." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted">A chronological record — useful for the report and for correlating with logs.</p>
        <Button size="sm" variant="secondary" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={exportTimeline}>
          Copy timeline
        </Button>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[9px] top-1 h-[calc(100%-0.5rem)] w-px bg-line" />
        <div className="space-y-3">
          {events.map((e) => {
            const meta = kindMeta[e.kind];
            return (
              <div key={e.id} className="relative">
                <div className={`absolute -left-6 top-0.5 grid h-[19px] w-[19px] place-items-center rounded-full border border-line bg-surface ${meta.color}`}>
                  <Icon name={meta.icon} className="h-3 w-3" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11.5px] text-subtle">{formatTime(e.timestamp)}</span>
                  <span className="text-[13px] text-fg">{e.label}</span>
                </div>
                {e.detail && <span className="text-[12px] text-muted">{e.detail}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
