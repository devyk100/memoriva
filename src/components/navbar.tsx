import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Link from "next/link";
import ModeToggle from "./mode-toggle";
import LogoutButton from "./logout";
import { MobileNav } from "./mobile-nav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Memoriva
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              href="/decks"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Decks
            </Link>
            <Link
              href="/study"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Study
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <MobileNav session={session} />

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold">Memoriva</span>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:flex">
              {!session?.user ? (
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Log in
                </Link>
              ) : (
                <LogoutButton />
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
