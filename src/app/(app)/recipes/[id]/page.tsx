/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import { type NutritionalFact, recipeTable, userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { VerifiedBadge } from "../../card";
import { Badge } from "@/components/ui/badge";
import { Clock, Coins, Leaf, Utensils } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const getRecipe = async (id: string) => {
  const recipe = await db.query.recipeTable.findFirst({
    where: eq(recipeTable.id, id),
  });
  if (!recipe) {
    notFound();
  }
  return recipe;
};

const getAuthor = async (id: string) => {
  const author = await db.query.userTable.findFirst({
    where: eq(userTable.id, id),
  });
  if (!author) {
    return "[ELIMINADO]";
  }

  return author.fullName;
};

export default async function RecipeDetails(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const recipe = await getRecipe(params.id);

  return (
    <div className="space-y-3">
      <div className="grid items-start gap-3 md:grid-cols-2">
        <div className="relative aspect-square">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            loading="eager"
            className="h-full w-full rounded-lg object-cover shadow-lg"
          />
          <VerifiedBadge isVerified={recipe.verifiedAt !== null} />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold">{recipe.title}</h1>
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <AuthorName authorId={recipe.authorId} />
          </Suspense>
          <p className="text-sm">{recipe.description}</p>
          <NutritionLabels nutritionFacts={recipe.nutritionalFacts} />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" /> {recipe.timeInMinutes} min
            </Badge>
            <Badge variant="secondary">
              <Coins className="mr-1 h-3 w-3" /> ${recipe.cost.toFixed(2)}
            </Badge>
            <Badge variant="secondary">
              <Utensils className="mr-1 h-3 w-3" /> {recipe.servings}{" "}
              {recipe.servings === 1 ? "porción" : "porciones"}
            </Badge>
            {recipe.caloriesPerServing !== null && (
              <Badge variant="secondary">
                <Leaf className="mr-1 h-3 w-3" /> {recipe.caloriesPerServing}{" "}
                kcal por porción
              </Badge>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-xl font-semibold">
              Ingredientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground"></div>
                  {ingredient}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-xl font-semibold">
              Instrucciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AuthorName({ authorId }: { authorId: string | null }) {
  if (!authorId)
    return <p className="font-serif text-sm italic">Por [ELIMINADO]</p>;
  const author = await getAuthor(authorId);
  return <p className="font-serif text-sm italic">Por {author}</p>;
}

function NutritionLabels({
  nutritionFacts,
}: {
  nutritionFacts: NutritionalFact[] | null;
}) {
  if (!nutritionFacts) return null;

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {nutritionFacts.map((fact, index) => (
        <div key={index} className="rounded-lg bg-muted p-2.5">
          <p className="font-medium">{fact.key}</p>
          <p className="font-semibold">
            {fact.value} {fact.unit}
          </p>
        </div>
      ))}
    </div>
  );
}
