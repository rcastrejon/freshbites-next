import { RecipeCard } from "../card";
import { z } from "zod";
import { Pagination } from "./pagination";
import { db } from "@/lib/db";
import { count, eq, inArray, sql } from "drizzle-orm";
import { likeTable, recipeTable, userTable } from "@/lib/db/schema";
import { queryVectors } from "@/lib/server/vectors";
import { Suspense } from "react";
import { FilterButton } from "./filter-button";

const sortSchema = z.enum(["recent", "views", "likes"]).catch("recent");

function getSortExpression(sortBy: z.infer<typeof sortSchema>) {
  switch (sortBy) {
    case "views":
      return sql`${recipeTable.views} DESC, ${recipeTable.createdAt} DESC`;
    case "likes":
      return sql`likes_count DESC, ${recipeTable.createdAt} DESC`;
    case "recent":
    default:
      return sql`${recipeTable.createdAt} DESC`;
  }
}

const getRecipes = async (page: number, sort: z.infer<typeof sortSchema>) => {
  const PAGE_SIZE = 8;

  const offset = (page - 1) * PAGE_SIZE;

  const totalCount = await db.$count(recipeTable);

  const results = await db
    .select({
      recipes: recipeTable,
      author: userTable,
      likesCount: count(likeTable.userId).as("likes_count"),
    })
    .from(recipeTable)
    .leftJoin(userTable, eq(recipeTable.authorId, userTable.id))
    .leftJoin(likeTable, eq(recipeTable.id, likeTable.recipeId))
    .groupBy(recipeTable.id, userTable.id)
    .orderBy(getSortExpression(sort))
    .limit(PAGE_SIZE)
    .offset(offset);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    recipes: results.map((r) => Object.assign(r.recipes, { author: r.author })),
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
    sort: p.sort as string | undefined,
  }));
  return (
    <div>
      <div className="mb-3 flex justify-between border-b-2 border-b-foreground pb-1">
        <h3 className="font-serif text-2xl font-bold">Recetas</h3>
        <FilterButton />
      </div>
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
    sort: sortSchema,
  }),
]);

async function CardGrid(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { page, q, sort } = await props.searchParams;
  const parsedSearch = searchSchema.parse({
    page,
    q,
    sort,
  });

  if ("q" in parsedSearch) {
    const { recipes } = await searchRecipes(parsedSearch.q);

    if (recipes.length === 0) {
      return <NoResultsFound />;
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    );
  }

  const { recipes, pagination } = await getRecipes(
    parsedSearch.page ?? 1,
    parsedSearch.sort,
  );

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
        Intenta buscar con otros términos
      </p>
    </div>
  );
}
