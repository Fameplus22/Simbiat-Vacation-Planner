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
