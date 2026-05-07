import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  Landmark,
  Pencil,
  Users,
} from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { formatCurrency, formatTripDate } from "@/lib/globalization";
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

export const dynamic = "force-dynamic";

type TripDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TripDetailPage({
  params,
  searchParams,
}: TripDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const wasCreated = query?.created === "1";
  const wasUpdated = query?.updated === "1";
  const { trip, error } = await getTripForUser(id, user.id);

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user.email} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" className="px-0">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <div className="space-y-2">
              <Badge>Draft</Badge>
              <h1 className="text-3xl font-bold tracking-normal">
                {trip?.country_name ?? "Trip unavailable"}
              </h1>
              <p className="max-w-2xl leading-7 text-muted-foreground">
                A global-ready trip workspace with dates, currency, language,
                travelers, and city allocation in one place.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {trip ? (
              <Button asChild variant="outline">
                <Link href={`/trips/${trip.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit draft
                </Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href="/trips/new">Plan another trip</Link>
            </Button>
          </div>
        </div>

        {wasCreated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Draft trip saved. Review the details below.
          </div>
        ) : null}

        {wasUpdated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Draft trip updated. The dashboard and detail view now reflect the
            latest plan.
          </div>
        ) : null}

        {error ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Trip could not load</CardTitle>
              <CardDescription className="text-amber-900">
                {error}. Confirm all Supabase migrations have been applied.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {trip ? (
          <>
            <section className="grid gap-4 md:grid-cols-4" aria-label="Trip facts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {formatTripDate(trip.starts_on, trip.planning_locale)} -{" "}
                  {formatTripDate(trip.ends_on, trip.planning_locale)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Travelers
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {trip.traveler_count} traveler
                  {trip.traveler_count === 1 ? "" : "s"} · {trip.total_days} days
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark className="h-4 w-4 text-primary" />
                    Budget
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {formatCurrency(
                    trip.budget_amount === null ? null : Number(trip.budget_amount),
                    trip.currency_code,
                    trip.planning_locale,
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe2 className="h-4 w-4 text-primary" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {trip.planning_locale.toUpperCase()} · {trip.currency_code}
                </CardContent>
              </Card>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardHeader>
                  <CardTitle>City allocation</CardTitle>
                  <CardDescription>
                    City days should add up to the total trip length.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.trip_cities.map((city) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3"
                      key={city.id}
                    >
                      <div>
                        <p className="font-semibold">{city.city_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stop {city.sort_order + 1}
                        </p>
                      </div>
                      <Badge>{city.days_in_city} days</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Planning notes</CardTitle>
                  <CardDescription>
                    Use this space for constraints that will drive Phase 2
                    recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {trip.notes || "No notes yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
