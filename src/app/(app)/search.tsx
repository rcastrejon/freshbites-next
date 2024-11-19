"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export function SearchInput() {
  const searchParams = useSearchParams();

  return (
    <Form action="/recipes" className="relative">
      <Input
        key={searchParams.get("q")}
        name="q"
        className="peer pe-9 md:h-8"
        placeholder="Buscar recetas..."
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        autoComplete="off"
      />
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
        <Search size={16} strokeWidth={2} aria-hidden="true" />
      </div>
    </Form>
  );
}
