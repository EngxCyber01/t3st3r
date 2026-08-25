import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, CornerDownLeft } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useUI } from "@/store/ui";
import { searchContent, type SearchItem, type SearchType } from "@/content/searchIndex";

const typeLabel: Record<SearchType, string> = {
  lesson: "Lesson",
  service: "Service",
  command: "Command",
  port: "Port",
  glossary: "Glossary",
  reference: "Reference",
  lab: "Lab",
  page: "Page",
};

const SUGGESTED = ["nmap", "445", "SMB", "SUID", "sudo -l", "content discovery", "kerberoast"];

export function CommandPalette() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchItem[]>(() => (q ? searchContent(q, 30) : []), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  function go(item: SearchItem) {
    setOpen(false);
    navigate(item.route);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} size="lg" className="!mt-[8vh]">
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="h-4.5 w-4.5 shrink-0 text-subtle" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search commands, services, ports, lessons, glossary…"
          className="h-14 w-full bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none"
        />
        <span className="kbd shrink-0">Esc</span>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        {!q && (
          <div className="px-2 py-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Try searching
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="rounded-lg border border-line bg-surface/60 px-2.5 py-1 text-[12.5px] text-muted transition-colors hover:border-primary/40 hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && results.length === 0 && (
          <div className="px-3 py-10 text-center text-[13px] text-subtle">
            No matches for “{q}”. Try a port number, tool name, or concept.
          </div>
        )}

        {results.map((item, i) => (
          <button
            key={item.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(item)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              i === active ? "bg-primary/12" : "hover:bg-raised"
            )}
          >
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                i === active ? "border-primary/30 bg-primary/10 text-primary" : "border-line bg-surface text-subtle"
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-[13px] text-fg">{item.title}</div>
              <div className="truncate text-[12px] text-muted">{item.subtitle}</div>
            </div>
            <span className="shrink-0 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-subtle">
              {typeLabel[item.type]}
            </span>
            {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </button>
        ))}
      </div>
    </Dialog>
  );
}
