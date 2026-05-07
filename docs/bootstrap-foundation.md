# Bootstrap Foundation

## What This Pass Adds

Vacation Planner now has the minimum secure product loop: a user can authenticate, reach a protected dashboard, open a protected draft-trip form, and save a country/city/day allocation once the Supabase migration is applied.

## Architecture

- Next.js App Router handles public, auth, and protected routes.
- Supabase SSR clients keep auth cookies synchronized through `proxy.ts`.
- Protected pages call server-side auth helpers before rendering data.
- Server Actions validate form data before auth or database mutations.
- Supabase RLS enforces user-owned rows at the database layer.

## Data Model

- `profiles`: one row per auth user.
- `trips`: draft trip records owned by one user.
- `trip_cities`: ordered city/day allocations owned by the same user and linked to a trip.

## Security Posture

- `.env.local` is ignored and removed from tracking.
- Only public Supabase env vars are documented.
- No service-role key is introduced.
- Protected routes use both Proxy redirects and server-side `requireUser()`.
- RLS policies scope all Phase 1 data to `(select auth.uid())`.

## Local Tooling Note

The local Mac rejected the native Next SWC binary code signature during verification. The npm scripts use `next dev --webpack` and `next build --webpack` so this project can run on the current machine through Next's supported Webpack path.

## Email Blocker Code

Use `VP-9CKCBP4Q7F` for all blocker email subjects, bodies, drafts, and reply filtering. Ignore replies that do not contain the exact code.
