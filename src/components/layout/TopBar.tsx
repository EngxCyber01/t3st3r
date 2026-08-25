import { useNavigate } from "react-router-dom";
import { Menu, Search, Compass, LifeBuoy, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui";
import { useUI } from "@/store/ui";
import { useSettings } from "@/store/settings";

export function TopBar() {
  const navigate = useNavigate();
  const setMobileNav = useUI((s) => s.setMobileNav);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const setFoundOpen = useUI((s) => s.setFoundOpen);
  const setStuckOpen = useUI((s) => s.setStuckOpen);
  const theme = useSettings((s) => s.theme);
  const toggleTheme = useSettings((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-base/80 px-3 backdrop-blur-md sm:px-5">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileNav(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface/60 px-3 text-left text-[13px] text-subtle transition-colors hover:border-line-strong hover:text-muted sm:max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search commands, services, lessons…</span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="kbd">Ctrl</span>
          <span className="kbd">K</span>
        </span>
      </button>

      <div className="flex-1 lg:hidden" />

      {/* Global helpers (spec §20, §38) */}
      <Button
        variant="subtle"
        size="sm"
        className="hidden sm:inline-flex"
        leftIcon={<Compass className="h-4 w-4" />}
        onClick={() => setFoundOpen(true)}
      >
        I found something
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        leftIcon={<LifeBuoy className="h-4 w-4" />}
        onClick={() => setStuckOpen(true)}
      >
        <span className="hidden sm:inline">I'm stuck</span>
        <span className="sm:hidden">Stuck</span>
      </Button>

      {/* Mobile-only found button as icon */}
      <button
        onClick={() => setFoundOpen(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg sm:hidden"
        aria-label="I found something"
      >
        <Compass className="h-5 w-5" />
      </button>

      <button
        onClick={toggleTheme}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>
    </header>
  );
}
