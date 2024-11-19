import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Icon } from "lucide-react";
import { appleCore } from "@lucide/lab";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { NewRecipeModal } from "./new-recipe";

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
      <div className="grid h-8 grid-cols-[max-content,_1fr] gap-2">
        <div className="inline-flex items-center gap-2 md:hidden">
          <SidebarTrigger />
          <h2 className="font-serif text-2xl font-bold">
            FreshB
            <Icon iconNode={appleCore} className="mb-1.5 inline h-5 w-5" />
            tes
          </h2>
        </div>
        <div className="col-start-2 inline-flex items-center gap-2 justify-self-end">
          <SignedIn>
            <NewRecipeModal />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Button size="sm" asChild>
              <SignInButton>Iniciar sesión</SignInButton>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
