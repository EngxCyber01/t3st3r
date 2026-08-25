import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Branch, GotoRef } from "@/types";
import { cn } from "@/lib/cn";
import { resolveGoto } from "@/content";
import { RiskBadge } from "@/components/ui";

/** A clickable next-step that routes via the decision engine's resolveGoto. */
export function GotoLink({
  goto,
  label,
  detail,
  risk,
  assessmentId,
  tone = "default",
  onNavigate,
}: {
  goto: GotoRef | undefined;
  label: string;
  detail?: string;
  risk?: Branch["risk"];
  assessmentId?: string;
  tone?: "default" | "primary";
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const resolved = resolveGoto(goto, { assessmentId });

  function handle() {
    onNavigate?.();
    if (resolved.route.startsWith("#")) return; // special sentinels handled by caller
    navigate(resolved.route);
  }

  return (
    <button
      onClick={handle}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
        tone === "primary"
          ? "border-primary/30 bg-primary/8 hover:border-primary/50 hover:bg-primary/12"
          : "border-line bg-surface/50 hover:border-line-strong hover:bg-raised"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-[13.5px] font-medium", tone === "primary" ? "text-primary" : "text-fg")}>
            {label}
          </span>
          {risk && <RiskBadge risk={risk} />}
        </div>
        {detail && <p className="mt-0.5 text-[12.5px] text-muted">{detail}</p>}
      </div>
      <ArrowRight
        className={cn(
          "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          tone === "primary" ? "text-primary" : "text-subtle"
        )}
      />
    </button>
  );
}

/** Renders a lesson/module's branches as an "If / Else" next-steps list (spec §53). */
export function BranchList({
  branches,
  assessmentId,
  title = "If / else — what to do next",
}: {
  branches: Branch[];
  assessmentId?: string;
  title?: string;
}) {
  if (!branches.length) return null;
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">{title}</h4>
      <div className="space-y-2">
        {branches.map((b, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface/40 p-3">
            <div className="mb-2 flex items-start gap-2">
              <span className="mt-0.5 rounded bg-teacher/12 px-1.5 py-0.5 font-mono text-[11px] text-teacher">
                IF
              </span>
              <span className="text-[13px] font-medium text-fg">{b.condition}</span>
            </div>
            <p className="mb-2 pl-1 text-[12.5px] text-muted">{b.outcome}</p>
            {b.goto && (
              <GotoLink
                goto={b.goto}
                label="Go there"
                risk={b.risk}
                assessmentId={assessmentId}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
