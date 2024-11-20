"use server";

import { db } from "@/lib/db";
import { recipeTable, type NutritionalFact } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

const verifyRecipeSchema = z.object({
  caloriesPerServing: z.number().positive(),
  nutritionFacts: z
    .array(z.string().transform((v) => JSON.parse(v) as NutritionalFact))
    .nonempty(),
});

export async function verifyRecipe(recipeId: string, formData: FormData) {
  const { orgRole } = await auth();
  const guard = orgRole === "org:admin" || orgRole === "org:member";
  if (!guard) {
    throw new Error("Unauthorized");
  }

  const results = verifyRecipeSchema.parse({
    caloriesPerServing: Number(formData.get("caloriesPerServing")),
    nutritionFacts: formData.getAll("nutritionFacts"),
  });

  const result = await db
    .update(recipeTable)
    .set({
      verifiedAt: new Date(),
      nutritionalFacts: results.nutritionFacts,
      caloriesPerServing: results.caloriesPerServing,
    })
    .where(eq(recipeTable.id, recipeId));
  if (result.rowsAffected === 0) {
    notFound();
  }
  redirect(`/recipes/${recipeId}`);
}
