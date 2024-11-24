"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NutritionalFact } from "@/lib/db/schema";
import { Check, Plus, XIcon } from "lucide-react";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { verifyRecipe } from "./actions";
import { Label } from "@/components/ui/label";

export function VerifyModal({ recipeId }: { recipeId: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <Check className="h-4 w-4" />
          <span className="sr-only">Verificar receta</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Verificar receta</SheetTitle>
          <SheetDescription className="sr-only">
            Usa el siguiente formulario para verificar la receta.
          </SheetDescription>
        </SheetHeader>
        <VerifyForm recipeId={recipeId} />
      </SheetContent>
    </Sheet>
  );
}

function VerifyForm({ recipeId }: { recipeId: string }) {
  const verifyRecipeWithId = verifyRecipe.bind(null, recipeId);
  return (
    <Form className="m-0" action={verifyRecipeWithId}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="caloriesPerServing">Calorías por porción</Label>
          <Input
            id="caloriesPerServing"
            name="caloriesPerServing"
            type="number"
            autoComplete="off"
            step="1"
            min="1"
            required
          />
        </div>
        <NutritionFactsInput />
      </div>
      <VerifyButton />
    </Form>
  );
}

function NutritionFactsInput() {
  const [nutritionFacts, setNutritionFacts] = useState<NutritionalFact[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.setCustomValidity("Ingresa al menos un elemento.");
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="nutritionFacts-input">Información nutricional</Label>
      <div className="grid grid-cols-[1fr,_auto] gap-2">
        <div className="flex rounded-lg shadow-sm">
          <Input
            className="rounded-r-none shadow-none"
            id="nutritionFacts-input"
            placeholder="Nombre"
            ref={nameRef}
          />
          <Input
            className="-ml-px w-[96px] rounded-none shadow-none"
            type="number"
            placeholder="Valor"
            ref={valueRef}
          />
          <Input
            className="-ml-px w-[96px] rounded-l-none shadow-none"
            placeholder="Unidad"
            ref={unitRef}
          />
        </div>
        <Button
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            if (
              nameRef.current?.value &&
              valueRef.current?.value &&
              unitRef.current?.value
            ) {
              setNutritionFacts([
                ...nutritionFacts,
                {
                  key: nameRef.current.value,
                  value: valueRef.current.value,
                  unit: unitRef.current.value,
                },
              ]);
              nameRef.current.value = "";
              valueRef.current.value = "";
              unitRef.current.value = "";
              nameRef.current.setCustomValidity("");
            }
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <ul className="space-y-1">
        {nutritionFacts.map((fact, index) => (
          <li
            key={index}
            className="flex justify-between rounded-md bg-muted p-2 text-sm"
          >
            <input
              hidden
              name="nutritionFacts"
              defaultValue={JSON.stringify(fact)}
            />
            <div>
              <span>{fact.key}</span> - <span>{fact.value}</span>
              <span>{fact.unit}</span>
            </div>
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
                onClick={() =>
                  setNutritionFacts((prev) => {
                    const newItems = [...prev];
                    newItems.splice(index, 1);
                    if (newItems.length === 0) {
                      nameRef.current?.setCustomValidity(
                        "Ingresa al menos un elemento.",
                      );
                    }
                    return newItems;
                  })
                }
              >
                <XIcon />
                <span className="sr-only">Eliminar elemento</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VerifyButton() {
  const { pending } = useFormStatus();

  return (
    <SheetFooter>
      <Button type="submit" disabled={pending}>
        Verificar receta
      </Button>
    </SheetFooter>
  );
}
