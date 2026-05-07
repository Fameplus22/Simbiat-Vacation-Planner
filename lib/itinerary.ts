import { createClient } from "@/lib/supabase/server";

export type TripDaySummary = {
  id: string;
  trip_id: string;
  user_id: string;
  day_number: number;
  city_name: string;
  title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listTripDaysForUser(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_days")
    .select(
      "id,trip_id,user_id,day_number,city_name,title,notes,created_at,updated_at",
    )
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("day_number", { ascending: true });

  if (error) {
    return { tripDays: [], error: error.message };
  }

  return {
    tripDays: (data ?? []) as TripDaySummary[],
    error: null,
  };
}
