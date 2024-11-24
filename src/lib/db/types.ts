import type { likeTable, recipeTable, userTable } from "./schema";

export type Recipe = typeof recipeTable.$inferSelect;
export type Author = typeof userTable.$inferSelect;
export type Likes = typeof likeTable.$inferSelect;

export type RecipeWithAuthor = Recipe & { author: Author | null };
export type RecipeWithLikes = Recipe & { likes: Likes[] };

export type AuthorInsert = typeof userTable.$inferInsert;
