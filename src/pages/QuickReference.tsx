import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookMarked, Copy, Check, Search } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Input, RiskBadge } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { REFERENCE } from "@/content/reference";
import { copyToClipboard, includesCI, fillTemplate } from "@/lib/utils";
import { useActiveVars } from "@/hooks/useActiveVars";

export function QuickReference() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { vars } = useActiveVars();
  const fill = (cmd: string) => fillTemplate(cmd, vars);

  const sections = useMemo(() => {
    if (!q) return REFERENCE;
    return REFERENCE.map((s) => ({
      ...s,
      entries: s.entries.filter((e) => includesCI(`${e.command} ${e.description}`, q)),
    })).filter((s) => s.entries.length > 0);
  }, [q]);

  // Which section is currently in view (scroll-spy) — drives the left highlight.
  const [activeSection, setActiveSection] = useState<string>(params.get("s") ?? REFERENCE[0].id);
  const visible = useRef<Set<string>>(new Set());
  const navRef = useRef<HTMLElement | null>(null);
  const navBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const clickLock = useRef(false);

  // Observe each section; the topmost visible one becomes active.
  useEffect(() => {
    visible.current.clear();
    const ids = sections.map((s) => s.id);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.current.add(e.target.id);
          else visible.current.delete(e.target.id);
        }
        if (clickLock.current) return; // don't fight a click-scroll in progress
        const topmost = ids.find((id) => visible.current.has(id));
        if (topmost) setActiveSection(topmost);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  // Keep the active item visible inside the (independently scrolling) nav.
  useEffect(() => {
    navBtnRefs.current[activeSection]?.scrollIntoView({ block: "nearest" });
  }, [activeSection]);

  function goToSection(id: string) {
    setActiveSection(id);
    setParams({ s: id }, { replace: true });
    clickLock.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    // release the lock after the smooth scroll settles
    window.setTimeout(() => (clickLock.current = false), 700);
  }

  async function copy(cmd: string) {
    if (await copyToClipboard(cmd)) {
      setCopied(cmd);
      setTimeout(() => setCopied(null), 1400);
    }
  }

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Reference"
        title="Quick reference"
        description="Command cheat sheets by area. Search across everything, copy with one click."
        icon={<BookMarked className="h-5 w-5" />}
      />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands…" className="pl-9" />
      </div>

      <div className="flex gap-6">
        {/* Section nav — sticky, and scrolls on its own so all sections are reachable */}
        <nav
          ref={navRef}
          className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-48 shrink-0 space-y-0.5 overflow-y-auto pr-1 lg:block"
        >
          {sections.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                ref={(el) => (navBtnRefs.current[s.id] = el)}
                onClick={() => goToSection(s.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors",
                  active
                    ? "bg-primary/12 font-medium text-primary"
                    : "text-muted hover:bg-raised hover:text-fg"
                )}
              >
                <Icon name={s.icon} className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-subtle")} />
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 space-y-8">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-raised text-primary">
                  <Icon name={s.icon} className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-fg">{s.title}</h2>
                  {s.intro && <p className="text-[12px] text-muted">{s.intro}</p>}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-line">
                {s.entries.map((e, i) => {
                  const filled = fill(e.command);
                  return (
                    <div
                      key={i}
                      className="group flex items-center gap-3 border-b border-line/60 bg-surface/40 px-3 py-2.5 last:border-0 hover:bg-raised/40"
                    >
                      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12.5px] text-fg/90">
                        {renderCmd(filled)}
                      </code>
                      <span className="hidden shrink-0 text-[12px] text-muted sm:block sm:max-w-[34%] sm:truncate">
                        {e.description}
                      </span>
                      {e.risk && e.risk !== "low" && <RiskBadge risk={e.risk} />}
                      <button
                        onClick={() => copy(filled)}
                        className="shrink-0 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface hover:text-fg"
                        aria-label="Copy"
                      >
                        {copied === filled ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {sections.length === 0 && (
            <p className="py-10 text-center text-[13px] text-subtle">No commands match “{q}”.</p>
          )}
        </div>
      </div>
    </Page>
  );
}

/** Highlight any remaining <PLACEHOLDER> tokens so it's clear what still needs a value. */
function renderCmd(cmd: string) {
  const parts = cmd.split(/(<[A-Za-z_]+>)/g);
  return parts.map((p, i) =>
    /^<[A-Za-z_]+>$/.test(p) ? (
      <span key={i} className="rounded bg-caution/15 px-0.5 text-caution">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
