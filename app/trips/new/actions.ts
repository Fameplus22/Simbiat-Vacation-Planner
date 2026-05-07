"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function createTripDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const countryName = getString(formData, "country_name");
  const totalDays = parsePositiveInteger(getString(formData, "total_days"));
  const cityNames = formData
    .getAll("city_name")
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
  const cityDays = formData
    .getAll("days_in_city")
    .map((value) =>
      typeof value === "string" ? parsePositiveInteger(value) : null,
    );

  const fieldErrors: Record<string, string> = {};

  if (countryName.length < 2) {
    fieldErrors.country_name = "Enter the destination country.";
  }

  if (!totalDays || totalDays > 365) {
    fieldErrors.total_days = "Enter a total trip length from 1 to 365 days.";
  }

  if (cityNames.length === 0) {
    fieldErrors.city_name = "Add at least one city.";
  }

  if (cityDays.some((days) => !days)) {
    fieldErrors.days_in_city = "Each city needs at least one day.";
  }

  const allocatedDays = cityDays.reduce<number>(
    (sum, days) => sum + (days ?? 0),
    0,
  );

  if (totalDays && allocatedDays !== totalDays) {
    fieldErrors.days_in_city =
      "The city day allocation must equal the total trip days.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Fix the highlighted fields before saving this draft.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      country_name: countryName,
      total_days: totalDays,
      status: "draft",
    })
    .select("id")
    .single();

  if (tripError || !trip) {
    return {
      status: "error",
      message:
        tripError?.message ??
        "The trip could not be saved. Confirm the Supabase migration is applied.",
    };
  }

  const cityRows = cityNames.map((cityName, index) => ({
    trip_id: trip.id,
    user_id: user.id,
    city_name: cityName,
    days_in_city: cityDays[index],
    sort_order: index,
  }));

  const { error: cityError } = await supabase.from("trip_cities").insert(cityRows);

  if (cityError) {
    await supabase.from("trips").delete().eq("id", trip.id).eq("user_id", user.id);

    return {
      status: "error",
      message:
        cityError.message ??
        "The trip cities could not be saved. Confirm the Supabase migration is applied.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?created=1");
}
