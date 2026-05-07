import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";

import { formatCurrency, formatTripDate } from "@/lib/globalization";
import { type TripSummary } from "@/lib/trips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TripCardProps = {
  trip: TripSummary;
};

export function TripCard({ trip }: TripCardProps) {
  const cityLabel =
    trip.trip_cities.length > 0
      ? trip.trip_cities.map((city) => city.city_name).join(", ")
      : "No cities added";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {trip.country_name}
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{cityLabel}</p>
        </div>
        <Badge>Draft</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatTripDate(trip.starts_on, trip.planning_locale)} -{" "}
            {formatTripDate(trip.ends_on, trip.planning_locale)}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {trip.traveler_count} traveler{trip.traveler_count === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="text-sm font-medium text-foreground">
            {trip.total_days} days ·{" "}
            {formatCurrency(
              trip.budget_amount === null ? null : Number(trip.budget_amount),
              trip.currency_code,
              trip.planning_locale,
            )}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/trips/${trip.id}`}>Open trip</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
