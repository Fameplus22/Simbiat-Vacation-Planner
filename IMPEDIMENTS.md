# Impediments

## Current

- Status: Pending verification
  - Blocker: Applying the Supabase SQL migrations requires database/dashboard access that is not present in the repo.
  - Impact: Auth UI can be built and checked, but live draft trip creation and trip detail retrieval will fail until the `profiles`, `trips`, and `trip_cities` tables plus global planning columns exist in Supabase.
  - Needed input: Apply all SQL files in `supabase/migrations/` in timestamp order in the Supabase dashboard or provide a safe migration workflow.
  - Recommendation: Apply the migrations manually in Supabase SQL Editor for this bootstrap and global planning pass.
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
  - Impact: The branch is committed locally but not yet on GitHub.
  - Needed input: Authenticate Git on this computer as an account with write access to the repo, or add `Fameplus22` as a collaborator with write access.
  - Recommendation: Sign in with the intended GitHub account, then rerun `git push -u origin feature/bootstrap-foundation`.
  - Reply-Code: VP-9CKCBP4Q7F

## Email Routing Rule

Only process blocker replies that include `VP-9CKCBP4Q7F` in the subject or body.
