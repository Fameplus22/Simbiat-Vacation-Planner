# Lane B: Global Product Build

Lane B moves Vacation Planner from a secure foundation toward a commercial global travel-planning product.

## Product Direction

The product must support travelers across countries, languages, currencies, travel party sizes, flexible dates, and budget expectations. Phase 2 starts with the data and UI primitives that future recommendations, pricing, bookings, and payments will depend on.

## Added In This Slice

- Planning language selection.
- Multi-currency selection.
- Estimated budget field.
- Trip dates and traveler count.
- Trip notes for constraints and preferences.
- Protected trip detail page.
- Second migration extending `profiles` and `trips` for global planning fields.
- Protected draft trip edit page at `/trips/[id]/edit`.
- Shared server-side trip draft validation for create and edit.
- Third migration with `public.update_trip_draft(...)` so trip fields and city allocations update atomically under RLS.
- Protected itinerary page at `/trips/[id]/itinerary`.
- Fourth migration with `trip_days` and `public.regenerate_trip_days(...)` to create day-by-day planning rows from city allocations.

## Next Commercial Slices

- Localization files and translated UI strings.
- Currency conversion provider behind a server-side adapter.
- Editable day notes, activity blocks, and transit placeholders on itinerary days.
- Trip status lifecycle beyond `draft`.
- Real-time collaboration model and access control.
- Activity/hotel/flight provider abstraction.
- Payment packaging and entitlement model.
- Support/admin tooling with privacy boundaries.
