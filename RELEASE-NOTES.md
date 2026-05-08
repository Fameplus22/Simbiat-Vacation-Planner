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
- Updated local dev/build scripts to use Next's Webpack path for this machine's SWC WASM code-signing issue.

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

## Real Supabase UAT Policy

- Removed temporary same-machine trip and itinerary storage from runtime.
- Removed partial Supabase schema compatibility paths for trip create, edit, dashboard, and detail reads.
- Real browser UAT now requires the configured Supabase project, all migrations in `supabase/migrations/`, and a confirmed Supabase user.
- Missing production migrations now fail clearly instead of writing trip or itinerary data outside Supabase.
- Added `npm run verify:real-uat` to prevent reintroducing no-Supabase testing paths.
