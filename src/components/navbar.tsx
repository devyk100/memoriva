import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getServerSession } from "next-auth";
import Link from "next/link";
import ModeToggle from "./mode-toggle";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <NavigationMenu className="w-screen border-b-[0.5px] border-b-gray-200 dark:border-b-gray-800">
      <NavigationMenuList className="w-screen justify-between gap-2 p-2">
        <NavigationMenuItem>
          <Link href="/" className="font-semibold text-lg">
            Memoriva
          </Link>
        </NavigationMenuItem>
        <span className="flex items-center gap-1 lg:gap-2 gap-x-2 md:gap-x-4">
          <ModeToggle />
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/decks">Decks</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/study">Study</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          {!session?.user ? (
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/api/auth/signin">
                  Log in
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : null}
        </span>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
