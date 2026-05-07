# QA / UAT Evidence

## Environment

- Branch: `feature/bootstrap-foundation`
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
