"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, XIcon, Trash, ImageIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createRecipe } from "./actions";
import Form from "next/form";
import { useFormStatus } from "react-dom";

export function NewRecipeModal() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm">
          <PlusCircle className="h-4 w-4" />
          Nueva receta
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Publicar nueva receta</SheetTitle>
          <SheetDescription className="sr-only">
            Usa el siguiente formulario para compartir tu receta con los demás.
            Asegúrate de incluir todos los detalles necesarios para que otros
            puedan prepararla.
          </SheetDescription>
        </SheetHeader>
        <NewRecipeForm />
      </SheetContent>
    </Sheet>
  );
}

function NewRecipeForm() {
  return (
    <Form className="m-0" action={createRecipe}>
      <div className="grid gap-4 py-4">
        <ImageInput />
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" autoComplete="off" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            autoComplete="off"
            required
            className="h-24"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeInMinutes">Tiempo</Label>
            <div className="relative">
              <Input
                id="timeInMinutes"
                name="timeInMinutes"
                className="peer pe-12"
                type="number"
                min="1"
                required
              />
              <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                min
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Porciones</Label>
            <Input
              id="servings"
              name="servings"
              type="number"
              min="1"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Costo</Label>
          <div className="relative">
            <Input
              id="cost"
              name="cost"
              className="peer pe-12 ps-6"
              type="number"
              min="1"
              step="0.01"
              required
            />
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
              $
            </span>
            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
              MXN
            </span>
          </div>
        </div>
        <ListInput mode="ingredients" />
        <ListInput mode="instructions" />
      </div>
      <PublishButton />
    </Form>
  );
}

function ImageInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);

  function clearInput() {
    setImage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <input
        className="absolute inset-0 -z-50 opacity-0"
        id="image"
        name="image"
        type="file"
        accept="image/jpeg"
        multiple={false}
        required
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setImage(file);
        }}
        ref={inputRef}
      />
      {!image ? (
        <label
          htmlFor="image"
          className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-4 text-center hover:border-muted-foreground/50"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">Imagen de la receta</p>
            <p className="text-xs text-muted-foreground">
              Esta imagen será la primera impresión de tu receta. Asegúrate de
              que se vea apetitosa y represente bien el resultado final.
            </p>
          </div>
        </label>
      ) : (
        <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm">
          <div className="inline-grid h-9 w-full grid-cols-[auto,_1fr] items-center rounded-l-lg border">
            <div className="inline-flex w-9 items-center justify-center">
              <ImageIcon className="h-4 w-4" />
            </div>
            <span className="truncate pr-2 text-sm">{image.name}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-none rounded-r-lg shadow-none hover:text-destructive"
            onClick={clearInput}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      )}
    </div>
  );
}

const LIST_INPUT_MSG = {
  ingredients: {
    title: "Ingredientes",
    item: "ingrediente",
    validation: "Agrega al menos un ingrediente.",
  },
  instructions: {
    title: "Instrucciones",
    item: "instrucción",
    validation: "Agrega al menos una instrucción.",
  },
};

function ListInput({ mode }: { mode: keyof typeof LIST_INPUT_MSG }) {
  const [listItems, setListItems] = useState<string[]>([]);
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    fieldRef.current?.setCustomValidity(LIST_INPUT_MSG[mode].validation);
  }, [mode]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const ListElement = mode === "ingredients" ? "ul" : "ol";

  return (
    <div className="space-y-2">
      <Label htmlFor={`${mode}-input`}>{LIST_INPUT_MSG[mode].title}</Label>
      <Textarea
        id={`${mode}-input`}
        placeholder="Presiona Enter para agregar"
        autoComplete="off"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const input = e.target as HTMLInputElement & HTMLTextAreaElement;
            if (input.value.trim()) {
              setListItems([...listItems, input.value.trim()]);
              input.value = "";
              input.setCustomValidity("");
            }
          }
        }}
        ref={fieldRef}
      />
      <ListElement className="space-y-1">
        {listItems.map((item, i) => (
          <li
            key={i}
            className="flex justify-between rounded-md bg-muted p-2 text-sm"
          >
            <input hidden name={mode} defaultValue={item} />
            <span>{item}</span>
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
                onClick={() =>
                  setListItems((prev) => {
                    const newItems = [...prev];
                    newItems.splice(i, 1);
                    if (newItems.length === 0) {
                      fieldRef.current?.setCustomValidity(
                        LIST_INPUT_MSG[mode].validation,
                      );
                    }
                    return newItems;
                  })
                }
              >
                <XIcon />
                <span className="sr-only">
                  Eliminar {LIST_INPUT_MSG[mode].item}
                </span>
              </Button>
            </div>
          </li>
        ))}
      </ListElement>
    </div>
  );
}

function PublishButton() {
  const { pending } = useFormStatus();

  return (
    <SheetFooter>
      <Button type="submit" disabled={pending}>
        Publicar
      </Button>
    </SheetFooter>
  );
}
