import { CircleAlert, Plus } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { listTripsForUser } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { TripCard } from "@/components/trips/trip-card";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const wasCreated = params?.created === "1";
  const { trips, error } = await listTripsForUser(user.id);

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user.email} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">
              Welcome{user.email ? `, ${user.email}` : ""}
            </p>
            <h1 className="text-3xl font-bold tracking-normal">Trip dashboard</h1>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              See saved draft trips and start the next planning loop.
            </p>
          </div>
          <Button asChild>
            <Link href="/trips/new">
              <Plus className="h-4 w-4" />
              Create new trip
            </Link>
          </Button>
        </div>

        {wasCreated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Draft trip saved. It is now listed below.
          </div>
        ) : null}

        {error ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="flex flex-row gap-3 space-y-0">
              <CircleAlert className="h-5 w-5 text-amber-700" />
              <div>
                <CardTitle>Trips could not load</CardTitle>
                <CardDescription className="text-amber-900">
                  {error}. Confirm the Supabase migration has been applied.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {!error && trips.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No draft trips yet</CardTitle>
              <CardDescription>
                Create your first draft with a destination, cities, and day allocation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/trips/new">
                  <Plus className="h-4 w-4" />
                  Start a draft trip
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {trips.length > 0 ? (
          <section className="grid gap-4" aria-label="Saved draft trips">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
