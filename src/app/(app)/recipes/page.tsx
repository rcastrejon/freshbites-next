import { RecipeCard } from "../card";
import { z } from "zod";
import { Pagination } from "./pagination";
import { db } from "@/lib/db";
import { count, desc } from "drizzle-orm";
import { recipeTable } from "@/lib/db/schema";

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

export default function Recipes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const page = searchParams.then((p) => p.page as string | undefined);
  return (
    <div>
      <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
        Recetas
      </h3>
      <CardGrid page={page} />
    </div>
  );
}

const searchSchema = z.object({
  page: z.number().int().positive().optional().catch(1),
});

async function CardGrid(props: { page: Promise<string | undefined> }) {
  const page = await props.page;
  const search = searchSchema.parse({
    page: parseInt(page ?? ""),
  });

  const { recipes, pagination } = await getRecipes(search.page ?? 1);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <Pagination
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        page={search.page ?? 1}
      />
    </>
  );
}
