import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  completedLessons: string[];
  completedLabs: string[];
  completedCommands: string[]; // command ids marked "done"
  lastVisited: { id: string; title: string; route: string; at: string }[];

  toggleLesson: (id: string) => void;
  toggleLab: (id: string) => void;
  markCommand: (id: string) => void;
  unmarkCommand: (id: string) => void;
  isLessonDone: (id: string) => boolean;
  isLabDone: (id: string) => boolean;
  isCommandDone: (id: string) => boolean;
  recordVisit: (v: { id: string; title: string; route: string }) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      completedLabs: [],
      completedCommands: [],
      lastVisited: [],

      toggleLesson: (id) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(id)
            ? s.completedLessons.filter((x) => x !== id)
            : [...s.completedLessons, id],
        })),
      toggleLab: (id) =>
        set((s) => ({
          completedLabs: s.completedLabs.includes(id)
            ? s.completedLabs.filter((x) => x !== id)
            : [...s.completedLabs, id],
        })),
      markCommand: (id) =>
        set((s) => ({
          completedCommands: s.completedCommands.includes(id)
            ? s.completedCommands
            : [...s.completedCommands, id],
        })),
      unmarkCommand: (id) =>
        set((s) => ({ completedCommands: s.completedCommands.filter((x) => x !== id) })),
      isLessonDone: (id) => get().completedLessons.includes(id),
      isLabDone: (id) => get().completedLabs.includes(id),
      isCommandDone: (id) => get().completedCommands.includes(id),
      recordVisit: (v) =>
        set((s) => {
          const next = [
            { ...v, at: new Date().toISOString() },
            ...s.lastVisited.filter((x) => x.id !== v.id),
          ].slice(0, 12);
          return { lastVisited: next };
        }),
      reset: () =>
        set({ completedLessons: [], completedLabs: [], completedCommands: [], lastVisited: [] }),
    }),
    { name: "pt.progress.v1" }
  )
);
