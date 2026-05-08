# Release Notes

## Phase 1 Bootstrap Foundation

- Added a polished public landing page for Vacation Planner.
- Added Supabase email/password sign-up and sign-in pages.
- Added protected dashboard and protected draft trip creation page.
- Added Supabase SSR server/browser/proxy helpers.
- Added server-side auth protection and trip draft Server Action.
- Added SQL migration for `profiles`, `trips`, `trip_cities`, timestamps, RLS, and user-owned policies.
- Removed `.env.local` from Git tracking and added `.env.example`.
- Replaced starter README with product-specific setup documentation.
- Added backlog, bugs, impediments, UAT, release notes, and bootstrap docs.
- Added project email blocker reply code `VP-9CKCBP4Q7F`.
- Updated local dev/build scripts to use Next's Webpack path for this machine's SWC WASM fallback.

## Lane B Global Planning Foundation

- Added planning language and currency constants.
- Extended trip creation with dates, travelers, budget, currency, language, and notes.
- Added protected trip detail page at `/trips/[id]`.
- Added second Supabase migration for global planning fields.
- Added Lane A live-launch and Lane B global-product docs.

## Lane B Editable Drafts

- Added protected draft editing at `/trips/[id]/edit`.
- Refactored trip draft validation into a shared server-side parser.
- Added a Supabase RPC migration for atomic trip draft updates and city allocation replacement under RLS.
- Added edit CTA and update success state on trip detail pages.
- Added favicon metadata and asset to remove the browser favicon 404.
- Updated Lane B docs, backlog, UAT notes, and release trail.

## Lane B Itinerary Foundation

- Added protected itinerary page at `/trips/[id]/itinerary`.
- Added `trip_days` schema, indexes, RLS policies, and grants.
- Added `public.regenerate_trip_days(...)` RPC to generate day rows from city allocation while preserving existing day detail fields.
- Added itinerary CTA to trip detail pages.
- Updated setup, backlog, blocker, and UAT artifacts for the new itinerary migration.

## Lane B Itinerary Editing

- Added editable itinerary day titles and notes on `/trips/[id]/itinerary`.
- Added `public.update_trip_day_details(...)` RPC to save day detail updates transactionally under RLS.
- Added client-side save states for itinerary detail edits.
- Updated Lane B docs, backlog, blocker, and UAT artifacts for the new itinerary editing migration.

## UAT Schema Compatibility Fix

- Added a fallback for Supabase projects that have the Phase 1 trip schema but not the Lane B global-planning columns yet.
- Basic trip creation and editing can now save country, total days, and city allocation before the Lane B migrations are applied.
- Trip dashboard/detail reads now fall back to the basic schema and default missing global fields for local UAT.

## Local UAT Fallback

- Added a development-only local trip store for the current machine when the connected Supabase project is missing the Phase 1 `trips` schema.
- Valid trip forms now save locally instead of failing on Supabase schema-cache errors such as a missing `country_name` column.
- Local UAT trips are ignored by Git and clearly labeled on trip detail pages.

## Local UAT Itinerary Fallback

- Added development-only local itinerary day generation for local UAT trips when Supabase is missing `trip_days`.
- Added local itinerary title/note saving so UAT can continue before Lane A migrations are applied.
- Added a local itinerary warning banner and tightened trip detail action button wrapping.
