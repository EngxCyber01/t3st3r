import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Dialog, DialogHeader } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useUI } from "@/store/ui";
import { useAssessments } from "@/store/assessments";
import { FOUND_OPTIONS, FOUND_GROUPS, resolveGoto } from "@/content";
import { includesCI } from "@/lib/utils";

export function IFoundSomething() {
  const open = useUI((s) => s.foundOpen);
  const setOpen = useUI((s) => s.setFoundOpen);
  const activeId = useAssessments((s) => s.activeId);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => (q ? FOUND_OPTIONS.filter((o) => includesCI(`${o.label} ${o.meaning}`, q)) : FOUND_OPTIONS),
    [q]
  );

  function pick(gotoRoute: string) {
    setOpen(false);
    setQ("");
    navigate(gotoRoute);
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} size="xl" labelledBy="found-title">
      <DialogHeader
        title={<span id="found-title">I found something — what now?</span>}
        description="Pick what you discovered and jump straight to the right teacher workflow."
        icon={<Compass className="h-4 w-4" />}
        onClose={() => setOpen(false)}
      />
      <div className="border-b border-line p-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter… (e.g. 445, login, shell, SUID, credential)"
          autoFocus
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {FOUND_GROUPS.map((group) => {
          const items = filtered.filter((o) => o.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-5 last:mb-0">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                {group}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((o) => {
                  const resolved = resolveGoto(o.goto, { assessmentId: activeId ?? undefined });
                  return (
                    <button
                      key={o.id}
                      onClick={() => pick(resolved.route)}
                      className={cn(
                        "group flex items-start gap-3 rounded-xl border border-line bg-surface/50 p-3 text-left transition-all",
                        "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-raised"
                      )}
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-raised text-primary">
                        <Icon name={o.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-medium text-fg">{o.label}</div>
                        <div className="mt-0.5 text-[12px] leading-snug text-muted">{o.meaning}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-subtle">
            Nothing matches “{q}”. Try a port, a service, or a discovery like “credential”.
          </div>
        )}
      </div>
    </Dialog>
  );
}
