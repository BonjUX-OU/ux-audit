"use client";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import Image from "next/image";
import AccountMenu from "./AccountMenu";
import Link from "next/link";
import { Coins } from "lucide-react";

export default function AppBar() {
  return (
    <div className="fixed top-0 left-0 right-0 p-2 bg-white border-b" style={{ zIndex: 48 }}>
      <Menubar className="rounded-none border-none px-2 lg:px-4">
        <MenubarMenu>
          <div className=" lg:hidden"></div>
          <MenubarTrigger>
            <Link href="/dashboard">
              <Image src="/images/logo.png" alt="UXMust Logo" width={120} height={40} className="w-auto h-8" />
            </Link>
          </MenubarTrigger>
        </MenubarMenu>
        <div className="grow" />
        <div className="flex items-center">
          <div className="flex items-center gap-2 me-4 border rounded-md px-4">
            <Coins className="w-4 h-4" color="#B04E34" />
            <span className="text-md me-1">Remaining credits:</span>
            <span className="text-lg text-[#B04E34]">4</span>
          </div>
          <AccountMenu />
        </div>
      </Menubar>
    </div>
  );
}
