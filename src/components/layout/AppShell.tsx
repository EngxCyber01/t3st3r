import { useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TargetBar } from "./TargetBar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/global/CommandPalette";
import { IFoundSomething } from "@/components/global/IFoundSomething";
import { ImStuck } from "@/components/global/ImStuck";
import { Spinner } from "@/components/ui";
import { useUI } from "@/store/ui";

export function AppShell() {
  const location = useLocation();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const closeAllOverlays = useUI((s) => s.closeAllOverlays);

  // Global keyboard shortcut: Ctrl/Cmd + K opens search (spec §24)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  // Close transient overlays on route change
  useEffect(() => {
    closeAllOverlays();
    window.scrollTo({ top: 0 });
  }, [location.pathname, closeAllOverlays]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <TargetBar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="grid min-h-[60vh] place-items-center">
                <Spinner className="h-6 w-6" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <IFoundSomething />
      <ImStuck />
    </div>
  );
}
