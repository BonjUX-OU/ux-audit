"use client";

import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import Link from "next/link";

function AccountMenu() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/signin");
    }
  }, [status]);

  if (status === "loading") {
    return <p>Loading...</p>; // or a spinner
  }

  return (
    <>
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* <CircleUser className="h-6 w-6" /> */}
            <img className="cursor-pointer rounded-full w-10 h-10 border" src={session?.user?.image}></img>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {session?.user?.name?.split(" ")[0]} {session?.user?.name?.split(" ")[1]}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Profile Button */}
            {/* <DropdownMenuItem onClick={handleProfileClick}>
              Profile
            </DropdownMenuItem> */}
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLSdCSVNo2phhZ03CnE1unEUp5Rto7M_AxRjHji_2UKuWw1KMNg/viewform?usp=dialog"
              target="_blank">
              <DropdownMenuItem>Give Feedback</DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            {/* Logout Button */}
            <DropdownMenuItem
              onClick={() => {
                signOut();
              }}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default AccountMenu;
