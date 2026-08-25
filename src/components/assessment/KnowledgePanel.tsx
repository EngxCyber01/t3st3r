import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Server,
  KeyRound,
  Bug,
  Target,
  Plus,
  X,
  Monitor,
  ExternalLink,
} from "lucide-react";
import type { Assessment } from "@/types";
import { Badge, SeverityBadge, Input, Button, useToast } from "@/components/ui";
import { useAssessments } from "@/store/assessments";
import { serviceModuleForPort } from "@/content/services";

export function KnowledgePanel({ assessment }: { assessment: Assessment }) {
  const navigate = useNavigate();
  const addService = useAssessments((s) => s.addService);
  const removeService = useAssessments((s) => s.removeService);
  const setAssetOS = useAssessments((s) => s.setAssetOS);
  const addCredential = useAssessments((s) => s.addCredential);
  const { toast } = useToast();

  const [portInput, setPortInput] = useState("");
  const [credUser, setCredUser] = useState("");
  const [credSecret, setCredSecret] = useState("");

  function quickAddPort() {
    const port = parseInt(portInput.trim(), 10);
    if (!port || port < 1 || port > 65535) {
      toast("Enter a valid port (1–65535)", "warning");
      return;
    }
    const mod = serviceModuleForPort(port);
    addService(assessment.id, {
      port,
      protocol: "tcp",
      service: mod?.id ?? "unknown",
      status: "open",
    });
    setPortInput("");
    toast(`Added port ${port}`, "success");
  }

  function quickAddCred() {
    if (!credUser.trim() && !credSecret.trim()) return;
    addCredential(assessment.id, {
      username: credUser.trim() || undefined,
      secret: credSecret.trim() || undefined,
      kind: "password",
      works: "untested",
    });
    setCredUser("");
    setCredSecret("");
    toast("Credential recorded", "success");
  }

  return (
    <div className="space-y-4">
      {/* Target */}
      <Section title="Target" icon={<Target className="h-3.5 w-3.5" />}>
        <div className="space-y-1.5 font-mono text-[12.5px]">
          {assessment.asset.ip && <Row k="IP" v={assessment.asset.ip} />}
          {assessment.asset.hostname && <Row k="Host" v={assessment.asset.hostname} />}
          {assessment.asset.domain && <Row k="Domain" v={assessment.asset.domain} />}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 text-subtle" />
          <span className="text-[12px] text-muted">OS:</span>
          <div className="flex gap-1">
            {(["linux", "windows", "unknown"] as const).map((os) => (
              <button
                key={os}
                onClick={() => setAssetOS(assessment.id, os)}
                className={`rounded px-1.5 py-0.5 text-[11px] capitalize transition-colors ${
                  assessment.asset.os === os
                    ? "bg-primary/15 text-primary"
                    : "text-subtle hover:bg-raised hover:text-fg"
                }`}
              >
                {os}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section
        title={`Services (${assessment.services.length})`}
        icon={<Server className="h-3.5 w-3.5" />}
      >
        <div className="mb-2 flex gap-1.5">
          <Input
            value={portInput}
            onChange={(e) => setPortInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && quickAddPort()}
            placeholder="Add port…"
            className="h-8 text-[12px]"
          />
          <Button size="sm" variant="secondary" onClick={quickAddPort} className="h-8 px-2.5">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {assessment.services.length === 0 ? (
          <p className="text-[12px] text-subtle">No services yet. Add ports or analyze a scan.</p>
        ) : (
          <ul className="space-y-1">
            {assessment.services.map((svc) => {
              const mod = serviceModuleForPort(svc.port);
              return (
                <li
                  key={svc.id}
                  className="group flex items-center gap-2 rounded-lg border border-line bg-base/40 px-2 py-1.5"
                >
                  <span className="font-mono text-[12px] text-primary">{svc.port}</span>
                  <span className="flex-1 truncate text-[12px] text-fg">{svc.service}</span>
                  {mod && (
                    <button
                      onClick={() => navigate(`/services/${mod.id}`)}
                      className="text-subtle opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      title="Open module"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeService(assessment.id, svc.id)}
                    className="text-subtle opacity-0 transition-opacity hover:text-critical group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Credentials */}
      <Section title={`Credentials (${assessment.credentials.length})`} icon={<KeyRound className="h-3.5 w-3.5" />}>
        <div className="mb-2 space-y-1.5">
          <Input value={credUser} onChange={(e) => setCredUser(e.target.value)} placeholder="user" className="h-8 text-[12px] font-mono" />
          <div className="flex gap-1.5">
            <Input value={credSecret} onChange={(e) => setCredSecret(e.target.value)} onKeyDown={(e) => e.key === "Enter" && quickAddCred()} placeholder="password / hash" className="h-8 text-[12px] font-mono" />
            <Button size="sm" variant="secondary" onClick={quickAddCred} className="h-8 px-2.5">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {assessment.credentials.length === 0 ? (
          <p className="text-[12px] text-subtle">No credentials yet.</p>
        ) : (
          <ul className="space-y-1">
            {assessment.credentials.map((c) => (
              <li key={c.id} className="rounded-lg border border-line bg-base/40 px-2 py-1.5 font-mono text-[12px]">
                <span className="text-fg">{c.username || "—"}</span>
                <span className="text-subtle"> : </span>
                <span className="text-muted">{c.secret || "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Findings summary */}
      <Section title={`Findings (${assessment.findings.length})`} icon={<Bug className="h-3.5 w-3.5" />}>
        {assessment.findings.length === 0 ? (
          <p className="text-[12px] text-subtle">No findings yet.</p>
        ) : (
          <ul className="space-y-1">
            {assessment.findings.slice(0, 5).map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-lg border border-line bg-base/40 px-2 py-1.5">
                <SeverityBadge severity={f.severity} />
                <span className="flex-1 truncate text-[12px] text-fg">{f.title}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-subtle">{k}</span>
      <span className="truncate text-fg">{v}</span>
    </div>
  );
}
