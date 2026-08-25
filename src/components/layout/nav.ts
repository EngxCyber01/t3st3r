/** Global navigation structure (spec §9). */
export interface NavItem {
  label: string;
  to: string;
  icon: string; // lucide icon name
  end?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", to: "/", icon: "LayoutDashboard", end: true },
      { label: "New Assessment", to: "/new", icon: "Plus" },
      { label: "Pentest Flow", to: "/flow", icon: "Workflow" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Learn", to: "/learn", icon: "GraduationCap" },
      { label: "Labs", to: "/labs", icon: "FlaskConical" },
      { label: "Quick Reference", to: "/reference", icon: "BookMarked" },
      { label: "My Commands", to: "/my-commands", icon: "TerminalSquare" },
      { label: "Glossary", to: "/glossary", icon: "BookA" },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Services", to: "/services", icon: "Server" },
      { label: "Web Security", to: "/web", icon: "Globe" },
      { label: "Linux", to: "/linux", icon: "Terminal" },
      { label: "Windows", to: "/windows", icon: "MonitorCog" },
      { label: "Active Directory", to: "/ad", icon: "Network" },
      { label: "Port Lookup", to: "/ports", icon: "Search" },
    ],
  },
  {
    label: "Assessment Data",
    items: [
      { label: "Progress", to: "/progress", icon: "TrendingUp" },
      { label: "Settings", to: "/settings", icon: "Settings" },
    ],
  },
];

/** Flattened list for search/breadcrumb lookups. */
export const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
