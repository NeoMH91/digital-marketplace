// Server component, fetches data from prisma

import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { SellForm } from "../components/form/Sellform";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "../lib/db";

async function getData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeConnectedLinked: true,
    },
  });
  if (data?.stripeConnectedLinked === false) {
    return redirect("/billing");
  }
  return null;
}

export default async function SellRoute() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("pages/404");
  }

  const data = await getData(user.id);
  // JSX
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      <Card>
        <SellForm />
      </Card>
    </section>
  );
}
