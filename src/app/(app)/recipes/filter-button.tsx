"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

export function FilterButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "recent";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={sort === "recent"}
          onCheckedChange={() => router.push("/recipes?sort=recent")}
        >
          Fecha de publicación
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sort === "views"}
          onCheckedChange={() => router.push("/recipes?sort=views")}
        >
          Visitas
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sort === "likes"}
          onCheckedChange={() => router.push("/recipes?sort=likes")}
        >
          Favoritos
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
