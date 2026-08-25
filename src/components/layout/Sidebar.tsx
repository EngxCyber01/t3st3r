import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeft, ShieldHalf } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Tooltip } from "@/components/ui";
import { NAV_GROUPS } from "./nav";
import { useUI } from "@/store/ui";

export function Sidebar() {
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggle = useUI((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface/60 backdrop-blur-sm transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary shadow-glow">
          <ShieldHalf className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-fg">
              T3st3r
            </div>
            <div className="truncate text-[11px] text-subtle">Guided · authorized labs</div>
          </div>
        )}
      </div>

      <div className="rule mx-3" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-subtle">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                        isActive
                          ? "bg-primary/12 text-primary"
                          : "text-muted hover:bg-raised hover:text-fg",
                        collapsed && "justify-center px-0"
                      )
                    }
                  >
                    {({ isActive }) =>
                      collapsed ? (
                        <Tooltip content={item.label} side="bottom">
                          <Icon
                            name={item.icon}
                            className={cn("h-[18px] w-[18px]", isActive && "text-primary")}
                          />
                        </Tooltip>
                      ) : (
                        <>
                          <Icon
                            name={item.icon}
                            className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              isActive ? "text-primary" : "text-subtle group-hover:text-fg"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )
                    }
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="rule mx-3" />

      {/* Collapse toggle */}
      <div className="p-3">
        <button
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-raised hover:text-fg",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
