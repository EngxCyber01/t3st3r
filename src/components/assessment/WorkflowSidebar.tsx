import { Check, ChevronRight } from "lucide-react";
import type { Assessment, PhaseId } from "@/types";
import { cn } from "@/lib/cn";
import { PHASES } from "@/content/phases";
import { Icon } from "@/components/ui/Icon";

export function WorkflowSidebar({
  assessment,
  onSelect,
}: {
  assessment: Assessment;
  onSelect: (phase: PhaseId) => void;
}) {
  const statusOf = (id: PhaseId) => assessment.phases.find((p) => p.id === id)?.status ?? "pending";

  return (
    <div className="space-y-0.5">
      <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
        Pentest lifecycle
      </div>
      {PHASES.map((p) => {
        const status = statusOf(p.id);
        const isActive = status === "active";
        const isDone = status === "done";
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
              isActive
                ? "bg-primary/12 text-primary"
                : isDone
                  ? "text-fg hover:bg-raised"
                  : "text-subtle hover:bg-raised hover:text-muted"
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px]",
                isActive && "border-primary/40 bg-primary/15 text-primary",
                isDone && "border-success/40 bg-success/12 text-success",
                !isActive && !isDone && "border-line text-subtle"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon name={p.icon} className="h-3.5 w-3.5" />}
            </span>
            <span className="flex-1 truncate text-[13px] font-medium">{p.label}</span>
            {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
