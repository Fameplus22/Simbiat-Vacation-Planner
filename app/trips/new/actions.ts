"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  type TripDraftInput,
  parseTripDraftForm,
} from "@/lib/trip-draft-input";
import { canUseLocalUatStore, createLocalTrip } from "@/lib/local-uat-store";

function isSchemaBehindError(message?: string) {
  return Boolean(
    message &&
      (message.includes("schema cache") ||
        message.includes("Could not find") ||
        message.includes("column")),
  );
}

async function insertBasicTrip(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  input: TripDraftInput,
) {
  return supabase
    .from("trips")
    .insert({
      user_id: userId,
      country_name: input.countryName,
      total_days: input.totalDays,
      status: "draft",
    })
    .select("id")
    .single();
}

async function createLocalUatTrip(userId: string, input: TripDraftInput) {
  if (!canUseLocalUatStore()) {
    return null;
  }

  return createLocalTrip(userId, input);
}

export async function createTripDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
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

  let savedWithLimitedSchema = false;
  let { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      country_name: input.countryName,
      total_days: input.totalDays,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      traveler_count: input.travelerCount,
      budget_amount: input.budgetAmount,
      currency_code: input.currencyCode,
      planning_locale: input.planningLocale,
      notes: input.notes,
      status: "draft",
    })
    .select("id")
    .single();

  if (tripError && isSchemaBehindError(tripError.message)) {
    const basicResult = await insertBasicTrip(supabase, user.id, input);
    trip = basicResult.data;
    tripError = basicResult.error;
    savedWithLimitedSchema = true;
  }

  if (tripError && isSchemaBehindError(tripError.message)) {
    const localTrip = await createLocalUatTrip(user.id, input);

    if (localTrip) {
      revalidatePath("/dashboard");
      redirect(`/trips/${localTrip.id}?created=1&local=1`);
    }
  }

  if (tripError || !trip) {
    return {
      status: "error",
      message:
        tripError?.message ??
        "The trip could not be saved. Confirm the Supabase migration is applied.",
    };
  }

  const cityRows = input.cityRows.map((city) => ({
    trip_id: trip.id,
    user_id: user.id,
    city_name: city.cityName,
    days_in_city: city.daysInCity,
    sort_order: city.sortOrder,
  }));

  const { error: cityError } = await supabase.from("trip_cities").insert(cityRows);

  if (cityError) {
    await supabase.from("trips").delete().eq("id", trip.id).eq("user_id", user.id);

    if (isSchemaBehindError(cityError.message)) {
      const localTrip = await createLocalUatTrip(user.id, input);

      if (localTrip) {
        revalidatePath("/dashboard");
        redirect(`/trips/${localTrip.id}?created=1&local=1`);
      }
    }

    return {
      status: "error",
      message:
        cityError.message ??
        "The trip cities could not be saved. Confirm the Supabase migration is applied.",
    };
  }

  revalidatePath("/dashboard");
  redirect(
    `/trips/${trip.id}?created=1${savedWithLimitedSchema ? "&limited=1" : ""}`,
  );
}
