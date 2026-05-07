"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { createTripDraftAction } from "@/app/trips/new/actions";
import { type ActionState, idleActionState } from "@/lib/action-state";
import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/globalization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CityDraft = {
  rowId: string;
  existingId?: string;
  cityName: string;
  days: number;
};

export type TripFormInitialValues = {
  tripId?: string;
  countryName?: string;
  totalDays?: number;
  startsOn?: string | null;
  endsOn?: string | null;
  travelerCount?: number;
  budgetAmount?: number | null;
  currencyCode?: string;
  planningLocale?: string;
  notes?: string | null;
  cities?: {
    id?: string;
    cityName: string;
    days: number;
  }[];
};

type TripFormCityInitialValue = NonNullable<TripFormInitialValues["cities"]>[number];

type TripFormProps = {
  action?: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  cancelHref?: string;
  initialValues?: TripFormInitialValues;
  submitLabel?: string;
};

function createCityDraft(
  index: number,
  city?: TripFormCityInitialValue,
): CityDraft {
  return {
    rowId: city?.id ? `city-${city.id}` : `city-${index}`,
    existingId: city?.id,
    cityName: city?.cityName ?? "",
    days: city?.days ?? 1,
  };
}

export function TripForm({
  action = createTripDraftAction,
  cancelHref = "/dashboard",
  initialValues,
  submitLabel = "Save draft trip",
}: TripFormProps) {
  const [state, formAction, isPending] = useActionState(action, idleActionState);
  const [cities, setCities] = useState<CityDraft[]>(() => {
    if (initialValues?.cities?.length) {
      return initialValues.cities.map((city, index) => createCityDraft(index, city));
    }

    return [createCityDraft(0)];
  });
  const [totalDays, setTotalDays] = useState(initialValues?.totalDays ?? 1);

  const allocatedDays = useMemo(
    () => cities.reduce((sum, city) => sum + Number(city.days || 0), 0),
    [cities],
  );
  const allocationMatches = allocatedDays === totalDays;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {initialValues?.tripId ? (
        <input name="trip_id" type="hidden" value={initialValues.tripId} />
      ) : null}

      <div className="grid gap-5 md:grid-cols-[1fr_180px_180px]">
        <div className="space-y-2">
          <Label htmlFor="country_name">Destination country</Label>
          <Input
            defaultValue={initialValues?.countryName ?? ""}
            id="country_name"
            name="country_name"
            placeholder="Portugal"
            aria-describedby={
              state.fieldErrors?.country_name ? "country-error" : undefined
            }
            required
          />
          {state.fieldErrors?.country_name ? (
            <p className="text-sm font-medium text-destructive" id="country-error">
              {state.fieldErrors.country_name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="traveler_count">Travelers</Label>
          <Input
            defaultValue={initialValues?.travelerCount ?? 1}
            id="traveler_count"
            max={99}
            min={1}
            name="traveler_count"
            type="number"
            required
          />
          {state.fieldErrors?.traveler_count ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.traveler_count}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_days">Total days</Label>
          <Input
            id="total_days"
            min={1}
            max={365}
            name="total_days"
            onChange={(event) => setTotalDays(Number(event.target.value || 0))}
            type="number"
            value={totalDays}
            required
          />
          {state.fieldErrors?.total_days ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.total_days}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starts_on">Start date</Label>
          <Input
            defaultValue={initialValues?.startsOn ?? ""}
            id="starts_on"
            name="starts_on"
            type="date"
          />
          {state.fieldErrors?.starts_on ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.starts_on}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_on">End date</Label>
          <Input
            defaultValue={initialValues?.endsOn ?? ""}
            id="ends_on"
            name="ends_on"
            type="date"
          />
          {state.fieldErrors?.ends_on ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.ends_on}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_180px_220px]">
        <div className="space-y-2">
          <Label htmlFor="budget_amount">Estimated budget</Label>
          <Input
            defaultValue={initialValues?.budgetAmount ?? ""}
            id="budget_amount"
            min={0}
            name="budget_amount"
            placeholder="5000"
            step="0.01"
            type="number"
          />
          {state.fieldErrors?.budget_amount ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.budget_amount}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency_code">Currency</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={initialValues?.currencyCode ?? "USD"}
            id="currency_code"
            name="currency_code"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
          {state.fieldErrors?.currency_code ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.currency_code}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="planning_locale">Planning language</Label>
          <select
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={initialValues?.planningLocale ?? "en"}
            id="planning_locale"
            name="planning_locale"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.planning_locale ? (
            <p className="text-sm font-medium text-destructive">
              {state.fieldErrors.planning_locale}
            </p>
          ) : null}
        </div>
      </div>

      <section className="space-y-4" aria-labelledby="cities-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold" id="cities-heading">
              Cities and day allocation
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Add each city and make the allocated days match the trip length.
            </p>
          </div>
          <Button
            onClick={() =>
              setCities((current) => [
                ...current,
                {
                  ...createCityDraft(current.length),
                  rowId: `city-${Date.now()}-${current.length}`,
                },
              ])
            }
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add city
          </Button>
        </div>

        <div className="space-y-3">
          {cities.map((city, index) => (
            <div
              className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_140px_44px]"
              key={city.rowId}
            >
              <input name="trip_city_id" type="hidden" value={city.existingId ?? ""} />
              <div className="space-y-2">
                <Label htmlFor={`${city.rowId}-name`}>City {index + 1}</Label>
                <Input
                  id={`${city.rowId}-name`}
                  name="city_name"
                  onChange={(event) => {
                    const value = event.target.value;
                    setCities((current) =>
                      current.map((item) =>
                        item.rowId === city.rowId
                          ? { ...item, cityName: value }
                          : item,
                      ),
                    );
                  }}
                  placeholder="Lisbon"
                  value={city.cityName}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${city.rowId}-days`}>Days</Label>
                <Input
                  id={`${city.rowId}-days`}
                  min={1}
                  name="days_in_city"
                  onChange={(event) => {
                    const value = Number(event.target.value || 0);
                    setCities((current) =>
                      current.map((item) =>
                        item.rowId === city.rowId
                          ? { ...item, days: value }
                          : item,
                      ),
                    );
                  }}
                  type="number"
                  value={city.days}
                  required
                />
              </div>

              <Button
                aria-label={`Remove city ${index + 1}`}
                className="self-end"
                disabled={cities.length === 1}
                onClick={() =>
                  setCities((current) =>
                    current.filter((item) => item.rowId !== city.rowId),
                  )
                }
                type="button"
                variant="ghost"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div
          className={
            allocationMatches
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              : "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900"
          }
          role="status"
        >
          Allocated {allocatedDays} of {totalDays} total days.
        </div>

        {state.fieldErrors?.city_name || state.fieldErrors?.days_in_city ? (
          <p className="text-sm font-medium text-destructive">
            {state.fieldErrors.city_name ?? state.fieldErrors.days_in_city}
          </p>
        ) : null}
      </section>

      <div className="space-y-2">
        <Label htmlFor="notes">Planning notes</Label>
        <Textarea
          defaultValue={initialValues?.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Food priorities, accessibility needs, visa reminders, school schedules, or anything that will shape this trip."
        />
        {state.fieldErrors?.notes ? (
          <p className="text-sm font-medium text-destructive">
            {state.fieldErrors.notes}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button asChild variant="outline">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
