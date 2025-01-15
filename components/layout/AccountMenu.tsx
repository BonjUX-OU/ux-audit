"use client";

import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";

function AccountMenu() {
  const { data: session }: any = useSession();

  useEffect(() => {
    if (!session) {
      redirect("/signin");
    }
    console.log("session", session);
  }, [session]);

  const handleProfileClick = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CircleUser className="h-6 w-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {session?.user?.name?.split(" ")[0]}{" "}
              {session?.user?.name?.split(" ")[1]}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Profile Button */}
            <DropdownMenuItem onClick={handleProfileClick}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Logout Button */}
            <DropdownMenuItem
              onClick={() => {
                signOut();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default AccountMenu;
