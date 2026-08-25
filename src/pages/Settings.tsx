import { Settings as SettingsIcon, Sun, Moon, Sparkles, Trash2, RotateCcw } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button, Input, Field, Callout, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useSettings } from "@/store/settings";
import { useAssessments } from "@/store/assessments";
import { useProgress } from "@/store/progress";

export function Settings() {
  const s = useSettings();
  const { toast } = useToast();
  const resetLearning = useProgress((p) => p.reset);

  function clearAll() {
    if (!confirm("This deletes ALL assessments, notes, findings, and progress from this browser. Continue?")) return;
    // Clear persisted stores
    ["pt.assessments.v1", "pt.progress.v1"].forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("pt.demoSeeded");
    location.reload();
  }

  const providers: { id: typeof s.aiProvider; label: string }[] = [
    { id: "off", label: "Off (built-in engine)" },
    { id: "openai", label: "OpenAI" },
    { id: "anthropic", label: "Anthropic" },
    { id: "gemini", label: "Gemini" },
    { id: "local", label: "Local LLM" },
  ];

  return (
    <Page>
      <PageHeader eyebrow="Settings" title="Settings" description="Appearance, teaching, AI, and your local data." icon={<SettingsIcon className="h-5 w-5" />} />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Appearance */}
        <Card title="Appearance">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-fg">Theme</div>
                <div className="text-[12.5px] text-muted">Dark is the primary theme.</div>
              </div>
              <div className="flex gap-1 rounded-lg border border-line p-1">
                <button
                  onClick={() => s.setTheme("dark")}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px]", s.theme === "dark" ? "bg-raised text-fg" : "text-muted")}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
                <button
                  onClick={() => s.setTheme("light")}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px]", s.theme === "light" ? "bg-raised text-fg" : "text-muted")}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
              </div>
            </div>
            <Toggle
              label="Reduce motion"
              desc="Minimize animations and transitions."
              value={s.reducedMotion}
              onChange={s.setReducedMotion}
            />
          </div>
        </Card>

        {/* Teaching */}
        <Card title="Teaching">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-medium text-fg">Explanation depth</div>
              <div className="text-[12.5px] text-muted">How much the teacher elaborates.</div>
            </div>
            <div className="flex gap-1 rounded-lg border border-line p-1">
              {(["concise", "full"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => s.setVerbosity(v)}
                  className={cn("rounded-md px-3 py-1.5 text-[13px] capitalize", s.verbosity === v ? "bg-raised text-fg" : "text-muted")}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => { s.resetOnboarding(); toast("Onboarding will show again", "success"); }}>
              Replay onboarding
            </Button>
          </div>
        </Card>

        {/* AI */}
        <Card title="AI assistance (optional)">
          <Callout tone="info" className="mb-4">
            The app works fully without AI — the built-in engine interprets output deterministically and never
            invents facts. If you enable a provider, its key is stored only in this browser. In a hosted
            deployment you'd proxy requests server-side so keys never reach the client.
          </Callout>
          <Field label="Provider">
            <div className="flex flex-wrap gap-1.5">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => s.setAiProvider(p.id)}
                  className={cn("rounded-lg border px-3 py-1.5 text-[13px]", s.aiProvider === p.id ? "border-primary/50 bg-primary/10 text-fg" : "border-line text-muted hover:border-line-strong")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          {s.aiProvider !== "off" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="API key" hint="stored locally">
                <Input type="password" value={s.aiKey} onChange={(e) => s.setAiKey(e.target.value)} placeholder="sk-…" />
              </Field>
              <Field label="Model">
                <Input value={s.aiModel} onChange={(e) => s.setAiModel(e.target.value)} placeholder="model name" />
              </Field>
              <div className="sm:col-span-2">
                <Callout tone="warning">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    Remote providers aren't wired up in this local-first build yet — selecting one still falls back
                    to the built-in engine. The interface is ready for a provider to be added.
                  </div>
                </Callout>
              </div>
            </div>
          )}
        </Card>

        {/* Data */}
        <Card title="Data">
          <p className="mb-3 text-[13px] text-muted">
            Everything is stored locally in your browser — nothing is sent anywhere. Clearing removes all
            assessments, notes, findings, and progress.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => { resetLearning(); toast("Learning progress reset", "success"); }}>
              Reset learning progress
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={clearAll}>
              Clear all data
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-[15px] font-semibold text-fg">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[14px] font-medium text-fg">{label}</div>
        <div className="text-[12.5px] text-muted">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-primary" : "bg-line-strong")}
        role="switch"
        aria-checked={value}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", value ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
