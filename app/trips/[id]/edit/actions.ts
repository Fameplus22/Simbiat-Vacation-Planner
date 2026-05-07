"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getString, parseTripDraftForm } from "@/lib/trip-draft-input";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateTripDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const tripId = getString(formData, "trip_id");

  if (!UUID_PATTERN.test(tripId)) {
    return {
      status: "error",
      message: "This trip could not be identified. Return to the dashboard and try again.",
    };
  }

  const parsed = parseTripDraftForm(formData);

  if (!parsed.input) {
    return parsed.state;
  }

  const input = parsed.input;
  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({
      preferred_currency: input.currencyCode,
      preferred_locale: input.planningLocale,
    })
    .eq("id", user.id);

  const { error } = await supabase.rpc("update_trip_draft", {
    p_trip_id: tripId,
    p_country_name: input.countryName,
    p_total_days: input.totalDays,
    p_starts_on: input.startsOn,
    p_ends_on: input.endsOn,
    p_traveler_count: input.travelerCount,
    p_budget_amount: input.budgetAmount,
    p_currency_code: input.currencyCode,
    p_planning_locale: input.planningLocale,
    p_notes: input.notes,
    p_city_names: input.cityRows.map((city) => city.cityName),
    p_days_in_city: input.cityRows.map((city) => city.daysInCity),
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message ??
        "The trip could not be updated. Confirm all Supabase migrations are applied.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?updated=1`);
}
