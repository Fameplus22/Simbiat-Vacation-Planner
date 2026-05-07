"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState } from "react";

import { type ActionState, idleActionState } from "@/lib/action-state";
import { type TripDaySummary } from "@/lib/itinerary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ItineraryDayEditorProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  localeCode: string;
  tripDays: TripDaySummary[];
  tripId: string;
};

export function ItineraryDayEditor({
  action,
  localeCode,
  tripDays,
  tripId,
}: ItineraryDayEditorProps) {
  const [state, formAction, isPending] = useActionState(action, idleActionState);

  return (
    <form action={formAction} className="space-y-5">
      <input name="trip_id" type="hidden" value={tripId} />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Itinerary days">
        {tripDays.map((day) => (
          <Card key={day.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Day {day.day_number}</CardTitle>
                  <CardDescription>{day.city_name}</CardDescription>
                </div>
                <Badge>{localeCode.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <input name="day_id" type="hidden" value={day.id} />

              <div className="space-y-2">
                <Label htmlFor={`day-${day.id}-title`}>Day title</Label>
                <Input
                  defaultValue={day.title}
                  id={`day-${day.id}-title`}
                  maxLength={160}
                  name="day_title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`day-${day.id}-notes`}>Day notes</Label>
                <Textarea
                  defaultValue={day.notes ?? ""}
                  id={`day-${day.id}-notes`}
                  maxLength={2000}
                  name="day_notes"
                  placeholder="Activities, meals, transit, booking details, accessibility needs, or local reminders."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {state.fieldErrors?.day_title || state.fieldErrors?.day_notes ? (
        <p className="text-sm font-medium text-destructive">
          {state.fieldErrors.day_title ?? state.fieldErrors.day_notes}
        </p>
      ) : null}

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          }
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save itinerary details
        </Button>
      </div>
    </form>
  );
}
