import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { type TripDraftInput } from "@/lib/trip-draft-input";
import { type TripSummary } from "@/lib/trips";

export const LOCAL_TRIP_ID_PREFIX = "local-uat-";
export const LOCAL_DAY_ID_PREFIX = `${LOCAL_TRIP_ID_PREFIX}day-`;

type LocalTripRecord = TripSummary & {
  user_id: string;
};

export type LocalTripDayRecord = {
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

type LocalUatStore = {
  trips: LocalTripRecord[];
  tripDays: LocalTripDayRecord[];
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
    const parsed = JSON.parse(content) as Partial<LocalUatStore>;

    return {
      trips: parsed.trips ?? [],
      tripDays: parsed.tripDays ?? [],
    };
  } catch {
    return { trips: [], tripDays: [] };
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

function allocationSignature(trip: LocalTripRecord) {
  return trip.trip_cities
    .map((city) => `${city.sort_order}:${city.city_name}:${city.days_in_city}`)
    .join("|");
}

function buildTripDays(
  trip: LocalTripRecord,
  existingDays: LocalTripDayRecord[],
) {
  const now = new Date().toISOString();
  const existingByDayNumber = new Map(
    existingDays.map((day) => [day.day_number, day]),
  );
  const generatedDays: LocalTripDayRecord[] = [];
  let dayNumber = 1;

  for (const city of [...trip.trip_cities].sort(
    (a, b) => a.sort_order - b.sort_order,
  )) {
    for (
      let cityDay = 0;
      cityDay < city.days_in_city && dayNumber <= trip.total_days;
      cityDay += 1
    ) {
      const previous = existingByDayNumber.get(dayNumber);
      generatedDays.push({
        id: previous?.id ?? `${LOCAL_DAY_ID_PREFIX}${randomUUID()}`,
        trip_id: trip.id,
        user_id: trip.user_id,
        day_number: dayNumber,
        city_name: city.city_name,
        title: previous?.title ?? `Day ${dayNumber} in ${city.city_name}`,
        notes: previous?.notes ?? null,
        created_at: previous?.created_at ?? now,
        updated_at: now,
      });
      dayNumber += 1;
    }
  }

  while (dayNumber <= trip.total_days) {
    const previous = existingByDayNumber.get(dayNumber);
    generatedDays.push({
      id: previous?.id ?? `${LOCAL_DAY_ID_PREFIX}${randomUUID()}`,
      trip_id: trip.id,
      user_id: trip.user_id,
      day_number: dayNumber,
      city_name: "Unassigned",
      title: previous?.title ?? `Day ${dayNumber}`,
      notes: previous?.notes ?? null,
      created_at: previous?.created_at ?? now,
      updated_at: now,
    });
    dayNumber += 1;
  }

  return generatedDays;
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
  const nextTrip = {
    ...tripFromInput(userId, input, tripId),
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };
  const allocationChanged =
    allocationSignature(existing) !== allocationSignature(nextTrip);

  store.trips[index] = nextTrip;

  if (allocationChanged) {
    store.tripDays = store.tripDays.filter((day) => day.trip_id !== tripId);
  }

  await writeStore(store);
  return store.trips[index];
}

export async function generateLocalTripDays(tripId: string, userId: string) {
  const store = await readStore();
  const trip = store.trips.find(
    (record) => record.id === tripId && record.user_id === userId,
  );

  if (!trip) {
    return null;
  }

  const existingDays = store.tripDays.filter(
    (day) => day.trip_id === tripId && day.user_id === userId,
  );
  const generatedDays = buildTripDays(trip, existingDays);

  store.tripDays = [
    ...store.tripDays.filter((day) => day.trip_id !== tripId),
    ...generatedDays,
  ];
  await writeStore(store);

  return generatedDays;
}

export async function updateLocalTripDays(
  tripId: string,
  userId: string,
  dayIds: string[],
  dayTitles: string[],
  dayNotes: string[],
) {
  const store = await readStore();
  const tripExists = store.trips.some(
    (trip) => trip.id === tripId && trip.user_id === userId,
  );

  if (!tripExists) {
    return null;
  }

  const requestedUpdates = new Map(
    dayIds.map((dayId, index) => [
      dayId,
      {
        title: dayTitles[index],
        notes: dayNotes[index] || null,
      },
    ]),
  );
  const matchedDayIds = new Set<string>();
  const now = new Date().toISOString();

  store.tripDays = store.tripDays.map((day) => {
    if (day.trip_id !== tripId || day.user_id !== userId) {
      return day;
    }

    const update = requestedUpdates.get(day.id);

    if (!update) {
      return day;
    }

    matchedDayIds.add(day.id);

    return {
      ...day,
      title: update.title,
      notes: update.notes,
      updated_at: now,
    };
  });

  if (matchedDayIds.size !== requestedUpdates.size) {
    return null;
  }

  await writeStore(store);

  return matchedDayIds.size;
}

export async function listLocalTripDays(tripId: string, userId: string) {
  const store = await readStore();
  return store.tripDays
    .filter((day) => day.trip_id === tripId && day.user_id === userId)
    .sort((a, b) => a.day_number - b.day_number);
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
