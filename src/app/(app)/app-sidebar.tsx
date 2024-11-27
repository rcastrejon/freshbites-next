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
import { Book, Heart, House, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchInput } from "./search";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Protect } from "@clerk/nextjs";

const NavPinned = dynamic(() => import("./nav-pinned"), { ssr: false });

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <div className="flex h-8 items-center">
              <h2 className="font-serif text-xl font-bold">
                Recetario Foráneo
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
        <NavPinned />
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
            <SidebarMenuButton
              isActive={
                pathname.includes("/recipes") &&
                !pathname.includes("/recipes/liked")
              }
              asChild
            >
              <Link href="/recipes">
                <Book />
                Recetas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.includes("/recipes/liked")}
              asChild
            >
              <Link href="/recipes/liked">
                <Heart />
                Favoritas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Protect
            condition={(has) =>
              has({ role: "org:member" }) || has({ role: "org:admin" })
            }
          >
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname.includes("/admin")} asChild>
                <Link href="/admin">
                  <Shield />
                  Admin
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Protect>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
