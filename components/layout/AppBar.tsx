"use client";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import Image from "next/image";
import AccountMenu from "./AccountMenu";
import Link from "next/link";

export default function AppBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 p-2 bg-white border-b">
      <Menubar className="rounded-none border-none px-2 lg:px-4">
        <MenubarMenu>
          <div className=" lg:hidden"></div>
          <MenubarTrigger>
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="UXMust Logo"
                width={120}
                height={40}
                className="w-auto h-8"
              />
            </Link>
          </MenubarTrigger>
        </MenubarMenu>
        <div className="grow" />
        <div className="flex">
          <AccountMenu />
        </div>
      </Menubar>
    </div>
  );
}
