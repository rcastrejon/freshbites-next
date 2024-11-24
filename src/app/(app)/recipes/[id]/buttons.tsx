"use client";

import { Button } from "@/components/ui/button";
import type { Recipe, RecipeWithLikes } from "@/lib/db/types";
import { Heart, Pin, PinOff, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { OnlyPinned, OnlyUnpinned } from "../../pin-button";
import { useAuth } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormStatus } from "react-dom";
import Form from "next/form";
import { deleteRecipe, userLikesRecipe } from "./actions";
import { EditRecipeModal } from "../../new-recipe";
import { use, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const PinButton = dynamic(() => import("../../pin-button"), { ssr: false });

export function DynamicPinButton({ recipe }: { recipe: RecipeWithLikes }) {
  return (
    <Button variant="outline" className="group" asChild>
      <PinButton recipe={recipe}>
        <OnlyUnpinned>
          <Pin className="mr-2 h-4 w-4" />
          Anclar receta
        </OnlyUnpinned>
        <OnlyPinned>
          <PinOff className="mr-2 h-4 w-4" />
          Desanclar receta
        </OnlyPinned>
      </PinButton>
    </Button>
  );
}

export function LikeButton({
  recipeId,
  liked,
  numberOfLikesPromise,
}: {
  recipeId: string;
  liked: boolean;
  numberOfLikesPromise: Promise<number>;
}) {
  const numberOfLikes = use(numberOfLikesPromise);
  const [pending, startTransition] = useTransition();
  const [details, setDetails] = useState({ liked, numberOfLikes });

  async function toggleLike() {
    await userLikesRecipe(recipeId);
    setDetails((prev) => ({
      liked: !prev.liked,
      numberOfLikes: prev.liked
        ? prev.numberOfLikes - 1
        : prev.numberOfLikes + 1,
    }));
  }

  return (
    <Button
      variant={details.liked ? "secondary" : "outline"}
      onClick={() => startTransition(() => toggleLike())}
      disabled={pending}
    >
      <Heart className={cn("h-4 w-4", details.liked && "fill-foreground")} />
      {details.numberOfLikes}
    </Button>
  );
}

export function AuthorActions({ recipe }: { recipe: Recipe }) {
  const { userId } = useAuth();
  const isAuthor = userId === recipe.authorId;
  if (!isAuthor) return null;

  const deleteRecipeAction = deleteRecipe.bind(null, recipe.id);
  return (
    <div className="grid grid-cols-2 gap-2">
      <EditRecipeModal recipe={recipe} />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="group">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La receta será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Form action={deleteRecipeAction}>
              <DeleteRecipeConfirmationButton />
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeleteRecipeConfirmationButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" disabled={pending} type="submit">
      Eliminar
    </Button>
  );
}
