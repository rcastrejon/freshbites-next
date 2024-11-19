import { RecipeCard } from "../card";
import { z } from "zod";
import { Pagination } from "./pagination";
import { db } from "@/lib/db";
import { count, desc, inArray } from "drizzle-orm";
import { recipeTable } from "@/lib/db/schema";
import { queryVectors } from "@/lib/server/vectors";
import { Suspense } from "react";

const getRecipes = async (page: number) => {
  const PAGE_SIZE = 8;

  const offset = (page - 1) * PAGE_SIZE;

  const [[countResult], recipes] = await db.batch([
    db.select({ count: count() }).from(recipeTable),
    db.query.recipeTable.findMany({
      with: {
        author: true,
      },
      orderBy: desc(recipeTable.createdAt),
      limit: PAGE_SIZE,
      offset: offset,
    }),
  ]);
  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    recipes: recipes,
    pagination: {
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

const searchRecipes = async (q: string) => {
  const matchingVectors = await queryVectors(q);
  const scoreMap = Object.fromEntries(
    matchingVectors
      .filter((vector) => vector.score > 0.72)
      .map((vector) => [vector.id as string, vector.score]),
  );
  const ids = Object.keys(scoreMap);
  const recipes = await db.query.recipeTable.findMany({
    with: {
      author: true,
    },
    where: inArray(recipeTable.id, ids),
  });
  recipes.sort((a, b) => (scoreMap[b.id] ?? 0) - (scoreMap[a.id] ?? 0));
  return {
    recipes,
  };
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function Recipes(props: { searchParams: SearchParams }) {
  const searchParams = props.searchParams.then((p) => ({
    page: p.page as string | undefined,
    q: p.q as string | undefined,
  }));
  return (
    <div>
      <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
        Recetas
      </h3>
      <CardGrid searchParams={searchParams} />
    </div>
  );
}

const searchSchema = z.union([
  z.object({
    q: z.string().min(1),
  }),
  z.object({
    page: z
      .string()
      .optional()
      .refine((v) => {
        if (v === undefined) return true;
        const num = parseInt(v);
        return !isNaN(num) && num > 0;
      })
      .transform((v) => (v !== undefined ? parseInt(v) : undefined)),
  }),
]);

async function CardGrid(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page, q } = await props.searchParams;
  const parsedSearch = searchSchema.parse({
    page,
    q,
  });

  if ("q" in parsedSearch) {
    const { recipes } = await searchRecipes(parsedSearch.q);

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    );
  }

  const { recipes, pagination } = await getRecipes(parsedSearch.page ?? 1);

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
