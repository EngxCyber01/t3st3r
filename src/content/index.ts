import type { GotoRef } from "@/types";

export * from "./phases";
export * from "./phaseGuide";
export * from "./playbook";
export * from "./ports";
export * from "./glossary";
export * from "./reference";
export * from "./checklists";
export * from "./labs";
export * from "./decisionTree";
export * from "./searchIndex";
export { SERVICE_MODULES, SERVICE_MAP, getServiceModule, serviceModuleForPort } from "./services";
export {
  LESSONS,
  LESSON_MAP,
  getLesson,
  LESSON_CATEGORIES,
  CATEGORY_MAP,
  lessonsByCategory,
} from "./lessons";

/**
 * Resolve a content reference (Branch/DecisionOption goto) to a route and a label.
 * This is how the decision engine turns structured links into navigation.
 * `svc-<x>` lesson ids and service ids both resolve to the service module page.
 */
export function resolveGoto(
  goto: GotoRef | undefined,
  ctx?: { assessmentId?: string }
): { route: string; label: string } {
  const a = ctx?.assessmentId;
  if (!goto) return { route: "/", label: "Open" };
  switch (goto.type) {
    case "service":
      return { route: `/services/${goto.id}`, label: "Open service module" };
    case "lesson": {
      // svc-* shorthand → service module
      if (goto.id.startsWith("svc-")) {
        return { route: `/services/${goto.id.slice(4)}`, label: "Open service module" };
      }
      return { route: `/learn/${goto.id}`, label: "Open lesson" };
    }
    case "phase":
      return {
        route: a ? `/a/${a}?phase=${goto.id}` : "/flow",
        label: "Go to phase",
      };
    case "node":
      return { route: `/flow?node=${goto.id}`, label: "Open decision" };
    case "route": {
      // A route template needing :id but with no active assessment → dashboard.
      if (goto.id.includes(":id")) {
        return a ? { route: goto.id.replace(":id", a), label: "Open" } : { route: "/", label: "Open" };
      }
      return { route: goto.id, label: "Open" };
    }
    default:
      return { route: "/", label: "Open" };
  }
}
