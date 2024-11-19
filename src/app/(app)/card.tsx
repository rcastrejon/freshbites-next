/* eslint-disable @next/next/no-img-element */
import { Clock, Coins, Leaf, ShieldCheck, Utensils } from "lucide-react";
import { type Recipe } from "@/lib/db/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="relative aspect-square">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          loading="eager"
          className="h-full w-full rounded-t-xl object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pt-12">
          <h4 className="font-serif text-base font-semibold leading-none text-card">
            {recipe.title}
          </h4>
          <p className="mt-1 font-serif text-xs italic text-muted">
            Por John Doe
          </p>
        </div>
        <VerifiedBadge isVerified={recipe.verifiedAt !== null} />
      </div>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />{" "}
            {recipe.timeInMinutes} min
          </span>
          <span className="flex items-center">
            <Coins className="mr-1 h-3 w-3 text-muted-foreground" /> $
            {recipe.cost}
          </span>
          <span className="flex items-center">
            <Utensils className="mr-1 h-3 w-3 text-muted-foreground" />{" "}
            {recipe.servings}
          </span>
          <CalorieTag caloresPerServings={recipe.caloriesPerServing} />
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <Button size="lg" variant="outline" className="w-full" asChild>
          <Link href={`/recipes/${recipe.id}`}>Ver receta</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CalorieTag({
  caloresPerServings,
}: {
  caloresPerServings?: number | null;
}) {
  if (!caloresPerServings) {
    return (
      <span className="text-xs text-muted-foreground">Calorías no disp.</span>
    );
  }
  return (
    <span className="flex items-center">
      <Leaf className="mr-1 h-3 w-3 text-muted-foreground" />{" "}
      {caloresPerServings} kcal
    </span>
  );
}

export function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) {
    return (
      <Badge className="absolute right-2 top-2 bg-orange-400 text-white">
        Comunidad
      </Badge>
    );
  }
  return (
    <Badge className="absolute right-2 top-2 bg-green-600 text-white">
      <ShieldCheck className="mr-1 inline h-3 w-3" />
      Verificado
    </Badge>
  );
}
