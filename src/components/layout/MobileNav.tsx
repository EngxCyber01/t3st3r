import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldHalf, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { NAV_GROUPS } from "./nav";
import { useUI } from "@/store/ui";

export function MobileNav() {
  const open = useUI((s) => s.mobileNavOpen);
  const setOpen = useUI((s) => s.setMobileNav);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col border-r border-line bg-surface"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <ShieldHalf className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-fg">T3st3r</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-raised hover:text-fg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="rule mx-3" />
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-4">
                  <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-subtle">
                    {group.label}
                  </div>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary/12 text-primary"
                                : "text-muted hover:bg-raised hover:text-fg"
                            )
                          }
                        >
                          <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
