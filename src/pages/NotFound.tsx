import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Button, EmptyState } from "@/components/ui";

export function NotFound() {
  return (
    <Page>
      <div className="grid min-h-[60vh] place-items-center">
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="Page not found"
          description="This route doesn't exist. Head back to the dashboard or start a new assessment."
          action={
            <Link to="/">
              <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
                Back to dashboard
              </Button>
            </Link>
          }
        />
      </div>
    </Page>
  );
}
