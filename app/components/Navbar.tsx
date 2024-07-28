import Link from "next/link";
import React from "react";
import NavbarLinks from "./NavbarLinks";
import { Button } from "@/components/ui/button";
import MobileMenu from "./MobileMenu";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { UserNav } from "./UserNav";

export default async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="relative max-w-7xl w-full flex md:grid md:grid-cols-12 items-center px-4 md:px-8 mx-auto py-7">
      {/* SPAN-3 */}
      <div className="md:col-span-3">
        <Link href={"/"}>
          <h1 className="text-2xl font-semibold">
            Neo<span className="text-primary">UI</span>
          </h1>
        </Link>
      </div>

      {/* SPAN-6 */}
      <NavbarLinks />

      {/* SPAN-3 */}
      <div className="flex items-center gap-x-2 ms-auto md:col-span-3">
        {user ? (
          <UserNav
            email={user.email as string}
            name={user.given_name as string}
            userImage={user.picture ?? `https://avatar.vercel.sh/rauchg`}
          />
        ) : (
          <div className="flex items-center gap-x-2">
            <Button asChild>
              <LoginLink>Login</LoginLink>
            </Button>
            <Button asChild variant={"secondary"}>
              <RegisterLink>Register</RegisterLink>
            </Button>
          </div>
        )}

        {/* Mobile Menu - Hidden except on iPhone */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
