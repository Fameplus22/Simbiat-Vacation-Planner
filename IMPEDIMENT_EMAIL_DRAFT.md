Subject: [VP-9CKCBP4Q7F] Vacation Planner blocker: Supabase migration required

Reply-Code: VP-9CKCBP4Q7F

Yusuff,

Vacation Planner needs the Supabase schema/RLS migrations applied before live draft trip creation, trip detail retrieval, and dashboard retrieval can pass UAT.

Why it blocks progress:
The app can authenticate with Supabase, but the product data tables and global planning columns do not exist until the SQL files in `supabase/migrations/` are applied in timestamp order. Without them, saving a draft trip will fail.

What is needed:
Apply all SQL files in `supabase/migrations/` in timestamp order in the Supabase SQL Editor for the project tied to this repo's `.env.local` values.

Also confirm the generated UAT account `yusuff.alabi+vp1778191215218@gmail.com` or provide an already confirmed test account so signed-in persistence, sign-out, draft trip creation, and dashboard retrieval can be retested.

Recommended option:
Apply the migration manually in Supabase SQL Editor for this bootstrap pass and confirm the generated UAT account. Do not send service-role keys or database passwords by email.

Please reply with this exact code in the subject or body after it is applied:
VP-9CKCBP4Q7F
