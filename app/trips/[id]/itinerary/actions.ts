"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import {
  canUseLocalUatStore,
  generateLocalTripDays,
  isLocalTripId,
  LOCAL_DAY_ID_PREFIX,
  updateLocalTripDays,
} from "@/lib/local-uat-store";
import { createClient } from "@/lib/supabase/server";
import { getString } from "@/lib/trip-draft-input";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSupportedTripId(tripId: string) {
  return (
    UUID_PATTERN.test(tripId) ||
    (canUseLocalUatStore() && isLocalTripId(tripId))
  );
}

function isSupportedDayId(dayId: string, tripId: string) {
  if (UUID_PATTERN.test(dayId)) {
    return true;
  }

  return (
    canUseLocalUatStore() &&
    isLocalTripId(tripId) &&
    dayId.startsWith(LOCAL_DAY_ID_PREFIX)
  );
}

export async function regenerateTripDaysAction(formData: FormData) {
  const user = await requireUser();
  const tripId = getString(formData, "trip_id");

  if (!isSupportedTripId(tripId)) {
    redirect("/dashboard");
  }

  if (canUseLocalUatStore() && isLocalTripId(tripId)) {
    const generatedDays = await generateLocalTripDays(tripId, user.id);

    if (!generatedDays) {
      redirect(`/trips/${tripId}/itinerary?itinerary_error=1`);
    }

    revalidatePath(`/trips/${tripId}/itinerary`);
    redirect(`/trips/${tripId}/itinerary?generated=1&local=1`);
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

function getAllStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

export async function updateTripDaysAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const tripId = getString(formData, "trip_id");
  const dayIds = getAllStrings(formData, "day_id");
  const dayTitles = getAllStrings(formData, "day_title");
  const dayNotes = getAllStrings(formData, "day_notes");
  const fieldErrors: Record<string, string> = {};

  if (!isSupportedTripId(tripId)) {
    return {
      status: "error",
      message: "This trip could not be identified. Return to the dashboard and try again.",
    };
  }

  if (
    dayIds.length === 0 ||
    dayIds.length !== dayTitles.length ||
    dayIds.length !== dayNotes.length
  ) {
    return {
      status: "error",
      message: "Refresh the itinerary and try again.",
    };
  }

  if (dayIds.some((id) => !isSupportedDayId(id, tripId))) {
    return {
      status: "error",
      message: "One itinerary day could not be identified. Refresh and try again.",
    };
  }

  if (dayTitles.some((title) => title.length < 1 || title.length > 160)) {
    fieldErrors.day_title = "Each day title must be 1 to 160 characters.";
  }

  if (dayNotes.some((notes) => notes.length > 2000)) {
    fieldErrors.day_notes = "Keep each day note under 2,000 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Fix the highlighted itinerary fields before saving.",
      fieldErrors,
    };
  }

  if (canUseLocalUatStore() && isLocalTripId(tripId)) {
    const updatedCount = await updateLocalTripDays(
      tripId,
      user.id,
      dayIds,
      dayTitles,
      dayNotes,
    );

    if (updatedCount === null) {
      return {
        status: "error",
        message: "The local itinerary could not be saved. Refresh and try again.",
      };
    }

    revalidatePath(`/trips/${tripId}/itinerary`);

    return {
      status: "success",
      message: "Itinerary day details saved for local UAT.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_trip_day_details", {
    p_trip_id: tripId,
    p_day_ids: dayIds,
    p_titles: dayTitles,
    p_notes: dayNotes,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message ??
        "The itinerary could not be saved. Confirm all itinerary migrations are applied.",
    };
  }

  revalidatePath(`/trips/${tripId}/itinerary`);

  return {
    status: "success",
    message: "Itinerary day details saved.",
  };
}
