import type { PhaseId } from "@/types";

export interface PhaseMeta {
  id: PhaseId;
  label: string;
  short: string;
  /** Default objective the teacher states when entering this phase. */
  objective: string;
  /** The teacher's opening line for the phase. */
  teacher: string;
  /** Lucide icon name. */
  icon: string;
  /** Optional risk emphasis. */
  emphasis?: "safe" | "caution" | "danger";
}

/**
 * The full pentest lifecycle (spec §63 state machine, §87 flow screen).
 * Order here defines progression; branching still allows revisiting.
 */
export const PHASES: PhaseMeta[] = [
  {
    id: "authorization",
    label: "Authorization & Scope",
    short: "Scope",
    objective: "Confirm you are authorized and understand the boundaries before touching anything.",
    teacher:
      "Before any packets go out — confirm scope. Who authorized this, what is in-scope, and what is explicitly off-limits? Everything after this assumes you have permission.",
    icon: "ShieldCheck",
    emphasis: "safe",
  },
  {
    id: "recon",
    label: "Reconnaissance",
    short: "Recon",
    objective: "Gather information about the target from passive and light-active sources.",
    teacher:
      "New target. Don't exploit anything yet. First we build a picture: what names, addresses, and technologies exist? We start passive, then move to light active recon.",
    icon: "Radar",
    emphasis: "safe",
  },
  {
    id: "scanning",
    label: "Scanning",
    short: "Scan",
    objective: "Discover which ports are open and which services answer.",
    teacher:
      "Now we find the doors. A port scan tells us what is listening. Scan, then read carefully — don't blindly fire aggressive scans.",
    icon: "ScanLine",
  },
  {
    id: "enumeration",
    label: "Service Enumeration",
    short: "Enumerate",
    objective: "For each open service, extract detailed information and attack surface.",
    teacher:
      "We know the doors. Now we inspect each one. Enumeration means systematically pulling detail out of every open service — versions, shares, endpoints, users.",
    icon: "ListTree",
  },
  {
    id: "vuln_analysis",
    label: "Vulnerability Analysis",
    short: "Vuln",
    objective: "Turn enumerated detail into concrete, testable weaknesses.",
    teacher:
      "Now we reason about weaknesses. A version number or a misconfiguration is a lead — not proof. We form hypotheses we can test safely.",
    icon: "Bug",
    emphasis: "caution",
  },
  {
    id: "validation",
    label: "Validation",
    short: "Validate",
    objective: "Safely confirm whether a suspected weakness is real.",
    teacher:
      "A scanner result or a version match is not a vulnerability. Before we claim anything, we validate — the least intrusive proof that the issue is genuine.",
    icon: "CircleCheck",
    emphasis: "caution",
  },
  {
    id: "exploitation",
    label: "Exploitation",
    short: "Exploit",
    objective: "Leverage a validated weakness to gain access — within scope.",
    teacher:
      "We have a validated weakness. Exploitation must be deliberate: check prerequisites, assess risk and noise, and prefer the safest path to proof.",
    icon: "Crosshair",
    emphasis: "danger",
  },
  {
    id: "initial_access",
    label: "Initial Access",
    short: "Access",
    objective: "Establish and stabilize your first foothold.",
    teacher:
      "You're in. Stop and breathe. Before doing anything else: who are you, what are your privileges, and what OS is this? Stabilize the foothold first.",
    icon: "DoorOpen",
    emphasis: "danger",
  },
  {
    id: "post_exploitation",
    label: "Post-Exploitation",
    short: "Post-Ex",
    objective: "Enumerate the host from the inside: users, network, processes, credentials.",
    teacher:
      "From inside the host, enumerate methodically. What can this user see and reach? Credentials, processes, network, and files all shape the next move.",
    icon: "Terminal",
    emphasis: "danger",
  },
  {
    id: "privilege_escalation",
    label: "Privilege Escalation",
    short: "PrivEsc",
    objective: "Find a path from your current privileges to higher ones.",
    teacher:
      "Now we look for a way up. On Linux: sudo, SUID, capabilities, cron, writable files. On Windows: privileges, services, tasks, credentials. Enumerate before you exploit.",
    icon: "TrendingUp",
    emphasis: "danger",
  },
  {
    id: "impact",
    label: "Impact Assessment",
    short: "Impact",
    objective: "Understand and document the real business impact — without causing harm.",
    teacher:
      "What does this access actually mean? Demonstrate impact conservatively and record it. The point is to prove risk, not to break things.",
    icon: "Activity",
    emphasis: "caution",
  },
  {
    id: "cleanup",
    label: "Cleanup",
    short: "Cleanup",
    objective: "Remove artifacts you introduced and restore the environment.",
    teacher:
      "Leave it as you found it. Track every file, account, key, and change you made so cleanup is complete and honest.",
    icon: "Eraser",
    emphasis: "safe",
  },
  {
    id: "reporting",
    label: "Reporting",
    short: "Report",
    objective: "Turn the assessment into a clear, professional, actionable report.",
    teacher:
      "The report is the deliverable. Findings, evidence, impact and remediation — written so a defender can actually fix things. Let's assemble it from what we recorded.",
    icon: "FileText",
    emphasis: "safe",
  },
];

export const PHASE_MAP: Record<PhaseId, PhaseMeta> = Object.fromEntries(
  PHASES.map((p) => [p.id, p])
) as Record<PhaseId, PhaseMeta>;

export function getPhase(id: PhaseId): PhaseMeta {
  return PHASE_MAP[id] ?? PHASES[0];
}

export function phaseIndex(id: PhaseId): number {
  return PHASES.findIndex((p) => p.id === id);
}

export function nextPhase(id: PhaseId): PhaseMeta | undefined {
  const i = phaseIndex(id);
  return i >= 0 ? PHASES[i + 1] : undefined;
}

export function prevPhase(id: PhaseId): PhaseMeta | undefined {
  const i = phaseIndex(id);
  return i > 0 ? PHASES[i - 1] : undefined;
}
