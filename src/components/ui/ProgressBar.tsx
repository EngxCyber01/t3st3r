import { cn } from "@/lib/cn";
import { clamp } from "@/lib/utils";

type Tone = "primary" | "info" | "success" | "teacher" | "caution";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary",
  info: "bg-info",
  success: "bg-success",
  teacher: "bg-teacher",
  caution: "bg-caution",
};

export function ProgressBar({
  value,
  tone = "primary",
  className,
  showLabel,
  size = "md",
}: {
  value: number; // 0-100
  tone?: Tone;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const v = clamp(Math.round(value), 0, 100);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-line/60",
          size === "sm" ? "h-1.5" : "h-2"
        )}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            toneClass[tone]
          )}
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
          {v}%
        </span>
      )}
    </div>
  );
}
