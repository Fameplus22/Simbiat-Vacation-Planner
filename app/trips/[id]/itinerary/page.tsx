import { ArrowLeft, CalendarDays, ListChecks, RefreshCw } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { listTripDaysForUser } from "@/lib/itinerary";
import { isLocalTripId } from "@/lib/local-uat-store";
import { getTripForUser } from "@/lib/trips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { ItineraryDayEditor } from "@/components/trips/itinerary-day-editor";
import { regenerateTripDaysAction, updateTripDaysAction } from "./actions";

export const dynamic = "force-dynamic";

type TripItineraryPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TripItineraryPage({
  params,
  searchParams,
}: TripItineraryPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const wasGenerated = query?.generated === "1";
  const hasItineraryError = query?.itinerary_error === "1";
  const isLocalUatTrip = isLocalTripId(id);
  const { trip, error: tripError } = await getTripForUser(id, user.id);
  const { tripDays, error: itineraryError } = await listTripDaysForUser(
    id,
    user.id,
  );

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user.email} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" className="px-0">
              <Link href={`/trips/${id}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to trip
              </Link>
            </Button>
            <div className="space-y-2">
              <Badge>Draft itinerary</Badge>
              <h1 className="text-3xl font-bold tracking-normal">
                {trip?.country_name ?? "Trip itinerary"}
              </h1>
              <p className="max-w-2xl leading-7 text-muted-foreground">
                Turn city allocations into a day-by-day planning canvas for
                activities, bookings, and budget decisions.
              </p>
            </div>
          </div>

          {trip ? (
            <form action={regenerateTripDaysAction}>
              <input name="trip_id" type="hidden" value={trip.id} />
              <Button type="submit">
                <RefreshCw className="h-4 w-4" />
                Generate days
              </Button>
            </form>
          ) : null}
        </div>

        {wasGenerated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Itinerary days generated from the current city allocation.
          </div>
        ) : null}

        {isLocalUatTrip ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            Itinerary saved in local UAT fallback mode. Apply the Supabase
            itinerary migrations before production or cross-computer testing.
          </div>
        ) : null}

        {hasItineraryError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            Itinerary days could not be generated. Confirm the itinerary
            migration has been applied.
          </div>
        ) : null}

        {tripError ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Trip could not load</CardTitle>
              <CardDescription className="text-amber-900">
                {tripError}. Confirm all Supabase migrations have been applied.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {trip ? (
          <>
            <section className="grid gap-4 md:grid-cols-3" aria-label="Itinerary facts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Trip length
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {trip.total_days} days across {trip.trip_cities.length} city
                  {trip.trip_cities.length === 1 ? "" : "s"}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Prepared days
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {tripDays.length} of {trip.total_days} days generated
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Source allocation</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {trip.trip_cities
                    .map((city) => `${city.city_name}: ${city.days_in_city}d`)
                    .join(" · ")}
                </CardContent>
              </Card>
            </section>

            {itineraryError ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle>Itinerary could not load</CardTitle>
                  <CardDescription className="text-amber-900">
                    {itineraryError}. Apply the itinerary migration, then
                    generate days again.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}

            {!itineraryError && tripDays.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No itinerary days yet</CardTitle>
                  <CardDescription>
                    Generate days from the city allocation to create the first
                    planning canvas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={regenerateTripDaysAction}>
                    <input name="trip_id" type="hidden" value={trip.id} />
                    <Button type="submit">
                      <RefreshCw className="h-4 w-4" />
                      Generate itinerary days
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            {!itineraryError && tripDays.length > 0 ? (
              <ItineraryDayEditor
                action={updateTripDaysAction}
                localeCode={trip.planning_locale}
                tripDays={tripDays}
                tripId={trip.id}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
