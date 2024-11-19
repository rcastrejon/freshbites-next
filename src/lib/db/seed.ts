import "../server/envConfig";

import { db } from ".";
import { recipeTable } from "./schema";
import recipes from "./recipes.json";
import { dropAll, upsertMultipleVectors } from "../server/vectors";

async function main() {
  await db.delete(recipeTable).all();

  const transformedRecipes = recipes.map((recipe) => ({
    ...recipe,
    authorId: null,
    verifiedAt: recipe.verifiedAt ? new Date(recipe.verifiedAt) : null,
  }));

  const insertResults = await db
    .insert(recipeTable)
    .values(transformedRecipes)
    .returning();
  console.log("Seeded recipes");

  await dropAll();
  console.log("Dropped vectors");

  const newRecipes = insertResults
    .map((recipe) => {
      if (!recipe) {
        console.error("Failed to insert recipe");
        return null;
      }
      return recipe;
    })
    .filter((recipe) => recipe !== null);
  await upsertMultipleVectors(newRecipes);
  console.log("Seeded vectors");
}

void main();
