import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Icon } from "lucide-react";
import { appleCore } from "@lucide/lab";

export default function ApplicationShell({
  children,
}: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-2 md:p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Header() {
  return (
    <header className="border-b-2 bg-white p-2 shadow-sm md:px-4">
      <div className="h-8">
        <div className="inline-flex items-center gap-2 md:hidden">
          <SidebarTrigger />
          <h2 className="font-serif text-2xl font-bold">
            FreshB
            <Icon iconNode={appleCore} className="mb-1.5 inline h-5 w-5" />
            tes
          </h2>
        </div>
      </div>
    </header>
  );
}
