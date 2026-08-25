import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  foundOpen: boolean;
  stuckOpen: boolean;

  toggleSidebar: () => void;
  setMobileNav: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setFoundOpen: (v: boolean) => void;
  setStuckOpen: (v: boolean) => void;
  closeAllOverlays: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      searchOpen: false,
      foundOpen: false,
      stuckOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setFoundOpen: (foundOpen) => set({ foundOpen }),
      setStuckOpen: (stuckOpen) => set({ stuckOpen }),
      closeAllOverlays: () =>
        set({ searchOpen: false, foundOpen: false, stuckOpen: false, mobileNavOpen: false }),
    }),
    {
      name: "pt.ui.v1",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
