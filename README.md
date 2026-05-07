# Vacation Planner

Vacation Planner is a secure Phase 1 foundation for saving draft vacation plans. This pass includes Supabase email/password auth, protected pages, a starter dashboard, a draft trip form, and versioned SQL for user-owned data isolation.

## Phase 1 Scope

- Public landing page at `/`
- Email/password sign-up at `/auth/sign-up`
- Email/password sign-in at `/auth/sign-in`
- Protected dashboard at `/dashboard`
- Protected draft trip creation at `/trips/new`
- Protected trip detail at `/trips/[id]`
- Protected draft trip editing at `/trips/[id]/edit`
- Currency, language, dates, traveler count, budget, and planning notes
- Supabase schema and RLS setup for `profiles`, `trips`, and `trip_cities`
- Supabase RPC for atomic draft trip updates
- Repo hygiene for local env files and fresh-machine setup

Out of scope for this pass: hotel APIs, activity APIs, live pricing, currency conversion, payment flows, full PWA install, recommendation engines, and premium budgeting.

## Requirements

- Git
- Node.js with npm
- A Supabase project with email/password auth enabled

This repo uses npm because `package-lock.json` is committed.

## Fresh Machine Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/simbiat-taxninja12/vacation-planner.git
   cd vacation-planner
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create local env:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in `.env.local` with public Supabase browser values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
   ```

5. Apply the Supabase SQL migrations in `supabase/migrations/` in timestamp order.

6. Start the app:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Supabase Notes

The browser only receives `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These values are public by design. Do not commit service-role keys, secret keys, database passwords, or admin keys.

The SQL migration enables RLS on all Phase 1 tables. Users can only access rows owned by their own `auth.uid()`.

## Delivery Lanes

- Lane A live launch unblock: `docs/lane-a-live-launch.md`
- Lane B global product build: `docs/lane-b-global-product.md`

## Email Blocker Routing

This project uses reply code `VP-9CKCBP4Q7F` for blocker email routing. Any blocker email or draft must include:

- Subject prefix: `[VP-9CKCBP4Q7F]`
- Body line: `Reply-Code: VP-9CKCBP4Q7F`

Replies without this exact code should be ignored by this project.
