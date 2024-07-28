"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import { useFormStatus } from "react-dom";

export function SubmitButtons({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button type="submit">{title}</Button>
      )}
    </>
  );
}

export function BuyButton({ price }: { price: number }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled size={"lg"} className="w-full mt-10">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button className="w-full mt-10" type="submit" size={"lg"}>
          Buy for ${price}
        </Button>
      )}
    </>
  );
}
