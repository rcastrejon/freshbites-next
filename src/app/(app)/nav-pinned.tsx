"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePinnedStore } from "@/hooks/use-pinned";
import Link from "next/link";

export default function NavPinned() {
  const savedRecipes = usePinnedStore((state) => state.recipes);
  const recipes = Object.values(savedRecipes).sort(
    (a, b) => b.pinnedAt - a.pinnedAt,
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recetas ancladas</SidebarGroupLabel>
      <SidebarMenu>
        {recipes.map((recipe) => (
          <SidebarMenuItem key={recipe.id}>
            <SidebarMenuButton asChild>
              <Link href={`/recipes/${recipe.id}`}>
                <span>{recipe.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
