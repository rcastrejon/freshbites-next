"use server";

import { db } from "@/lib/db";
import { recipeTable } from "@/lib/db/schema";
import { deleteVector } from "@/lib/server/vectors";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function deleteRecipe(recipeId: string) {
  const { userId } = await auth();
  const recipe = await db.query.recipeTable.findFirst({
    where: eq(recipeTable.id, recipeId),
    columns: {
      id: true,
      authorId: true,
    },
  });

  if (recipe?.authorId === null || recipe?.authorId !== userId) {
    throw new Error("You are not authorized to delete this recipe");
  }

  await db.delete(recipeTable).where(eq(recipeTable.id, recipeId));
  await deleteVector(recipeId);
  redirect("/recipes");
}
