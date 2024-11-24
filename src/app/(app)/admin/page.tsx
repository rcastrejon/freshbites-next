/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { recipeTable } from "@/lib/db/schema";
import { count, desc, isNull } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { intlFormat } from "date-fns";
import Link from "next/link";
import { VerifyModal } from "./verify-modal";
import { DeleteRecipeModal } from "./delete-recipe";

async function getMetrics() {
  const [[unverifiedCount], [totalCount]] = await db.batch([
    db
      .select({ count: count() })
      .from(recipeTable)
      .where(isNull(recipeTable.verifiedAt)),
    db.select({ count: count() }).from(recipeTable),
  ]);

  if (!unverifiedCount || !totalCount) {
    throw new Error("Failed to fetch metrics");
  }

  return {
    unverified: unverifiedCount.count,
    total: totalCount.count,
  };
}

async function getUnverifiedRecipes() {
  return db.query.recipeTable.findMany({
    with: {
      author: true,
    },
    where: isNull(recipeTable.verifiedAt),
    limit: 3,
    orderBy: desc(recipeTable.createdAt),
  });
}

export default async function AdminDashboard() {
  const metrics = await getMetrics();
  const unverifiedRecipes = await getUnverifiedRecipes();
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
          Panel de Administración
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recetas sin verificar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.unverified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total de recetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">
                  Recetas sin verificar
                </TableHead>
                <TableHead className="w-[200px]">Autor</TableHead>
                <TableHead className="w-[200px]">Fecha</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unverifiedRecipes.map((recipe) => (
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
                    {intlFormat(recipe.createdAt, {
                      locale: "es-MX",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <VerifyModal recipeId={recipe.id} />
                      <DeleteRecipeModal recipeId={recipe.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 flex justify-end">
          <Button variant="link" size="sm" asChild>
            <Link href="/admin/unverified">
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
