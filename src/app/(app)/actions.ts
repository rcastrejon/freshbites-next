"use server";

import { db } from "@/lib/db";
import { recipeTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { upsertSingleVector } from "@/lib/server/vectors";

const currencySchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Formato inválido")
  .refine((val) => parseFloat(val) > 0, "Debe ser mayor a 0")
  .transform((val) => parseFloat(val));

const createRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  timeInMinutes: z.number().positive(),
  cost: currencySchema,
  servings: z.number().positive(),
  ingredients: z.array(z.string()).min(1),
  instructions: z.array(z.string()).min(1),
});

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

function validateImage(file: File) {
  if (!file.type.startsWith("image/jpeg")) {
    return "La imagen debe ser en formato JPEG";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "La imagen no debe exceder 4MB";
  }
  return null;
}

const utApi = new UTApi();

export async function createRecipe(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const result = createRecipeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    timeInMinutes: Number(formData.get("timeInMinutes")),
    cost: formData.get("cost"),
    servings: Number(formData.get("servings")),
    ingredients: formData.getAll("ingredients"),
    instructions: formData.getAll("instructions"),
  });

  if (!result.success) {
    console.error(result.error);
    throw new Error("Invalid form data");
  }

  const image = formData.get("image") as File;
  const imageError = validateImage(image);
  if (imageError) {
    throw new Error(imageError);
  }

  const uploadResult = await utApi.uploadFiles(image);

  if (uploadResult.error) {
    throw new Error("Failed to upload image");
  }

  const [newRecipe] = await db
    .insert(recipeTable)
    .values({
      ...result.data,
      authorId: userId,
      imageUrl: uploadResult.data.url,
    })
    .returning({ id: recipeTable.id });

  if (!newRecipe) {
    throw new Error("Failed to create recipe");
  }

  await upsertSingleVector(newRecipe.id, {
    id: newRecipe.id,
    title: result.data.title,
    description: result.data.description,
    ingredients: result.data.ingredients,
    instructions: result.data.instructions,
  });

  redirect(`/recipes/${newRecipe.id}`);
}
