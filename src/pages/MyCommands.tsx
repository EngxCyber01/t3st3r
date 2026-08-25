import { useMemo, useState } from "react";
import { TerminalSquare, Plus, Wand2, Sparkles } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button, Textarea, Input, Field, Badge, EmptyState, Callout, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { CommandCard } from "@/components/teacher/CommandCard";
import { useUserCommands, type UserCommand } from "@/store/userCommands";
import { useActiveVars } from "@/hooks/useActiveVars";
import { useTarget } from "@/store/target";
import { categorizeCommand, getCategory, ALL_CATEGORIES } from "@/content/categorize";
import { getPhase } from "@/content/phases";
import { templatizeCommand } from "@/lib/utils";
import type { Command, RiskLevel } from "@/types";

const RISKS: RiskLevel[] = ["low", "medium", "high", "critical"];

/** Convert a stored user command into the shape CommandCard renders. */
function toCommand(uc: UserCommand): Command {
  return {
    id: uc.id,
    command: uc.command,
    platform: "any",
    purpose: uc.note || "Your command",
    risk: uc.risk,
  };
}

export function MyCommands() {
  const commands = useUserCommands((s) => s.commands);
  const add = useUserCommands((s) => s.add);
  const remove = useUserCommands((s) => s.remove);
  const { vars, assessmentId } = useActiveVars();
  const target = useTarget();
  const { toast } = useToast();

  const [cmd, setCmd] = useState("");
  const [note, setNote] = useState("");
  const [override, setOverride] = useState<string>("auto"); // "auto" or a category id
  const [risk, setRisk] = useState<RiskLevel>("low");

  const detected = useMemo(() => (cmd.trim() ? categorizeCommand(cmd) : null), [cmd]);
  const effectiveCat = override === "auto" ? detected : getCategory(override);

  function templatize() {
    const next = templatizeCommand(cmd, {
      target: target.target,
      lhost: target.lhost,
      domain: target.domain,
      wordlist: target.wordlist,
      ports: target.ports,
    });
    if (next === cmd) {
      toast("Nothing to templatize — set your Target/LHOST first", "warning");
      return;
    }
    setCmd(next);
    toast("Replaced your values with placeholders", "success");
  }

  function submit() {
    if (!cmd.trim()) return;
    add({
      command: cmd,
      note,
      category: override === "auto" ? undefined : override,
      risk,
    });
    setCmd("");
    setNote("");
    setOverride("auto");
    setRisk("low");
    toast("Command added", "success");
  }

  // Group commands by category, in the canonical category order.
  const groups = useMemo(() => {
    return ALL_CATEGORIES.map((c) => ({
      cat: c,
      items: commands.filter((uc) => uc.category === c.id),
    })).filter((g) => g.items.length > 0);
  }, [commands]);

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Your toolkit"
        title="My commands"
        description="Add the commands you actually use. They auto-fill from the Target bar (just like the built-ins), and the app auto-detects which phase/area each one belongs to."
        icon={<TerminalSquare className="h-5 w-5" />}
      />

      {/* Add form */}
      <div className="mb-8 rounded-2xl border border-line bg-surface p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,260px]">
          <div className="space-y-3">
            <Field
              label="Command"
              hint="Use <TARGET>, <PORTS>, <YOUR_IP>, <DOMAIN>, <WORDLIST> to auto-fill"
            >
              <Textarea
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
                }}
                rows={3}
                placeholder="e.g. nmap -p- <TARGET> -T5 --min-rate 5000"
                className="font-mono text-[13px]"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Wand2 className="h-3.5 w-3.5" />}
                onClick={templatize}
                disabled={!cmd.trim()}
                title="Replace your target/LHOST/domain values with placeholders so it auto-fills"
              >
                Templatize with my target
              </Button>
              {detected && (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Detected:
                  <Badge tone="primary" icon={<Icon name={detected.icon} className="h-3 w-3" />}>
                    {detected.label}
                  </Badge>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Field label="Note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What it does / when you use it" />
            </Field>
            <Field label="Category">
              <select
                value={override}
                onChange={(e) => setOverride(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-base/60 px-3 text-sm text-fg focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="auto">Auto-detect{detected ? ` → ${detected.label}` : ""}</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Risk">
              <div className="flex gap-1.5">
                {RISKS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] capitalize transition-colors ${
                      risk === r ? "border-primary/50 bg-primary/10 text-fg" : "border-line text-muted hover:border-line-strong"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[12px] text-subtle">
            {effectiveCat ? (
              <>Will be filed under <span className="text-fg">{effectiveCat.label}</span> ({getPhase(effectiveCat.phase).label})</>
            ) : (
              "Type a command to see where it belongs"
            )}
          </span>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={submit} disabled={!cmd.trim()}>
            Add command
          </Button>
        </div>
      </div>

      {!target.target && commands.length > 0 && (
        <Callout tone="tip" className="mb-6">
          Set your <span className="font-medium text-fg">Target</span> (and LHOST) in the bar above — your
          commands will fill in <code className="text-caution">&lt;TARGET&gt;</code>,{" "}
          <code className="text-caution">&lt;PORTS&gt;</code>, <code className="text-caution">&lt;YOUR_IP&gt;</code>{" "}
          automatically.
        </Callout>
      )}

      {/* Grouped list */}
      {commands.length === 0 ? (
        <EmptyState
          icon={<TerminalSquare className="h-6 w-6" />}
          title="No commands yet"
          description="Paste a command above — the app will auto-fill your target and figure out which phase it belongs to."
        />
      ) : (
        <div className="space-y-8">
          {groups.map(({ cat, items }) => (
            <section key={cat.id}>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-primary">
                  <Icon name={cat.icon} className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-fg">{cat.label}</h2>
                  <p className="text-[12px] text-muted">Phase: {getPhase(cat.phase).label}</p>
                </div>
                <Badge tone="neutral" className="ml-auto">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {items.map((uc) => (
                  <div key={uc.id}>
                    <CommandCard
                      command={toCommand(uc)}
                      vars={vars}
                      assessmentId={assessmentId}
                      onDelete={() => {
                        remove(uc.id);
                        toast("Command removed", "success");
                      }}
                    />
                    {uc.autoCategory && (
                      <div className="mt-1 pl-1 text-[11px] text-subtle">
                        auto-categorized — change it above when adding, if needed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
