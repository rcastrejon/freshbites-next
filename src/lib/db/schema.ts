import { relations, type SQL, sql } from "drizzle-orm";
import {
  text,
  sqliteTable,
  real,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
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
  likes: many(likeTable),
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
  views: integer().notNull().default(0),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const recipeRelations = relations(recipeTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [recipeTable.authorId],
    references: [userTable.id],
  }),
  likes: many(likeTable),
}));

export const likeTable = sqliteTable(
  "likes",
  {
    userId: text()
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    recipeId: text()
      .notNull()
      .references(() => recipeTable.id, { onDelete: "cascade" }),
    createdAt: text()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.recipeId] }),
  }),
);

export const likesRelations = relations(likeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [likeTable.userId],
    references: [userTable.id],
  }),
  recipe: one(recipeTable, {
    fields: [likeTable.recipeId],
    references: [recipeTable.id],
  }),
}));
