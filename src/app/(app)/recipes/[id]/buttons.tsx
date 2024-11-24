"use client";

import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/db/types";
import { Pin, PinOff, Trash2 } from "lucide-react";
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
import { deleteRecipe } from "./actions";
import { EditRecipeModal } from "../../new-recipe";

const PinButton = dynamic(() => import("../../pin-button"), { ssr: false });

export function ActionButtons({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <div className="flex">
        <Button size="icon" variant="outline" className="group flex-1" asChild>
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
      </div>
      <AuthorActions recipe={recipe} />
    </>
  );
}

function AuthorActions({ recipe }: { recipe: Recipe }) {
  const { userId } = useAuth();
  const isAuthor = userId === recipe.authorId;
  if (!isAuthor) return null;

  const deleteRecipeAction = deleteRecipe.bind(null, recipe.id);
  return (
    <div className="flex gap-2">
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
