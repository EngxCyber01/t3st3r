import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  NotebookPen,
  CircleCheck,
  Info,
  TriangleAlert,
  Lightbulb,
  Blocks,
  Shuffle,
  Trash2,
} from "lucide-react";
import type { Command } from "@/types";
import { cn } from "@/lib/cn";
import { fillTemplate } from "@/lib/utils";
import { explainCommandParts, commandAlternatives } from "@/content/flags";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Badge, RiskBadge, Button } from "@/components/ui";
import { useProgress } from "@/store/progress";
import { useAssessments } from "@/store/assessments";
import { useToast } from "@/components/ui";

export function CommandCard({
  command,
  vars,
  assessmentId,
  compact,
  onDelete,
}: {
  command: Command;
  /** Values to substitute into <TARGET> etc. */
  vars?: Record<string, string | undefined>;
  /** When provided, enables "Add to notes" / "I ran this". */
  assessmentId?: string;
  compact?: boolean;
  /** When provided, shows a delete button (used for user-added commands). */
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const filled = vars ? fillTemplate(command.command, vars) : command.command;
  const done = useProgress((s) => s.completedCommands.includes(command.id));
  const markCommand = useProgress((s) => s.markCommand);
  const unmark = useProgress((s) => s.unmarkCommand);
  const addNote = useAssessments((s) => s.addNote);
  const addCommand = useAssessments((s) => s.addCommand);
  const { toast } = useToast();

  // Transient "just clicked" feedback for the action buttons.
  const [justDid, setJustDid] = useState<null | "notes" | "ran">(null);
  function flash(which: "notes" | "ran") {
    setJustDid(which);
    setTimeout(() => setJustDid((v) => (v === which ? null : v)), 1800);
  }

  // Part-by-part breakdown of THIS command (curated flags + tool-aware dictionary).
  const parts = explainCommandParts(command.command, command.flags);
  const alternatives = commandAlternatives(command.command);

  // Placeholders still needing a value after auto-fill (so it's obvious why a
  // pasted command "didn't work" — you still have <PORTS>/<cat>/etc to replace).
  const remaining = Array.from(new Set(filled.match(/<[A-Za-z_]+>/g) ?? []));

  const hasDetails =
    command.why ||
    command.whenToUse ||
    parts.length > 0 ||
    !!alternatives ||
    command.exampleOutput ||
    (command.lookFor && command.lookFor.length) ||
    (command.commonMistakes && command.commonMistakes.length) ||
    command.next;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/50">
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <Badge tone="primary" className="font-mono uppercase">
          {command.platform}
        </Badge>
        <span className="text-[12.5px] text-muted">{command.purpose}</span>
        <div className="ml-auto flex items-center gap-2">
          {command.risk && <RiskBadge risk={command.risk} />}
          {done && (
            <Badge tone="success" icon={<Check className="h-3 w-3" />}>
              done
            </Badge>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-md p-1 text-subtle transition-colors hover:bg-critical/10 hover:text-critical"
              aria-label="Delete command"
              title="Delete command"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <CodeBlock
          code={filled}
          language={command.platform}
          onCopy={() => toast("Command copied", "success")}
        />
        {remaining.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-subtle">
            <span className="text-caution">Replace before running:</span>
            {remaining.map((r) => (
              <code key={r} className="rounded bg-caution/10 px-1.5 py-0.5 font-mono text-caution">
                {r}
              </code>
            ))}
          </div>
        )}
      </div>

      {/* Action bar (spec §8, §15) */}
      <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
        {assessmentId && (
          <>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={
                justDid === "notes" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <NotebookPen className="h-3.5 w-3.5" />
                )
              }
              onClick={() => {
                addNote(assessmentId, { type: "command", content: filled, tags: command.tags ?? [] });
                toast("Added to notes", "success");
                flash("notes");
              }}
            >
              {justDid === "notes" ? "Added" : "Add to notes"}
            </Button>
            <Button
              size="sm"
              variant={justDid === "ran" ? "subtle" : "ghost"}
              leftIcon={
                justDid === "ran" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <CircleCheck className="h-3.5 w-3.5" />
                )
              }
              onClick={() => {
                addCommand(assessmentId, { command: filled, commandRefId: command.id });
                markCommand(command.id);
                toast("Recorded in command history", "success");
                flash("ran");
              }}
            >
              {justDid === "ran" ? "Recorded ✓" : "I ran this"}
            </Button>
          </>
        )}
        {!assessmentId && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<CircleCheck className="h-3.5 w-3.5" />}
            onClick={() => (done ? unmark(command.id) : markCommand(command.id))}
          >
            {done ? "Mark not done" : "Mark complete"}
          </Button>
        )}
        {hasDetails && !compact && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-fg"
          >
            {open ? "Hide" : "Why & details"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-line/70"
          >
            <div className="space-y-3 p-4 text-[13px]">
              {command.why && (
                <Detail icon={<Lightbulb className="h-4 w-4 text-primary" />} label="Why here">
                  {command.why}
                </Detail>
              )}
              {command.whenToUse && (
                <Detail icon={<Info className="h-4 w-4 text-info" />} label="When to use">
                  {command.whenToUse}
                </Detail>
              )}
              {parts.length > 0 && (
                <Detail icon={<Blocks className="h-4 w-4 text-primary" />} label="Command breakdown — part by part">
                  <ul className="space-y-1.5">
                    {parts.map((p) => (
                      <li key={p.part} className="flex gap-2">
                        <code className="mt-px h-max shrink-0 rounded bg-base px-1.5 py-0.5 font-mono text-[12px] text-caution">
                          {p.part}
                        </code>
                        <span className="text-muted">
                          {p.meaning}
                          {p.alt && <span className="text-subtle"> — you can also use {p.alt}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Detail>
              )}
              {alternatives && (
                <Detail icon={<Shuffle className="h-4 w-4 text-teacher" />} label="Alternatives">
                  <span className="text-muted">{alternatives}</span>
                </Detail>
              )}
              {command.exampleOutput && (
                <Detail label="Example output (illustrative — not your result)">
                  <CodeBlock code={command.exampleOutput} language="output" copyable={false} dense />
                </Detail>
              )}
              {command.lookFor && command.lookFor.length > 0 && (
                <Detail label="What to look for">
                  <ul className="ml-4 list-disc space-y-0.5 text-muted marker:text-primary">
                    {command.lookFor.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Detail>
              )}
              {command.commonMistakes && command.commonMistakes.length > 0 && (
                <Detail icon={<TriangleAlert className="h-4 w-4 text-elevated" />} label="Common mistakes">
                  <ul className="ml-4 list-disc space-y-0.5 text-muted marker:text-elevated">
                    {command.commonMistakes.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Detail>
              )}
              {command.next && (
                <Detail label="What to do next">
                  <span className="text-muted">{command.next}</span>
                </Detail>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
        {icon}
        {label}
      </div>
      <div className="text-fg/85">{children}</div>
    </div>
  );
}
