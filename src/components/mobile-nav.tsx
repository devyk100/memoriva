"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import LogoutButton from "./logout";

interface MobileNavProps {
  session: any;
}

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <span className="font-bold">Memoriva</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/decks"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Decks
            </Link>
            <Link
              href="/study"
              className="text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Study
            </Link>
            <div className="pt-4 border-t">
              {!session?.user ? (
                <Link
                  href="/api/auth/signin"
                  className="text-foreground/70 transition-colors hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
              ) : (
                <div onClick={() => setOpen(false)}>
                  <LogoutButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
