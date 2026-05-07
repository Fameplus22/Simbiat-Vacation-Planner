import { createClient } from "@/lib/supabase/server";

export type TripCitySummary = {
  id: string;
  city_name: string;
  days_in_city: number;
  sort_order: number;
};

export type TripSummary = {
  id: string;
  country_name: string;
  total_days: number;
  status: "draft";
  created_at: string;
  updated_at: string;
  trip_cities: TripCitySummary[];
};

export async function listTripsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id,country_name,total_days,status,created_at,updated_at,trip_cities(id,city_name,days_in_city,sort_order)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { trips: [], error: error.message };
  }

  const trips = ((data ?? []) as TripSummary[]).map((trip) => ({
    ...trip,
    trip_cities: [...(trip.trip_cities ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  }));

  return { trips, error: null };
}
