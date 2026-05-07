# Lane A: Live Launch Unblock

Lane A is the path to getting the current foundation live, testable, and ready for real users.

## Right Now

1. Apply all SQL files in `supabase/migrations/` in timestamp order.
2. Confirm the generated UAT account or create one confirmed test user.
3. Add production environment variables to the deployment host:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy `https://github.com/Fameplus22/Simbiat-Vacation-Planner`.
5. Rerun UAT for sign-up, sign-in, protected routes, trip save, trip detail, trip edit, itinerary generation, dashboard list, and sign-out.

## Blockers That Need Human Access

- Supabase dashboard or migration credentials are needed to apply SQL.
- Supabase email confirmation blocks generated test users until the email is confirmed or a confirmed test account is provided.
- Deployment needs access to the GitHub repo and hosting provider.

## Acceptance Gate

Lane A is complete when a new confirmed user can sign in on the deployed app, create a trip with currency/language/date/budget fields, land on the trip detail page, edit the draft, generate itinerary days, return to the dashboard, see the updated trip, sign out, and be redirected away from protected pages.
