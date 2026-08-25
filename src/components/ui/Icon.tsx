import { icons, type LucideProps, CircleHelp } from "lucide-react";

/**
 * Map of deprecated lucide names → canonical names, so content authored with
 * either spelling resolves. Lucide's `icons` map only holds canonical names.
 */
const ALIASES: Record<string, string> = {
  CheckCircle2: "CircleCheck",
  HelpCircle: "CircleHelp",
  XCircle: "CircleX",
  AlertTriangle: "TriangleAlert",
  AlertCircle: "CircleAlert",
};

/**
 * Resolve a Lucide icon by its PascalCase name (used throughout content data
 * so modules can specify icons declaratively). Falls back to a help glyph so a
 * bad name never breaks the UI.
 */
export function Icon({ name, ...props }: { name?: string } & LucideProps) {
  if (!name) return <CircleHelp {...props} />;
  const registry = icons as Record<string, React.ComponentType<LucideProps>>;
  const Cmp = registry[name] ?? registry[ALIASES[name] ?? ""];
  return Cmp ? <Cmp {...props} /> : <CircleHelp {...props} />;
}
