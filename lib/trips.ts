import { notFound } from "next/navigation";

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
  starts_on: string | null;
  ends_on: string | null;
  traveler_count: number;
  budget_amount: number | null;
  currency_code: string;
  planning_locale: string;
  notes: string | null;
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
      "id,country_name,total_days,starts_on,ends_on,traveler_count,budget_amount,currency_code,planning_locale,notes,status,created_at,updated_at,trip_cities(id,city_name,days_in_city,sort_order)",
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

export async function getTripForUser(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(
      "id,country_name,total_days,starts_on,ends_on,traveler_count,budget_amount,currency_code,planning_locale,notes,status,created_at,updated_at,trip_cities(id,city_name,days_in_city,sort_order)",
    )
    .eq("id", tripId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return { trip: null, error: error.message };
  }

  if (!data) {
    notFound();
  }

  const trip = data as TripSummary;

  return {
    trip: {
      ...trip,
      trip_cities: [...(trip.trip_cities ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    },
    error: null,
  };
}
