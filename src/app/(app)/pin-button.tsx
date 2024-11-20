"use client";

import { usePinnedStore } from "@/hooks/use-pinned";
import type { Recipe } from "@/lib/db/types";
import { cn } from "@/lib/utils";

export default function PinButton({
  recipe,
  children,
  className,
  ...props
}: React.PropsWithChildren<{ recipe: Recipe; className?: string }>) {
  const togglePinned = usePinnedStore((state) => state.togglePinned);
  const isPinned = usePinnedStore((state) => state.isPinned(recipe.id));

  function handleClick() {
    const recipeToPin = {
      id: recipe.id,
      title: recipe.title,
      pinnedAt: Date.now(),
    };
    togglePinned(recipeToPin);
  }

  return (
    <button
      className={cn(
        "group data-[pinned=true]:bg-primary data-[pinned=true]:text-primary-foreground data-[pinned=true]:hover:bg-primary/90",
        className,
      )}
      onClick={handleClick}
      data-pinned={isPinned}
      {...props}
    >
      {children}
    </button>
  );
}

export function OnlyUnpinned({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center group-data-[pinned=true]:hidden">
      {children}
    </div>
  );
}

export function OnlyPinned({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden group-data-[pinned=true]:inline-flex group-data-[pinned=true]:items-center">
      {children}
    </div>
  );
}
