import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const FULL_TRIP_SELECT =
  "id,country_name,total_days,starts_on,ends_on,traveler_count,budget_amount,currency_code,planning_locale,notes,status,created_at,updated_at,trip_cities(id,city_name,days_in_city,sort_order)";

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

function normalizeTrip(trip: Partial<TripSummary>): TripSummary {
  return {
    id: trip.id ?? "",
    country_name: trip.country_name ?? "Trip",
    total_days: trip.total_days ?? 1,
    starts_on: trip.starts_on ?? null,
    ends_on: trip.ends_on ?? null,
    traveler_count: trip.traveler_count ?? 1,
    budget_amount: trip.budget_amount ?? null,
    currency_code: trip.currency_code ?? "USD",
    planning_locale: trip.planning_locale ?? "en",
    notes: trip.notes ?? null,
    status: trip.status ?? "draft",
    created_at: trip.created_at ?? "",
    updated_at: trip.updated_at ?? "",
    trip_cities: [...(trip.trip_cities ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

export async function listTripsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(FULL_TRIP_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      trips: [],
      error: `${error.message}. Real UAT requires the production Supabase migrations; no local test data path is available.`,
    };
  }

  const trips = ((data ?? []) as Partial<TripSummary>[]).map(normalizeTrip);

  return { trips, error: null };
}

export async function getTripForUser(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(FULL_TRIP_SELECT)
    .eq("id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      trip: null,
      error: `${error.message}. Real UAT requires the production Supabase migrations; no local test data path is available.`,
    };
  }

  if (!data) {
    notFound();
  }

  return {
    trip: normalizeTrip(data as Partial<TripSummary>),
    error: null,
  };
}
