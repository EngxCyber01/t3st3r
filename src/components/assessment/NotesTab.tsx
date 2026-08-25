import { useMemo, useState } from "react";
import { Pin, Trash2, Plus, NotebookPen } from "lucide-react";
import type { Assessment, NoteType } from "@/types";
import { cn } from "@/lib/cn";
import { Textarea, Button, Chip, EmptyState, useToast } from "@/components/ui";
import { useAssessments } from "@/store/assessments";
import { timeAgo } from "@/lib/utils";

const NOTE_TYPES: { id: NoteType; label: string; tone: string }[] = [
  { id: "note", label: "Note", tone: "bg-raised text-muted" },
  { id: "observation", label: "Observation", tone: "bg-info/12 text-info" },
  { id: "hypothesis", label: "Hypothesis", tone: "bg-teacher/12 text-teacher" },
  { id: "credential", label: "Credential", tone: "bg-caution/12 text-caution" },
  { id: "finding", label: "Finding", tone: "bg-elevated/12 text-elevated" },
  { id: "todo", label: "TODO", tone: "bg-primary/12 text-primary" },
  { id: "command", label: "Command", tone: "bg-success/12 text-success" },
  { id: "url", label: "URL", tone: "bg-info/12 text-info" },
];

const typeTone = Object.fromEntries(NOTE_TYPES.map((t) => [t.id, t.tone]));

export function NotesTab({ assessment }: { assessment: Assessment }) {
  const addNote = useAssessments((s) => s.addNote);
  const deleteNote = useAssessments((s) => s.deleteNote);
  const togglePin = useAssessments((s) => s.toggleNotePin);
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [type, setType] = useState<NoteType>("note");
  const [filter, setFilter] = useState<NoteType | "all">("all");

  const notes = useMemo(() => {
    const list = filter === "all" ? assessment.notes : assessment.notes.filter((n) => n.type === filter);
    return [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [assessment.notes, filter]);

  function add() {
    if (!content.trim()) return;
    addNote(assessment.id, { type, content: content.trim(), tags: [type] });
    setContent("");
    toast("Note added", "success");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface/60 p-4">
        <div className="mb-2 flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-semibold text-fg">Pentest notebook</h3>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") add();
          }}
          rows={3}
          placeholder="Record an observation, hypothesis, credential, or TODO…  (Ctrl+Enter to save)"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {NOTE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11.5px] font-medium transition-all",
                  type === t.id ? t.tone + " ring-1 ring-inset ring-current/30" : "text-subtle hover:bg-raised"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="primary" className="ml-auto" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={add} disabled={!content.trim()}>
            Add note
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({assessment.notes.length})
        </Chip>
        {NOTE_TYPES.map((t) => {
          const count = assessment.notes.filter((n) => n.type === t.id).length;
          if (!count) return null;
          return (
            <Chip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
              {t.label} ({count})
            </Chip>
          );
        })}
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={<NotebookPen className="h-6 w-6" />} title="No notes yet" description="Record discoveries as you go — the credential you skip now is the one you'll want later." />
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className={cn(
                "group rounded-xl border bg-surface/50 p-3.5",
                n.pinned ? "border-primary/30" : "border-line"
              )}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className={cn("rounded px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide", typeTone[n.type])}>
                  {n.type}
                </span>
                <span className="text-[11px] text-subtle">{timeAgo(n.createdAt)}</span>
                <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => togglePin(assessment.id, n.id)}
                    className={cn("rounded p-1 hover:bg-raised", n.pinned ? "text-primary" : "text-subtle hover:text-fg")}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteNote(assessment.id, n.id)} className="rounded p-1 text-subtle hover:bg-critical/10 hover:text-critical">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className={cn("whitespace-pre-wrap text-[13px] leading-relaxed text-fg/90", n.type === "command" && "font-mono text-[12.5px]")}>
                {n.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
