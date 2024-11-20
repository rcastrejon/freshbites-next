import "../server/envConfig";

import { db } from ".";
import { recipeTable, userTable } from "./schema";
import recipes from "./recipes.json";
import { dropAll, upsertMultipleVectors } from "../server/vectors";
import type { AuthorInsert } from "./types";

async function main() {
  await db.delete(recipeTable).all();
  await db.delete(userTable).all();

  const usersRes = await fetch("https://api.clerk.com/v1/users", {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });

  if (!usersRes.ok) {
    throw new Error("Failed to fetch users");
  }

  const users = (await usersRes.json()) as Record<string, unknown>[];
  const userValues = users.map(
    (user) =>
      ({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        createdAt: user.created_at,
      }) as AuthorInsert,
  );

  await db.insert(userTable).values(userValues);
  console.log("Seeded users");

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
