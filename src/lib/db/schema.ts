import { relations, type SQL, sql } from "drizzle-orm";
import { text, sqliteTable, real, integer } from "drizzle-orm/sqlite-core";
import { newId } from "../server/ids";

export const userTable = sqliteTable("users", {
  id: text().primaryKey(),
  username: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  fullName: text().generatedAlwaysAs(
    (): SQL => sql`${userTable.firstName} || ' ' || ${userTable.lastName}`,
    { mode: "virtual" },
  ),
  imageUrl: text().notNull(),
  createdAt: real().notNull(),
});

export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(recipeTable),
}));

export type NutritionalFact = {
  key: string;
  value: string;
  unit: string;
};

export const recipeTable = sqliteTable("recipes", {
  id: text()
    .primaryKey()
    .$defaultFn(() => newId("recipe")),
  authorId: text().references(() => userTable.id, { onDelete: "set null" }),
  title: text().notNull(),
  description: text().notNull(),
  timeInMinutes: integer().notNull(),
  cost: real().notNull(),
  caloriesPerServing: integer(),
  servings: integer().notNull(),
  imageUrl: text().notNull(),
  verifiedAt: integer({ mode: "timestamp" }),
  ingredients: text({ mode: "json" }).$type<string[]>().default([]).notNull(),
  instructions: text({ mode: "json" }).$type<string[]>().default([]).notNull(),
  nutritionalFacts: text({ mode: "json" }).$type<NutritionalFact[]>(),
  views: integer().default(0),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const recipeRelations = relations(recipeTable, ({ one }) => ({
  author: one(userTable, {
    fields: [recipeTable.authorId],
    references: [userTable.id],
  }),
}));
