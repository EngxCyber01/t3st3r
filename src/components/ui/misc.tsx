import type { HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/* ---------- Chip / Tag ---------- */
export function Chip({
  children,
  className,
  onClick,
  active,
  onRemove,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  onRemove?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11.5px] font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/12 text-primary"
          : "border-line bg-raised text-muted",
        onClick && "hover:border-line-strong hover:text-fg",
        className
      )}
    >
      {children}
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 cursor-pointer text-subtle hover:text-critical"
        >
          ×
        </span>
      )}
    </Comp>
  );
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-primary">{icon}</span>}
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-raised text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Text input ---------- */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-line bg-base/60 px-3.5 text-sm text-fg placeholder:text-subtle transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

/* ---------- Textarea ---------- */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-line bg-base/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-subtle transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

/* ---------- Field label ---------- */
export function Field({
  label,
  hint,
  children,
  required,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-fg">
          {label}
          {required && <span className="ml-0.5 text-critical">*</span>}
        </span>
        {hint && <span className="text-[12px] text-subtle">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-raised/70",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
        className
      )}
    />
  );
}

/* ---------- Spinner ---------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary",
        className
      )}
    />
  );
}

/* ---------- Divider ---------- */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("rule my-4", className)} />;
}

/* ---------- Stat pill ---------- */
export function Stat({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "primary" | "success" | "critical" | "info";
}) {
  const toneText: Record<string, string> = {
    neutral: "text-fg",
    primary: "text-primary",
    success: "text-success",
    critical: "text-critical",
    info: "text-info",
  };
  return (
    <div className="rounded-xl border border-line bg-surface/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[12px] text-muted">
        {icon}
        {label}
      </div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", toneText[tone])}>{value}</div>
    </div>
  );
}
