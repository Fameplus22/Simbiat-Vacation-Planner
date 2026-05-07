import { Plane, Plus, Route } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  userEmail?: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  const isSignedIn = Boolean(userEmail);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-2 font-semibold" href={isSignedIn ? "/dashboard" : "/"}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </span>
          <span>Vacation Planner</span>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Primary navigation">
          {isSignedIn ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  <Route className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link href="/trips/new">
                  <Plus className="h-4 w-4" />
                  New trip
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Start planning</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
