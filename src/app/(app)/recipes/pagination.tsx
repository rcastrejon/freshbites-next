"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function Pagination({
  page,
  hasPreviousPage,
  hasNextPage,
}: {
  page: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function createPageURL(pageNumber: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="grid grid-cols-2 pt-3">
      <div className="col-start-1 justify-self-start">
        {hasPreviousPage && (
          <Button variant="link" asChild>
            <Link href={createPageURL(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Link>
          </Button>
        )}
      </div>
      <div className="col-start-2 justify-self-end">
        {hasNextPage && (
          <Button variant="link" asChild>
            <Link href={createPageURL(page + 1)}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
