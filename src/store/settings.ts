import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface SettingsState {
  theme: Theme;
  reducedMotion: boolean;
  onboardingComplete: boolean;
  /** Preferred teaching depth. */
  verbosity: "concise" | "full";
  /** AI provider selection (spec §12). "off" = deterministic engine only. */
  aiProvider: "off" | "openai" | "anthropic" | "gemini" | "local";
  /** Stored locally only; never sent anywhere except the chosen provider. */
  aiKey: string;
  aiModel: string;

  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setReducedMotion: (v: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setVerbosity: (v: SettingsState["verbosity"]) => void;
  setAiProvider: (p: SettingsState["aiProvider"]) => void;
  setAiKey: (k: string) => void;
  setAiModel: (m: string) => void;
}

function applyTheme(theme: Theme, reducedMotion: boolean) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-reduced-motion", String(reducedMotion));
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      reducedMotion: false,
      onboardingComplete: false,
      verbosity: "full",
      aiProvider: "off",
      aiKey: "",
      aiModel: "",

      setTheme: (theme) => {
        applyTheme(theme, get().reducedMotion);
        set({ theme });
      },
      toggleTheme: () => {
        const theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(theme, get().reducedMotion);
        set({ theme });
      },
      setReducedMotion: (reducedMotion) => {
        applyTheme(get().theme, reducedMotion);
        set({ reducedMotion });
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ onboardingComplete: false }),
      setVerbosity: (verbosity) => set({ verbosity }),
      setAiProvider: (aiProvider) => set({ aiProvider }),
      setAiKey: (aiKey) => set({ aiKey }),
      setAiModel: (aiModel) => set({ aiModel }),
    }),
    {
      name: "pt.settings.v1",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme, state.reducedMotion);
      },
    }
  )
);
