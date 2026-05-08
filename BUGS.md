# Bugs

## Open

- Severity: Medium
  - Issue: `npm audit` reports two moderate findings through Next's bundled PostCSS dependency. npm suggests a bad semver-major downgrade to Next 9.3.3, so no automated fix was applied.
  - Next step: Monitor/update Next when an upstream patched version is available for the current major line.

- Severity: Medium
  - Issue: Live trip-save, trip-detail, trip-edit, itinerary generation, and itinerary detail UAT depend on the Supabase migrations being applied to the project database.
  - Next step: Apply all files in `supabase/migrations/` in timestamp order, then retest sign-in, draft save, trip detail, draft edit, itinerary generation, itinerary detail saving, and dashboard retrieval.

- Severity: Medium
  - Issue: Supabase email confirmation blocks signed-in browser UAT for generated test accounts.
  - Next step: Confirm the generated test account email or provide an already confirmed test account, then rerun signed-in persistence, sign-out, draft-save, and dashboard-list UAT.

- Severity: High
  - Issue: Remote push is blocked by GitHub 403 because local Git credentials belong to `Fameplus22`, which cannot push to this repo.
  - Next step: Use the `publish` remote for immediate delivery, or authenticate as a GitHub account with write access to the original repo.

## Closed

- Severity: High
  - Issue: Valid `/trips/new` submissions failed when the connected Supabase project was missing the Phase 1 `trips.country_name` schema.
  - Resolution: Superseded on 2026-05-08 by the real-Supabase UAT policy. The temporary local data path was removed; browser testing now requires production Supabase migrations and fails clearly when they are absent.

- Severity: High
  - Issue: Temporary same-machine trip records could open detail pages, but itinerary pages still failed when the connected Supabase project was missing `public.trip_days`.
  - Resolution: Superseded on 2026-05-08 by the real-Supabase UAT policy. Itinerary generation and saving now require the Supabase itinerary migrations.

- Severity: High
  - Issue: Valid `/trips/new` submissions failed when the connected Supabase project was missing Lane B columns such as `budget_amount`.
  - Resolution: Superseded on 2026-05-08 by the real-Supabase UAT policy. Partial-schema compatibility paths were removed; Lane B fields and RPCs must exist for real UAT.

- Severity: High
  - Issue: The starter repo referenced `@/lib/supabase/proxy` but did not contain that file.
  - Resolution: Added the Supabase Proxy helper and supporting server/browser clients.
