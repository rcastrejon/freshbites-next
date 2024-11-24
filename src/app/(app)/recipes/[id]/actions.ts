"use server";

import { db } from "@/lib/db";
import { likeTable, recipeTable } from "@/lib/db/schema";
import { deleteVector } from "@/lib/server/vectors";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
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

export async function userLikesRecipe(recipeId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  try {
    await db.insert(likeTable).values({
      userId,
      recipeId,
    });
  } catch {
    await db
      .delete(likeTable)
      .where(
        and(eq(likeTable.userId, userId), eq(likeTable.recipeId, recipeId)),
      );
  }
}

export async function getNumberOfLikes(recipeId: string) {
  const [result] = await db
    .select({
      likes: db.$count(likeTable, eq(likeTable.recipeId, recipeId)),
    })
    .from(likeTable);
  return result?.likes ?? 0;
}
