import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
  layoutId = "tab-underline",
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              isActive ? "text-fg" : "text-muted hover:text-fg"
            )}
          >
            {it.icon}
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  isActive ? "bg-primary/15 text-primary" : "bg-raised text-subtle"
                )}
              >
                {it.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
