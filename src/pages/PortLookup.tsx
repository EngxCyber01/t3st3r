import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Server, ArrowRight, Terminal, ListChecks, Compass } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Input, Badge, Callout } from "@/components/ui";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PORTS, lookupPort } from "@/content/ports";
import { getServiceModule } from "@/content/services";
import { getLesson } from "@/content/lessons";

export function PortLookup() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("p") ?? "");

  useEffect(() => {
    const p = params.get("p");
    if (p) setQ(p);
  }, [params]);

  const portNum = parseInt(q.trim(), 10);
  const match = useMemo(() => (portNum ? lookupPort(portNum) : undefined), [portNum]);
  const mod = match?.serviceModuleId ? getServiceModule(match.serviceModuleId) : undefined;

  return (
    <Page>
      <PageHeader
        eyebrow="Lookup"
        title="Port lookup"
        description="Enter a port to learn what it usually is, what to investigate, which commands to run, and where it leads."
        icon={<Search className="h-5 w-5" />}
      />

      <div className="relative mb-6 max-w-xs">
        <Server className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setParams(e.target.value ? { p: e.target.value } : {}, { replace: true });
          }}
          placeholder="e.g. 445"
          className="pl-9 font-mono"
          inputMode="numeric"
          autoFocus
        />
      </div>

      {!q && (
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-subtle">Common ports</h2>
          <div className="flex flex-wrap gap-2">
            {PORTS.map((p) => (
              <button
                key={p.port}
                onClick={() => {
                  setQ(String(p.port));
                  setParams({ p: String(p.port) });
                }}
                className="rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[13px] transition-colors hover:border-primary/40 hover:text-fg"
              >
                <span className="font-mono text-primary">{p.port}</span>{" "}
                <span className="text-muted">{p.service}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {q && !match && (
        <Callout tone="info">
          No entry for port <span className="font-mono">{q}</span> in the knowledge base. Run{" "}
          <span className="font-mono">nmap -sV -p{q} &lt;TARGET&gt;</span> to identify what's actually listening,
          then enumerate based on the service.
        </Callout>
      )}

      {match && (
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-3xl font-semibold text-primary">{match.port}</span>
              <div>
                <h2 className="text-xl font-semibold text-fg">{match.service}</h2>
                <div className="flex items-center gap-1.5">
                  <Badge tone="neutral">{match.protocol}</Badge>
                  {match.os && match.os !== "any" && <Badge tone="neutral" className="capitalize">{match.os}</Badge>}
                </div>
              </div>
              {mod && (
                <Link
                  to={`/services/${mod.id}`}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary/12 px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  Open module <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-fg/90">{match.summary}</p>
          </div>

          <div className="rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-info">
              <ListChecks className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">What to investigate</span>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-[13.5px] text-fg/85 marker:text-info">
              {match.investigate.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          {match.commands && match.commands.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Terminal className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Commands</span>
              </div>
              <CodeBlock code={match.commands.join("\n")} language="shell" />
            </div>
          )}

          {match.nextSteps && match.nextSteps.length > 0 && (
            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-teacher">
                <Compass className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Next steps</span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-[13.5px] text-fg/85 marker:text-teacher">
                {match.nextSteps.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          {match.relatedLessons && match.relatedLessons.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {match.relatedLessons.map((id) => {
                const l = getLesson(id);
                const to = l ? `/learn/${id}` : id.startsWith("svc-") ? `/services/${id.slice(4)}` : `/learn/${id}`;
                const label = l?.title ?? id;
                return (
                  <Link key={id} to={to} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-primary/40 hover:text-fg">
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
