import { db } from "@/lib/db";
import { recipeTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

const getRecipe = async (id: string) => {
  const recipe = await db.query.recipeTable.findFirst({
    with: {
      author: true,
    },
    where: eq(recipeTable.id, id),
  });
  if (!recipe) {
    notFound();
  }
  return recipe;
};

export default async function RecipeDetails(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const recipe = await getRecipe(params.id);

  return <div>Recipe: {recipe.title}</div>;
}
