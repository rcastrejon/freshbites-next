"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { House, Icon } from "lucide-react";
import { appleCore } from "@lucide/lab";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
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
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
