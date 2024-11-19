import recipes from "@/lib/db/recipes.json";
import { RecipeCard } from "../card";
import { z } from "zod";
import { Pagination } from "./pagination";
import { unstable_cache as cache } from "next/cache";

const getRecipes = cache(
  async (page: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const PAGE_SIZE = 8;

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const totalPages = Math.ceil(recipes.length / PAGE_SIZE);

    return {
      recipes: recipes.slice(start, end),
      pagination: {
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  },
  undefined,
  {
    tags: ["recipes"],
  },
);

export default async function Recipes({
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
