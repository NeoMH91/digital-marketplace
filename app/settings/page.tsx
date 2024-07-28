// Server file, related client file is in components/SettingsForm.tsx

import { Card } from "@/components/ui/card";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import prisma from "../lib/db";
import { SettingsForm } from "../components/form/SettingsForm";
import { redirect } from "next/navigation";

async function getData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });
  return data;
}

export default async function Settings() {
  // Authentication
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("pages/404");
  }
  const data = await getData(user.id);

  //   JSX
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8">
      <Card>
        <SettingsForm
          firstname={data?.firstName as string}
          lastname={data?.lastName as string}
          email={data?.email as string}
        />
      </Card>
    </section>
  );
}
