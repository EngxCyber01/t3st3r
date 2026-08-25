import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import { categorizeCommand } from "@/content/categorize";
import type { RiskLevel } from "@/types";

/** A command the user added themselves. */
export interface UserCommand {
  id: string;
  command: string;
  note?: string;
  /** Category id (auto-detected, or overridden by the user). */
  category: string;
  /** Was the category auto-detected (vs chosen by the user)? */
  autoCategory: boolean;
  risk?: RiskLevel;
  createdAt: string;
}

interface State {
  commands: UserCommand[];
  add: (input: { command: string; note?: string; category?: string; risk?: RiskLevel }) => string;
  update: (id: string, patch: Partial<UserCommand>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useUserCommands = create<State>()(
  persist(
    (set) => ({
      commands: [],
      add: ({ command, note, category, risk }) => {
        const id = uid("ucmd");
        const detected = categorizeCommand(command);
        const cmd: UserCommand = {
          id,
          command: command.trim(),
          note: note?.trim() || undefined,
          category: category || detected.id,
          autoCategory: !category,
          risk: risk ?? "low",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ commands: [cmd, ...s.commands] }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({ commands: s.commands.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      remove: (id) => set((s) => ({ commands: s.commands.filter((c) => c.id !== id) })),
      clear: () => set({ commands: [] }),
    }),
    { name: "pt.userCommands.v1" }
  )
);
