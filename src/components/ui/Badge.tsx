import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { RiskLevel, Difficulty, Severity } from "@/types";

type Tone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "caution"
  | "elevated"
  | "critical"
  | "teacher";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-raised text-muted border-line",
  primary: "bg-primary/12 text-primary border-primary/25",
  info: "bg-info/12 text-info border-info/25",
  success: "bg-success/12 text-success border-success/25",
  caution: "bg-caution/12 text-caution border-caution/25",
  elevated: "bg-elevated/12 text-elevated border-elevated/25",
  critical: "bg-critical/12 text-critical border-critical/25",
  teacher: "bg-teacher/12 text-teacher border-teacher/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------- Risk badge (spec §4) ---------- */

const riskTone: Record<RiskLevel, Tone> = {
  low: "success",
  medium: "caution",
  high: "elevated",
  critical: "critical",
};
const riskDot: Record<RiskLevel, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🟠",
  critical: "🔴",
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <Badge tone={riskTone[risk]} className={cn("uppercase tracking-wide", className)}>
      <span aria-hidden className="text-[9px]">
        {riskDot[risk]}
      </span>
      {risk}
    </Badge>
  );
}

/* ---------- Difficulty badge ---------- */

const diffTone: Record<Difficulty, Tone> = {
  beginner: "success",
  easy: "info",
  intermediate: "caution",
  hard: "elevated",
  advanced: "critical",
};

export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <Badge tone={diffTone[level]} className={cn("capitalize", className)}>
      {level}
    </Badge>
  );
}

/* ---------- Severity badge (findings) ---------- */

const sevTone: Record<Severity, Tone> = {
  info: "info",
  low: "success",
  medium: "caution",
  high: "elevated",
  critical: "critical",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <Badge tone={sevTone[severity]} className={cn("uppercase tracking-wide", className)}>
      {severity}
    </Badge>
  );
}
