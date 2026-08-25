import type { Lesson } from "@/types";
import { foundationLessons } from "./foundations";
import { reconLessons } from "./recon";
import { scanningLessons } from "./scanning";
import { webLessons } from "./web";
import { webVulnLessons } from "./web-vulns";
import { linuxLessons } from "./linux";
import { windowsLessons } from "./windows";
import { postLessons } from "./post";
import { credsLessons } from "./creds";
import { adLessons } from "./ad";
import { exploitationLessons } from "./exploitation";
import { reportingLessons } from "./reporting";

export const LESSONS: Lesson[] = [
  ...foundationLessons,
  ...reconLessons,
  ...scanningLessons,
  ...webLessons,
  ...webVulnLessons,
  ...linuxLessons,
  ...windowsLessons,
  ...postLessons,
  ...credsLessons,
  ...adLessons,
  ...exploitationLessons,
  ...reportingLessons,
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);

export function getLesson(id: string): Lesson | undefined {
  return LESSON_MAP[id];
}

export interface LessonCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Skill-matrix key (spec §85). */
  skill: string;
}

export const LESSON_CATEGORIES: LessonCategory[] = [
  { id: "foundations", label: "Foundations", icon: "Compass", description: "How pentesting works and where to begin.", skill: "Foundations" },
  { id: "recon", label: "Reconnaissance", icon: "Radar", description: "Map the target before you touch it.", skill: "Recon" },
  { id: "scanning", label: "Scanning", icon: "ScanLine", description: "Find the doors with Nmap and read the result.", skill: "Networking" },
  { id: "web", label: "Web Security", icon: "Globe", description: "Enumerate and test web applications.", skill: "Web Security" },
  { id: "linux", label: "Linux", icon: "Terminal", description: "Enumerate and escalate on Linux hosts.", skill: "Linux PrivEsc" },
  { id: "windows", label: "Windows", icon: "MonitorCog", description: "Enumerate and escalate on Windows hosts.", skill: "Windows PrivEsc" },
  { id: "ad", label: "Active Directory", icon: "Network", description: "Enumerate domains and find attack paths.", skill: "Active Directory" },
  { id: "creds", label: "Credentials", icon: "KeyRound", description: "Find, reuse, and crack credentials.", skill: "Enumeration" },
  { id: "post", label: "Post-Exploitation", icon: "Terminal", description: "What to do the moment you get a shell.", skill: "Enumeration" },
  { id: "exploitation", label: "Exploitation", icon: "Crosshair", description: "Validate and leverage weaknesses safely.", skill: "Enumeration" },
  { id: "reporting", label: "Reporting", icon: "FileText", description: "Turn the work into a professional report.", skill: "Reporting" },
];

export const CATEGORY_MAP: Record<string, LessonCategory> = Object.fromEntries(
  LESSON_CATEGORIES.map((c) => [c.id, c])
);

export function lessonsByCategory(categoryId: string): Lesson[] {
  return LESSONS.filter((l) => l.category === categoryId);
}
