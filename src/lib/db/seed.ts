import "../server/envConfig";

import { db } from ".";
import { recipeTable } from "./schema";
import recipes from "./recipes.json";

async function main() {
  await db.delete(recipeTable).all();

  const transformedRecipes = recipes.map((recipe) => ({
    ...recipe,
    authorId: null,
    verifiedAt: recipe.verifiedAt ? new Date(recipe.verifiedAt) : null,
  }));

  await db.insert(recipeTable).values(transformedRecipes).returning();

  console.log("Seeded recipes");
}

void main();
