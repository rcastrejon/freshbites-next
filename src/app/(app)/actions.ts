"use server";

import { revalidateTag } from "next/cache";

export async function createRecipe(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  revalidateTag("recipes");
  console.log(formData);
}
