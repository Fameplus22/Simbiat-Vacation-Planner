# QA / UAT Evidence

## Environment

- Current Lane B branch: `feature/lane-b-itinerary-editing`
- Baseline Phase 1 branch: `feature/bootstrap-foundation`
- Reply-Code: `VP-9CKCBP4Q7F`
- Supabase env names present locally: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Service-role/admin env names found: none detected by variable name inspection
- Tracked `.env.local` risk: it contained public Supabase URL/publishable key values and no service-role/admin variable names. Rotation of the publishable key is recommended because the file was committed while the repo was public.

## Static Checks

- `npm ci`: PASS. Installed 419 packages. npm audit reported 2 moderate findings in Next/PostCSS dependency chain.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS with `next build --webpack`. This Mac rejected the native Next SWC binary code signature, so Next used WASM bindings; Webpack is required because Turbopack does not support WASM bindings.

## Browser / Functional UAT

- `/` landing page loads: PASS at `http://localhost:3002/`.
- Landing CTA is present: PASS.
- `/auth/sign-up` validation/error states: PASS.
- `/auth/sign-in` validation/error states: PASS.
- Signed-out `/dashboard` redirects to sign-in: PASS. Observed `/auth/sign-in?next=%2Fdashboard`.
- Signed-out `/trips/new` redirects to sign-in: PASS. Observed `/auth/sign-in?next=%2Ftrips%2Fnew`.
- Supabase sign-up accepts valid Gmail plus-address: PASS_WITH_BLOCKER. Supabase accepted `yusuff.alabi+vp1778191215218@gmail.com` and required email confirmation.
- Signed-in session persists across refresh/navigation: BLOCKED by Supabase email confirmation for the generated UAT account.
- Sign-out works: BLOCKED by Supabase email confirmation for the generated UAT account.
- Draft trip save works: BLOCKED until confirmed sign-in session exists and the migration is applied.
- Dashboard lists saved draft trip: BLOCKED until confirmed sign-in session exists and the migration is applied.
- Mobile layout sanity: PASS. Landing page at 390px viewport had no horizontal overflow.

## Notes

Live trip-save UAT requires a confirmed Supabase user and the database migration applied to the target project. The blocker is tracked in `IMPEDIMENTS.md` and `IMPEDIMENT_EMAIL_DRAFT.md`.

Remote delivery is blocked: `git push -u origin feature/bootstrap-foundation` failed with GitHub 403 because this computer is authenticated as `Fameplus22`, which does not have permission to push to `simbiat-taxninja12/vacation-planner`.

## Lane B Pending Verification

- `npm run lint`: PASS after Lane B changes.
- `npm run typecheck`: PASS after Lane B changes.
- `npm run build`: PASS after Lane B changes. Build includes `/trips/[id]`.
- Trip form global fields render: Build-verified, browser signed-in UAT still blocked by Supabase email confirmation.
- Protected trip detail route compiles and is server-protected: PASS by build/typecheck.
- New migration applies after bootstrap migration: Pending Supabase access.

## Lane B Editable Draft Verification

- `npm run lint`: PASS after editable draft changes.
- `npm run typecheck`: PASS after editable draft changes.
- `npm run build`: PASS after editable draft changes. Build includes `/trips/[id]/edit`.
- Protected edit route `/trips/[id]/edit` compiles and calls `requireUser()`: PASS by typecheck.
- Edit form prefill behavior: Build/typecheck verified from existing trip data shape; signed-in browser UAT still blocked by Supabase email confirmation and unapplied migrations.
- Draft update action: Server-side validation and RPC call compile; live database UAT pending application of `20260507020000_trip_editing_foundation.sql`.
- Browser screenshot, landing page: PASS, captured at `output/playwright/lane-b-landing.png`.
- Browser screenshot, sign-in page: PASS, captured at `output/playwright/lane-b-sign-in.png`.
- Signed-out protected edit redirect: PASS. `/trips/not-a-real-id/edit` redirects to `/auth/sign-in?next=%2Ftrips%2Fnot-a-real-id%2Fedit`; screenshot captured at `output/playwright/lane-b-edit-redirect.png`.
- Favicon route: PASS. `GET /favicon.svg` returns `200 OK` with `image/svg+xml`.
- Browser console sanity: PASS after favicon metadata/file addition. Fresh landing load had no app error; dev-only React/HMR messages are expected.

## Lane B Itinerary Foundation Verification

- `npm run lint`: PASS after itinerary changes.
- `npm run typecheck`: PASS after itinerary changes.
- `npm run build`: PASS after itinerary changes. Build includes `/trips/[id]/itinerary`.
- Protected itinerary route `/trips/[id]/itinerary` compiles and calls `requireUser()`: PASS by typecheck.
- Itinerary generation action: RPC call compiles; live database UAT pending application of `20260507030000_itinerary_foundation.sql`.
- Signed-out protected itinerary redirect: PASS. `/trips/not-a-real-id/itinerary` redirects to `/auth/sign-in?next=%2Ftrips%2Fnot-a-real-id%2Fitinerary`.

## Lane B Itinerary Editing Verification

- `npm run lint`: PASS after itinerary editing changes.
- `npm run typecheck`: PASS after itinerary editing changes.
- `npm run build`: PASS after itinerary editing changes.
- Editable itinerary day title/note form compiles with server action state handling: PASS by typecheck.
- Itinerary detail save action: RPC call compiles; live database UAT pending application of `20260507040000_itinerary_day_editing.sql`.

## UAT Schema Compatibility Fix

- Observed user-facing failure: Supabase returned `Could not find the 'budget_amount' column of 'trips' in the schema cache` after a valid `/trips/new` submission.
- Observed user-facing failure: Supabase returned `Could not find the 'country_name' column of 'trips' in the schema cache` after a valid `/trips/new` submission.
- Root cause: the connected Supabase project has the basic trip schema but is missing the Lane B global-planning migrations.
- Fix verification: `npm run lint` PASS.
- Fix verification: `npm run typecheck` PASS.
- Fix verification: `npm run build` PASS.
- Expected behavior before Lane B migrations: basic trip creation and edit fall back to saving country, total days, and city allocation; dates, budget, currency, language, notes, and itinerary still require the migrations for persistence.

## Local UAT Fallback Verification

- Root cause expansion: the connected Supabase project may also be missing the Phase 1 `trips.country_name` schema, which means no database trip save can succeed from the browser.
- Added development-only `.local-uat-data/trips.json` fallback, ignored by Git, for local UAT when Supabase trip schema is absent.
- Fix verification: direct `tsc --noEmit` PASS.
- Fix verification: direct `eslint .` PASS.
- Fix verification: direct `next build --webpack` PASS.
- Expected behavior while Supabase schema is absent: a valid trip form redirects to a local trip detail page with a local UAT warning banner.

## Local UAT Itinerary Fallback Verification

- Observed user-facing failure: local trip detail worked, but `/trips/local-uat-.../itinerary` still queried Supabase and showed `Could not find the table 'public.trip_days' in the schema cache`.
- Root cause: local UAT fallback covered trips but not generated itinerary days or itinerary edit actions.
- Fix: added development-only local itinerary day storage, local day generation from city allocation, and local itinerary day title/note saving.
- UI fix: trip action buttons now avoid compressed/wrapped labels in the detail header.
- Fix verification: direct `eslint .` PASS after local itinerary fallback.
- Fix verification: direct `tsc --noEmit` PASS after local itinerary fallback.
- Fix verification: direct `next build --webpack` PASS after local itinerary fallback. Build includes `/trips/[id]/itinerary`.
- Dev server verification: authenticated browser request to `/trips/local-uat-36196d2a-2b07-46b9-97ff-e25c5269e4f5/itinerary` returned `200` after the fix.
- Expected behavior while Supabase schema is absent: clicking `Generate days` on the local itinerary page creates local day cards for the current city allocation, and saving day titles/notes writes to local UAT storage only.
