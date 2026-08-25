import type { ReactNode } from "react";
import { AlertTriangle, GraduationCap, Info, Lightbulb, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warning" | "success" | "teacher" | "tip";

const config: Record<
  Tone,
  { border: string; bg: string; text: string; icon: ReactNode }
> = {
  info: {
    border: "border-info/30",
    bg: "bg-info/5",
    text: "text-info",
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    border: "border-elevated/30",
    bg: "bg-elevated/5",
    text: "text-elevated",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  success: {
    border: "border-success/30",
    bg: "bg-success/5",
    text: "text-success",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  teacher: {
    border: "border-teacher/30",
    bg: "bg-teacher/5",
    text: "text-teacher",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  tip: {
    border: "border-primary/30",
    bg: "bg-primary/5",
    text: "text-primary",
    icon: <Lightbulb className="h-4 w-4" />,
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
  icon,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  const c = config[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-3", c.border, c.bg, className)}>
      <div className="flex gap-3">
        <div className={cn("mt-0.5 shrink-0", c.text)}>{icon ?? c.icon}</div>
        <div className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-fg/90">
          {title && <div className={cn("mb-1 font-semibold", c.text)}>{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}
