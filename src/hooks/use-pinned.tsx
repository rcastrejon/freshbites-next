import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type LocalStorageRecipe = {
  id: string;
  title: string;
  pinnedAt: number;
};

export type PinnedState = {
  recipes: Record<string, LocalStorageRecipe>;
  togglePinned: (recipe: LocalStorageRecipe) => void;
  isPinned: (id: string) => boolean;
};

export const usePinnedStore = create<PinnedState>()(
  persist(
    (set, get) => ({
      recipes: {},
      togglePinned: (recipe) =>
        set((state) => {
          const next = { ...state.recipes };
          if (next[recipe.id]) {
            delete next[recipe.id];
          } else {
            next[recipe.id] = recipe;
          }
          return { recipes: next };
        }),
      isPinned: (id) => !!get().recipes[id],
    }),
    {
      name: "pinnedRecipes",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
