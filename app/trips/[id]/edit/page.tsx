import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getTripForUser } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { TripForm } from "@/components/trips/trip-form";
import { updateTripDraftAction } from "./actions";

export const dynamic = "force-dynamic";

type EditTripPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { trip, error } = await getTripForUser(id, user.id);

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user.email} />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="px-0">
          <Link href={`/trips/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to trip
          </Link>
        </Button>

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
          <Card>
            <CardHeader>
              <CardTitle>Edit draft trip</CardTitle>
              <CardDescription>
                Update the draft details that will power live planning,
                recommendations, and budget workflows in the next lane.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TripForm
                action={updateTripDraftAction}
                cancelHref={`/trips/${trip.id}`}
                initialValues={{
                  tripId: trip.id,
                  countryName: trip.country_name,
                  totalDays: trip.total_days,
                  startsOn: trip.starts_on,
                  endsOn: trip.ends_on,
                  travelerCount: trip.traveler_count,
                  budgetAmount:
                    trip.budget_amount === null
                      ? null
                      : Number(trip.budget_amount),
                  currencyCode: trip.currency_code,
                  planningLocale: trip.planning_locale,
                  notes: trip.notes,
                  cities: trip.trip_cities.map((city) => ({
                    id: city.id,
                    cityName: city.city_name,
                    days: city.days_in_city,
                  })),
                }}
                submitLabel="Update draft trip"
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
