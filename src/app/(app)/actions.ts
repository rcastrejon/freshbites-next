"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

export async function createRecipe(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
  revalidateTag("recipes");
  console.log(formData);
}
