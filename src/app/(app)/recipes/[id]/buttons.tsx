"use client";

import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/db/types";
import { Pin, PinOff } from "lucide-react";
import dynamic from "next/dynamic";
import { OnlyPinned, OnlyUnpinned } from "../../pin-button";

const PinButton = dynamic(() => import("../../pin-button"), { ssr: false });

export function ActionButtons({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex space-x-2">
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
  );
}
