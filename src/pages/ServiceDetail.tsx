import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, EmptyState } from "@/components/ui";
import { ServiceModuleView } from "@/components/teacher/ServiceModuleView";
import { getServiceModule } from "@/content/services";
import { useActiveVars } from "@/hooks/useActiveVars";
import { useProgress } from "@/store/progress";

export function ServiceDetail() {
  const { id } = useParams();
  const module = id ? getServiceModule(id) : undefined;
  const { vars, assessmentId } = useActiveVars();
  const recordVisit = useProgress((s) => s.recordVisit);

  useEffect(() => {
    if (module) recordVisit({ id: `svc:${module.id}`, title: `${module.name} module`, route: `/services/${module.id}` });
  }, [module, recordVisit]);

  if (!module) {
    return (
      <Page>
        <EmptyState
          title="Service module not found"
          description="Browse all service modules instead."
          action={
            <Link to="/services">
              <Button variant="primary">All services</Button>
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <Link to="/services" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All services
      </Link>
      <ServiceModuleView module={module} vars={vars} assessmentId={assessmentId} />
    </Page>
  );
}
