import { Index } from "@upstash/vector";
import { type Recipe } from "../db/types";

type Metadata = {
  id: string;
};

const index = new Index<Metadata>();

function getNamespace() {
  const codename = "freshbites";
  const env = process.env.NODE_ENV ?? "development";
  return `${codename}-${env}`;
}

export type RecipeVector = Pick<
  Recipe,
  "id" | "title" | "description" | "ingredients" | "instructions"
>;

function getRecipeEmbeddingText(recipe: RecipeVector) {
  return [
    recipe.title,
    recipe.description,
    recipe.ingredients.join(", "),
    recipe.instructions.join(", "),
  ].join("\n\n");
}

export async function upsertSingleVector(id: string, recipe: RecipeVector) {
  return await index.upsert(
    {
      id,
      data: getRecipeEmbeddingText(recipe),
      metadata: { id },
    },
    {
      namespace: getNamespace(),
    },
  );
}

export async function upsertMultipleVectors(recipes: RecipeVector[]) {
  const toInsert = recipes.map((recipe) => ({
    id: recipe.id,
    data: getRecipeEmbeddingText(recipe),
    metadata: { id: recipe.id },
  }));
  return await index.upsert(toInsert, {
    namespace: getNamespace(),
  });
}

export async function queryVectors(query: string, topK = 8) {
  return await index.query(
    {
      data: query,
      includeVectors: false,
      includeMetadata: false,
      topK,
    },
    {
      namespace: getNamespace(),
    },
  );
}

export async function deleteVector(id: string) {
  return await index.delete(id, {
    namespace: getNamespace(),
  });
}
