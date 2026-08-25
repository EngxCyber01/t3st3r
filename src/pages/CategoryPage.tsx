import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/Page";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { LessonCard } from "@/components/teacher/LessonCard";
import { CATEGORY_MAP, lessonsByCategory } from "@/content/lessons";
import { SERVICE_MODULES } from "@/content/services";

/** Related service modules per category (for quick jumps). */
const relatedServices: Record<string, string[]> = {
  web: ["http"],
  linux: ["ssh", "ftp"],
  windows: ["smb", "rdp", "winrm"],
  ad: ["smb", "ldap"],
};

export function CategoryPage({ categoryId }: { categoryId: string }) {
  const cat = CATEGORY_MAP[categoryId];
  const lessons = lessonsByCategory(categoryId);
  const services = (relatedServices[categoryId] ?? [])
    .map((id) => SERVICE_MODULES.find((m) => m.id === id))
    .filter(Boolean) as typeof SERVICE_MODULES;

  if (!cat) {
    return (
      <Page>
        <EmptyState title="Category not found" description="Try the Learn page." />
      </Page>
    );
  }

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Module"
        title={cat.label}
        description={cat.description}
        icon={<Icon name={cat.icon} className="h-5 w-5" />}
      />

      {services.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-subtle">
            Related service workflows
          </h2>
          <div className="flex flex-wrap gap-2">
            {services.map((m) => (
              <Link
                key={m.id}
                to={`/services/${m.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-primary/40 hover:text-fg"
              >
                {m.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {lessons.length === 0 ? (
        <EmptyState title="No lessons yet" description="Content for this module is coming." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => (
            <LessonCard key={l.id} lesson={l} />
          ))}
        </div>
      )}
    </Page>
  );
}
