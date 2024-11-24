import { db } from "@/lib/db";
import { likeTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { RecipeCard } from "../../card";
import { Suspense } from "react";
import { Pagination } from "../pagination";

const getRecipes = async (page: number) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const PAGE_SIZE = 8;
  const offset = (page - 1) * PAGE_SIZE;

  const result = await db.query.likeTable.findMany({
    with: {
      recipe: {
        with: {
          author: true,
        },
      },
    },
    where: eq(likeTable.userId, userId),
    orderBy: desc(likeTable.createdAt),
    limit: PAGE_SIZE,
    offset,
  });
  const totalCount = await db.$count(likeTable, eq(likeTable.userId, userId));
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    recipes: result.map((r) => r.recipe),
    pagination: {
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LikedRecipes(props: {
  searchParams: SearchParams;
}) {
  const searchParams = props.searchParams.then((p) => ({
    page: p.page as string | undefined,
  }));
  return (
    <div>
      <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
        Tus recetas favoritas
      </h3>
      <CardGrid searchParams={searchParams} />
    </div>
  );
}

const searchSchema = z.object({
  page: z
    .string()
    .optional()
    .refine((v) => {
      if (v === undefined) return true;
      const num = parseInt(v);
      return !isNaN(num) && num > 0;
    })
    .transform((v) => (v !== undefined ? parseInt(v) : undefined)),
});

async function CardGrid(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page } = await props.searchParams;
  const parsedSearch = searchSchema.parse({ page });

  const { recipes, pagination } = await getRecipes(parsedSearch.page ?? 1);

  if (recipes.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <Suspense>
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          page={parsedSearch.page ?? 1}
        />
      </Suspense>
    </>
  );
}

function NoResultsFound() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-md border border-input bg-background p-8 text-center">
      <p className="font-serif text-lg font-bold text-foreground">
        No se encontraron recetas
      </p>
      <p className="text-sm text-muted-foreground">
        Aún no has marcado ninguna receta como favorita
      </p>
    </div>
  );
}
