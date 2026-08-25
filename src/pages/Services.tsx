import { Link } from "react-router-dom";
import { Server, ArrowRight } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { RiskBadge, Badge } from "@/components/ui";
import { SERVICE_MODULES } from "@/content/services";

const categoryLabel: Record<string, string> = {
  network: "Network / Infrastructure",
  database: "Databases",
  application: "Applications",
  web: "Web",
  remote: "Remote Access",
};

export function Services() {
  const groups = SERVICE_MODULES.reduce<Record<string, typeof SERVICE_MODULES>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Modules"
        title="Service enumeration modules"
        description="Each open port maps to a service, and each service to a teacher-led enumeration workflow. Find a service, learn exactly what to check and why."
        icon={<Server className="h-5 w-5" />}
      />

      <div className="space-y-8">
        {Object.entries(groups).map(([cat, modules]) => (
          <section key={cat}>
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-subtle">
              {categoryLabel[cat] ?? cat}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <Link
                  key={m.id}
                  to={`/services/${m.id}`}
                  className="group flex flex-col rounded-2xl border border-line bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-fg">{m.name}</h3>
                    {m.risk && <RiskBadge risk={m.risk} />}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {m.ports.map((p) => (
                      <Badge key={p} tone="neutral" className="font-mono">
                        :{p}
                      </Badge>
                    ))}
                  </div>
                  <p className="flex-1 text-[12.5px] leading-relaxed text-muted">{m.tagline}</p>
                  <div className="mt-3 flex items-center text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open module <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
