"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Book, House, Icon } from "lucide-react";
import { appleCore } from "@lucide/lab";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchInput } from "./search";
import { Suspense } from "react";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <div className="flex h-8 items-center">
              <h2 className="font-serif text-3xl font-bold md:text-2xl">
                FreshB
                <Icon
                  iconNode={appleCore}
                  className="mb-1.5 inline h-6 w-6 md:h-5 md:w-5"
                />
                tes
              </h2>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="grid">
            <Suspense>
              <SearchInput />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <NavLinks />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menú principal</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/"} asChild>
              <Link href="/">
                <House />
                Inicio
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname.includes("/recipes")} asChild>
              <Link href="/recipes">
                <Book />
                Recetas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
