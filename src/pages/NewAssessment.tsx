import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  ShieldCheck,
  Boxes,
  Flag,
  Play,
} from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, Input, Textarea, Field, Callout } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useAssessments } from "@/store/assessments";
import type { Environment, StartingPoint } from "@/types";

const STEPS = [
  { id: "name", label: "Name", icon: Flag },
  { id: "target", label: "Target", icon: Target },
  { id: "scope", label: "Scope", icon: ShieldCheck },
  { id: "env", label: "Environment", icon: Boxes },
  { id: "start", label: "Start point", icon: Play },
] as const;

const ENVIRONMENTS: { id: Environment; label: string; desc: string }[] = [
  { id: "htb", label: "Hack The Box", desc: "HTB machine or lab" },
  { id: "thm", label: "TryHackMe", desc: "THM room" },
  { id: "ctf", label: "CTF", desc: "Capture-the-flag challenge" },
  { id: "personal", label: "Personal Lab", desc: "Your own lab VMs" },
  { id: "authorized", label: "Authorized Pentest", desc: "Scoped engagement with permission" },
  { id: "other", label: "Other", desc: "Something else (authorized)" },
];

const STARTS: { id: StartingPoint; label: string; desc: string }[] = [
  { id: "new", label: "New target", desc: "Just an IP/host — start from scope & recon" },
  { id: "known_ports", label: "Known open ports", desc: "You already scanned — jump to enumeration" },
  { id: "known_web", label: "Known web app", desc: "There's a web application to test" },
  { id: "have_creds", label: "I have credentials", desc: "Start with a working credential" },
  { id: "have_shell", label: "I have a shell", desc: "Go straight to post-exploitation" },
  { id: "custom", label: "Custom", desc: "I'll decide as I go" },
];

export function NewAssessment() {
  const navigate = useNavigate();
  const createAssessment = useAssessments((s) => s.createAssessment);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [hostname, setHostname] = useState("");
  const [domain, setDomain] = useState("");
  const [assetNotes, setAssetNotes] = useState("");
  const [authorizedTargets, setAuthorizedTargets] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [constraints, setConstraints] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [environment, setEnvironment] = useState<Environment>("htb");
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("new");

  const canNext = [
    name.trim().length > 0,
    ip.trim().length > 0 || hostname.trim().length > 0 || domain.trim().length > 0,
    authorized,
    true,
    true,
  ];

  function submit() {
    const id = createAssessment({
      name: name.trim(),
      environment,
      startingPoint,
      scope: {
        authorizedTargets: authorizedTargets.trim() || ip.trim() || hostname.trim() || domain.trim(),
        allowedIps: ip.trim() || undefined,
        allowedDomains: domain.trim() || undefined,
        exclusions: exclusions.trim() || undefined,
        constraints: constraints.trim() || undefined,
        authorized,
      },
      asset: {
        id: "asset",
        ip: ip.trim() || undefined,
        hostname: hostname.trim() || undefined,
        domain: domain.trim() || undefined,
        os: "unknown",
        notes: assetNotes.trim() || undefined,
      },
    });
    navigate(`/a/${id}`);
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Page>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Start a new assessment</h1>
        <p className="mt-1 text-[14px] text-muted">
          A few quick questions, then the teacher takes you from the very first step.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => i <= step && setStep(i)}
                className="flex items-center gap-2.5"
                disabled={i > step}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border transition-colors",
                    active && "border-primary bg-primary/15 text-primary",
                    done && "border-success/40 bg-success/12 text-success",
                    !active && !done && "border-line bg-surface text-subtle"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </span>
                <span
                  className={cn(
                    "hidden text-[13px] font-medium sm:block",
                    active ? "text-fg" : "text-subtle"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn("mx-3 h-px flex-1", done ? "bg-success/40" : "bg-line")} />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <Field label="Assessment name" required hint="Something you'll recognize">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="HTB — Example Machine"
                    autoFocus
                  />
                </Field>
                <Callout tone="tip">
                  Give it a descriptive name — you'll come back to this. The teacher, notes, findings,
                  and report all live under this assessment.
                </Callout>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="IP address" hint="e.g. 10.10.10.10">
                    <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.10.10" className="font-mono" autoFocus />
                  </Field>
                  <Field label="Hostname">
                    <Input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="target.local" className="font-mono" />
                  </Field>
                  <Field label="Domain">
                    <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="corp.local" className="font-mono" />
                  </Field>
                </div>
                <Field label="Notes (optional)">
                  <Textarea value={assetNotes} onChange={(e) => setAssetNotes(e.target.value)} rows={2} placeholder="Anything you already know about this target…" />
                </Field>
                <p className="text-[12.5px] text-subtle">Provide at least one of IP, hostname, or domain.</p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Field label="Authorized target(s)" hint="What you're permitted to test">
                  <Textarea
                    value={authorizedTargets}
                    onChange={(e) => setAuthorizedTargets(e.target.value)}
                    rows={2}
                    placeholder="10.10.10.10 (defaults to your target if blank)"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Exclusions">
                    <Textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={2} placeholder="Anything explicitly out of scope" />
                  </Field>
                  <Field label="Constraints">
                    <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={2} placeholder="Testing window, no-DoS, rate limits…" />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-base/40 p-3.5">
                  <input
                    type="checkbox"
                    checked={authorized}
                    onChange={(e) => setAuthorized(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[rgb(var(--c-primary))]"
                  />
                  <span className="text-[13px] text-fg/90">
                    I confirm I am <span className="font-semibold text-fg">authorized</span> to test this
                    target (a lab, CTF, or an engagement with explicit written permission).
                  </span>
                </label>
                {!authorized && (
                  <Callout tone="warning">
                    This tool is for authorized labs and engagements only. You must confirm authorization
                    to continue.
                  </Callout>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-3 text-[13px] text-muted">Where is this target?</div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {ENVIRONMENTS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEnvironment(e.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                        environment === e.id
                          ? "border-primary/50 bg-primary/8"
                          : "border-line bg-surface/50 hover:border-line-strong"
                      )}
                    >
                      <div>
                        <div className="text-[14px] font-medium text-fg">{e.label}</div>
                        <div className="text-[12.5px] text-muted">{e.desc}</div>
                      </div>
                      {environment === e.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-3 text-[13px] text-muted">Where do you want to begin?</div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {STARTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStartingPoint(s.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                        startingPoint === s.id
                          ? "border-primary/50 bg-primary/8"
                          : "border-line bg-surface/50 hover:border-line-strong"
                      )}
                    >
                      <div>
                        <div className="text-[14px] font-medium text-fg">{s.label}</div>
                        <div className="text-[12.5px] text-muted">{s.desc}</div>
                      </div>
                      {startingPoint === s.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <Button variant="ghost" onClick={back} disabled={step === 0} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={next}
              disabled={!canNext[step]}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={submit} rightIcon={<Play className="h-4 w-4" />}>
              Create assessment
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}
