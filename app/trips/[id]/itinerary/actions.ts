"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getString } from "@/lib/trip-draft-input";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function regenerateTripDaysAction(formData: FormData) {
  await requireUser();
  const tripId = getString(formData, "trip_id");

  if (!UUID_PATTERN.test(tripId)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("regenerate_trip_days", {
    p_trip_id: tripId,
  });

  if (error) {
    redirect(`/trips/${tripId}/itinerary?itinerary_error=1`);
  }

  revalidatePath(`/trips/${tripId}/itinerary`);
  redirect(`/trips/${tripId}/itinerary?generated=1`);
}
