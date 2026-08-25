import { LESSONS, LESSON_CATEGORIES } from "@/content/lessons";

export interface SkillProgress {
  skill: string;
  categoryId: string;
  icon: string;
  total: number;
  done: number;
  percent: number;
}

/**
 * Compute the skill matrix (spec §85) from completed lessons.
 * Skills are grouped by lesson category's `skill` label.
 */
export function computeSkills(completedLessons: string[]): SkillProgress[] {
  const doneSet = new Set(completedLessons);
  const bySkill: Record<string, { total: number; done: number; categoryId: string; icon: string }> = {};

  for (const cat of LESSON_CATEGORIES) {
    const lessons = LESSONS.filter((l) => l.category === cat.id);
    const key = cat.skill;
    if (!bySkill[key]) bySkill[key] = { total: 0, done: 0, categoryId: cat.id, icon: cat.icon };
    bySkill[key].total += lessons.length;
    bySkill[key].done += lessons.filter((l) => doneSet.has(l.id)).length;
  }

  return Object.entries(bySkill)
    .map(([skill, v]) => ({
      skill,
      categoryId: v.categoryId,
      icon: v.icon,
      total: v.total,
      done: v.done,
      percent: v.total ? Math.round((v.done / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent || a.skill.localeCompare(b.skill));
}

export function overallLessonProgress(completedLessons: string[]): number {
  if (!LESSONS.length) return 0;
  const done = LESSONS.filter((l) => completedLessons.includes(l.id)).length;
  return Math.round((done / LESSONS.length) * 100);
}
