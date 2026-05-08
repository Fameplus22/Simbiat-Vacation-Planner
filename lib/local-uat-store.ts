import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { type TripDraftInput } from "@/lib/trip-draft-input";
import { type TripSummary } from "@/lib/trips";

export const LOCAL_TRIP_ID_PREFIX = "local-uat-";

type LocalTripRecord = TripSummary & {
  user_id: string;
};

type LocalUatStore = {
  trips: LocalTripRecord[];
};

const STORE_DIR = path.join(process.cwd(), ".local-uat-data");
const STORE_PATH = path.join(STORE_DIR, "trips.json");

export function canUseLocalUatStore() {
  return process.env.NODE_ENV !== "production";
}

export function isLocalTripId(tripId: string) {
  return tripId.startsWith(LOCAL_TRIP_ID_PREFIX);
}

async function readStore(): Promise<LocalUatStore> {
  try {
    const content = await readFile(STORE_PATH, "utf8");
    return JSON.parse(content) as LocalUatStore;
  } catch {
    return { trips: [] };
  }
}

async function writeStore(store: LocalUatStore) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function tripFromInput(userId: string, input: TripDraftInput, tripId?: string) {
  const now = new Date().toISOString();

  return {
    id: tripId ?? `${LOCAL_TRIP_ID_PREFIX}${randomUUID()}`,
    user_id: userId,
    country_name: input.countryName,
    total_days: input.totalDays,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    traveler_count: input.travelerCount,
    budget_amount: input.budgetAmount,
    currency_code: input.currencyCode,
    planning_locale: input.planningLocale,
    notes: input.notes,
    status: "draft" as const,
    created_at: now,
    updated_at: now,
    trip_cities: input.cityRows.map((city) => ({
      id: `${LOCAL_TRIP_ID_PREFIX}city-${randomUUID()}`,
      city_name: city.cityName,
      days_in_city: city.daysInCity,
      sort_order: city.sortOrder,
    })),
  };
}

export async function createLocalTrip(userId: string, input: TripDraftInput) {
  const store = await readStore();
  const trip = tripFromInput(userId, input);
  store.trips.unshift(trip);
  await writeStore(store);
  return trip;
}

export async function updateLocalTrip(
  tripId: string,
  userId: string,
  input: TripDraftInput,
) {
  const store = await readStore();
  const index = store.trips.findIndex(
    (trip) => trip.id === tripId && trip.user_id === userId,
  );

  if (index === -1) {
    return null;
  }

  const existing = store.trips[index];
  store.trips[index] = {
    ...tripFromInput(userId, input, tripId),
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };
  await writeStore(store);
  return store.trips[index];
}

export async function listLocalTrips(userId: string) {
  const store = await readStore();
  return store.trips
    .filter((trip) => trip.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getLocalTrip(tripId: string, userId: string) {
  const store = await readStore();
  return (
    store.trips.find((trip) => trip.id === tripId && trip.user_id === userId) ??
    null
  );
}
