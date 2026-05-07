import { type ActionState } from "@/lib/action-state";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  isSupportedCurrency,
  isSupportedLocale,
} from "@/lib/globalization";

export type TripCityInput = {
  cityName: string;
  daysInCity: number;
  sortOrder: number;
};

export type TripDraftInput = {
  countryName: string;
  totalDays: number;
  startsOn: string | null;
  endsOn: string | null;
  travelerCount: number;
  budgetAmount: number | null;
  currencyCode: string;
  planningLocale: string;
  notes: string | null;
  cityRows: TripCityInput[];
};

type ParseResult =
  | {
      input: TripDraftInput;
      state: null;
    }
  | {
      input: null;
      state: ActionState;
    };

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getAllStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseBudget(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function parseTripDraftForm(formData: FormData): ParseResult {
  const countryName = getString(formData, "country_name");
  const totalDays = parsePositiveInteger(getString(formData, "total_days"));
  const travelerCount = parsePositiveInteger(getString(formData, "traveler_count"));
  const startsOnInput = getString(formData, "starts_on");
  const endsOnInput = getString(formData, "ends_on");
  const startsOn = startsOnInput || null;
  const endsOn = endsOnInput || null;
  const budgetInput = getString(formData, "budget_amount");
  const budgetAmount = parseBudget(budgetInput);
  const currencyCodeInput = getString(formData, "currency_code").toUpperCase();
  const planningLocaleInput = getString(formData, "planning_locale").toLowerCase();
  const currencyCode = isSupportedCurrency(currencyCodeInput)
    ? currencyCodeInput
    : DEFAULT_CURRENCY;
  const planningLocale = isSupportedLocale(planningLocaleInput)
    ? planningLocaleInput
    : DEFAULT_LOCALE;
  const notes = getString(formData, "notes") || null;
  const cityNames = getAllStrings(formData, "city_name");
  const cityDays = getAllStrings(formData, "days_in_city").map(parsePositiveInteger);
  const rowCount = Math.max(cityNames.length, cityDays.length);
  const fieldErrors: Record<string, string> = {};

  if (countryName.length < 2 || countryName.length > 120) {
    fieldErrors.country_name = "Enter a destination country from 2 to 120 characters.";
  }

  if (!totalDays || totalDays > 365) {
    fieldErrors.total_days = "Enter a total trip length from 1 to 365 days.";
  }

  if (!travelerCount || travelerCount > 99) {
    fieldErrors.traveler_count = "Enter a traveler count from 1 to 99.";
  }

  if (startsOnInput && !isDateInput(startsOnInput)) {
    fieldErrors.starts_on = "Enter a valid start date.";
  }

  if (endsOnInput && !isDateInput(endsOnInput)) {
    fieldErrors.ends_on = "Enter a valid end date.";
  }

  if (startsOn && endsOn && endsOn < startsOn) {
    fieldErrors.ends_on = "End date cannot be before the start date.";
  }

  if (budgetInput && budgetAmount === null) {
    fieldErrors.budget_amount = "Enter a valid budget amount or leave it blank.";
  }

  if (budgetAmount !== null && budgetAmount > 9999999999.99) {
    fieldErrors.budget_amount = "Enter a budget below 10,000,000,000.";
  }

  if (!isSupportedCurrency(currencyCodeInput)) {
    fieldErrors.currency_code = "Choose a supported currency.";
  }

  if (!isSupportedLocale(planningLocaleInput)) {
    fieldErrors.planning_locale = "Choose a supported planning language.";
  }

  if (notes && notes.length > 2000) {
    fieldErrors.notes = "Keep planning notes under 2,000 characters.";
  }

  const cityRows = Array.from({ length: rowCount }, (_, index) => ({
    cityName: cityNames[index] ?? "",
    daysInCity: cityDays[index] ?? null,
    sortOrder: index,
  }));

  if (cityRows.length === 0) {
    fieldErrors.city_name = "Add at least one city.";
  }

  if (
    cityRows.some(
      (city) => city.cityName.length < 1 || city.cityName.length > 120,
    )
  ) {
    fieldErrors.city_name = "Each city name must be 1 to 120 characters.";
  }

  if (cityRows.some((city) => !city.daysInCity || city.daysInCity > 365)) {
    fieldErrors.days_in_city = "Each city needs 1 to 365 days.";
  }

  const allocatedDays = cityRows.reduce<number>(
    (sum, city) => sum + (city.daysInCity ?? 0),
    0,
  );

  if (totalDays && allocatedDays !== totalDays) {
    fieldErrors.days_in_city =
      "The city day allocation must equal the total trip days.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      input: null,
      state: {
        status: "error",
        message: "Fix the highlighted fields before saving this draft.",
        fieldErrors,
      },
    };
  }

  return {
    input: {
      countryName,
      totalDays: totalDays as number,
      startsOn,
      endsOn,
      travelerCount: travelerCount as number,
      budgetAmount,
      currencyCode,
      planningLocale,
      notes,
      cityRows: cityRows.map((city) => ({
        cityName: city.cityName,
        daysInCity: city.daysInCity as number,
        sortOrder: city.sortOrder,
      })),
    },
    state: null,
  };
}
