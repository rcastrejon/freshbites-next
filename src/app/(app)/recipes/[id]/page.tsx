import { unstable_cache as cache } from "next/cache";
import recipes from "@/lib/db/recipes.json";
import { notFound } from "next/navigation";

const getRecipe = cache(async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const recipe = recipes.find((recipe) => recipe.id === id);
  if (!recipe) {
    notFound();
  }
  return recipe;
});

export default async function RecipeDetails(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const recipe = await getRecipe(params.id);

  return <div>Recipe: {recipe.title}</div>;
}
