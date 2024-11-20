import type { recipeTable, userTable } from "./schema";

export type Recipe = typeof recipeTable.$inferSelect;
export type Author = typeof userTable.$inferSelect;

export type RecipeWithAuthor = Recipe & { author: Author | null };

export type AuthorInsert = typeof userTable.$inferInsert;
