import { CalendarDays, MapPin } from "lucide-react";

import { type TripSummary } from "@/lib/trips";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {trip.total_days} total days
        </div>
        <div className="text-sm font-medium text-foreground">
          {trip.trip_cities.reduce((sum, city) => sum + city.days_in_city, 0)} days allocated
        </div>
      </CardContent>
    </Card>
  );
}
