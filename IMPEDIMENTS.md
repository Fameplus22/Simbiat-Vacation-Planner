# Impediments

## Current

- Status: Pending verification
  - Blocker: Applying the Supabase SQL migrations requires database/dashboard access that is not present in the repo.
  - Impact: Auth UI can be built and checked, but live draft trip creation, trip detail retrieval, draft editing, and itinerary generation will fail until the `profiles`, `trips`, `trip_cities`, and `trip_days` tables, global planning columns, and draft/itinerary RPCs exist in Supabase.
  - Needed input: Apply all SQL files in `supabase/migrations/` in timestamp order in the Supabase dashboard or provide a safe migration workflow.
  - Recommendation: Apply the migrations manually in Supabase SQL Editor for this bootstrap, global planning, editable-draft, and itinerary pass.
  - Reply-Code: VP-9CKCBP4Q7F

- Status: Confirmed
  - Blocker: Supabase requires email confirmation for the generated UAT account.
  - Impact: Browser UAT cannot complete signed-in persistence, sign-out, draft trip creation, or dashboard retrieval until a user is confirmed.
  - Needed input: Confirm `yusuff.alabi+vp1778191215218@gmail.com` or provide an already confirmed test account.
  - Recommendation: Confirm the generated UAT account, apply the SQL migration, then rerun the signed-in UAT checklist.
  - Reply-Code: VP-9CKCBP4Q7F

- Status: Confirmed
  - Blocker: This Mac rejects the native Next SWC binary code signature.
  - Impact: Next must use SWC WASM locally; `next dev` and `next build` need Webpack instead of Turbopack on this machine.
  - Needed input: None for this branch. Scripts now use `--webpack`.
  - Recommendation: Keep Webpack scripts until the local Node/SWC signing issue is resolved.
  - Reply-Code: VP-9CKCBP4Q7F

- Status: Security hygiene
  - Blocker: `.env.local` was previously tracked while the repo was public.
  - Impact: No service-role/admin variable names were detected, but the public Supabase project URL and publishable key were exposed in Git history.
  - Needed input: Rotate the publishable key if you want clean post-public-exposure hygiene.
  - Recommendation: Rotate the Supabase publishable key after this branch lands, then update local/deployment env values.
  - Reply-Code: VP-9CKCBP4Q7F

- Status: Confirmed
  - Blocker: `git push -u origin feature/bootstrap-foundation` failed with GitHub 403 because this computer is authenticated as `Fameplus22`, which does not have permission to push to `simbiat-taxninja12/vacation-planner`.
  - Impact: The original `origin` remote cannot be updated from this machine. The alternate `publish` remote under `Fameplus22/Simbiat-Vacation-Planner` is available for branch publishing.
  - Needed input: To publish back to the original repo, authenticate Git on this computer as an account with write access or add `Fameplus22` as a collaborator with write access.
  - Recommendation: Continue using `publish` for immediate delivery, then either merge there or grant write access on the original repo.
  - Reply-Code: VP-9CKCBP4Q7F

## Email Routing Rule

Only process blocker replies that include `VP-9CKCBP4Q7F` in the subject or body.
