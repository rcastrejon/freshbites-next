/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import { VerifyModal } from "../verify-modal";
import { db } from "@/lib/db";
import { isNull, desc } from "drizzle-orm";
import { recipeTable } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

async function getUnverifiedRecipes() {
  return db.query.recipeTable.findMany({
    with: {
      author: true,
    },
    where: isNull(recipeTable.verifiedAt),
    orderBy: desc(recipeTable.createdAt),
  });
}

export default async function Page() {
  const recipes = await getUnverifiedRecipes();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
          Recetas sin verificar
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Recetas</TableHead>
                <TableHead className="w-[200px]">Autor</TableHead>
                <TableHead className="w-[200px]">Fecha</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img
                        src={recipe.imageUrl}
                        alt=""
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <Button variant="link" className="px-0" asChild>
                        <Link href={`/recipes/${recipe.id}`}>
                          {recipe.title}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.author?.username ?? "[ELIMINADO]"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(recipe.createdAt, {
                      addSuffix: true,
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <VerifyModal recipeId={recipe.id} />
                      <Button variant="destructive" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
