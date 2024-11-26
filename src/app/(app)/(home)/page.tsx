/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import { likeTable, recipeTable, userTable } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { RecipeCard } from "../card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Coins, Leaf, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const getFeaturedRecipe = async () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  // Simple hash function for string IDs
  const hashId = (id: string) => {
    return id.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
  };

  const result = await db
    .select({
      recipes: recipeTable,
      author: userTable,
      likesCount: count(likeTable.userId).as("likes_count"),
    })
    .from(recipeTable)
    .leftJoin(userTable, eq(recipeTable.authorId, userTable.id))
    .leftJoin(likeTable, eq(recipeTable.id, likeTable.recipeId))
    .groupBy(recipeTable.id, userTable.id);

  if (result.length === 0) return null;

  // Calculate weighted scores for each recipe
  const scoredRecipes = result.map((r) => ({
    ...r.recipes,
    author: r.author,
    score:
      r.recipes.views * 0.4 +
      Number(r.likesCount) * 0.6 +
      // Use hashed ID for the rotation factor
      Math.sin((dayOfYear + hashId(r.recipes.id)) * 0.5) * 100,
  }));

  // Sort by score and get the top recipe
  return scoredRecipes.sort((a, b) => b.score - a.score)[0];
};

const getPopularRecipes = async () => {
  const result = await db
    .select({
      recipes: recipeTable,
      author: userTable,
      likesCount: count(likeTable.userId).as("likes_count"),
    })
    .from(recipeTable)
    .leftJoin(userTable, eq(recipeTable.authorId, userTable.id))
    .leftJoin(likeTable, eq(recipeTable.id, likeTable.recipeId))
    .groupBy(recipeTable.id, userTable.id)
    .orderBy(sql`${recipeTable.views} DESC, ${recipeTable.createdAt} DESC`)
    .limit(8);
  return result.map((r) => Object.assign(r.recipes, { author: r.author }));
};

export default function Home() {
  return (
    <div>
      <h3 className="mb-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
        Receta destacada
      </h3>
      <FeaturedRecipe />
      <h3 className="mb-3 mt-3 border-b-2 border-b-foreground pb-1 font-serif text-2xl font-bold">
        Recetas populares
      </h3>
      <CardGrid />
    </div>
  );
}

async function CardGrid() {
  const recipes = await getPopularRecipes();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

async function FeaturedRecipe() {
  const recipe = await getFeaturedRecipe();

  if (!recipe) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-none border-2 shadow-md">
      <div className="md:flex">
        <div className="relative aspect-square md:w-1/2">
          <img
            src={recipe?.imageUrl}
            alt={recipe?.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-2 top-2 -rotate-6 transform bg-orange-700 px-2 py-0.5 text-xs font-bold text-orange-100">
            Destacado
          </div>
        </div>
        <div className="p-3 md:w-1/2 md:p-4">
          <CardHeader className="mb-2 p-0">
            <CardTitle className="mb-1 font-serif text-2xl">
              {recipe.title}
              <span className="mt-1 block font-serif text-xs font-normal italic">
                Por{" "}
                {recipe.author
                  ? `${recipe.author.firstName} ${recipe.author.lastName}`
                  : "[ELIMINADO]"}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {recipe.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-muted-foreground" />{" "}
                {recipe.timeInMinutes} min
              </span>
              <span className="flex items-center">
                <Coins className="mr-1 h-4 w-4 text-muted-foreground" /> $
                {recipe.cost}
              </span>
              <span className="flex items-center">
                <Utensils className="mr-1 h-4 w-4 text-muted-foreground" />{" "}
                {recipe.servings} porcione(s)
              </span>
              <span className="flex items-center">
                <Leaf className="mr-1 h-4 w-4 text-muted-foreground" />{" "}
                {recipe.caloriesPerServing} kcal
              </span>
            </div>
          </CardContent>
          <CardFooter className="grid p-0">
            <Button asChild>
              <Link href={`/recipes/${recipe.id}`}>Ver receta</Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
