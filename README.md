# HostOp Engineering Trial Project

Small multi-tenant reservation analytics SaaS built with Next.js, Supabase, Tailwind, Recharts, and Claude.

## What It Includes

- Supabase email/password auth.
- Automatic organization and profile creation on signup.
- Row-level security for organization-scoped data.
- Mock PMS reservation sync with idempotent upsert and batched 100ms delay.
- Dashboard KPIs: revenue, reservations, occupancy, and ADR.
- Recharts revenue bar chart that follows the active dashboard date filter.
- Reservations table with unit, status, optional date range filters, and 10-row pagination.
- Dashboard and reservations default to all org reservations until a date range is applied.
- Persistent applied date range across dashboard and reservations pages.
- Claude-powered month summary using aggregate metrics only.

## Tech Decisions

- **Next.js App Router** keeps protected pages, route handlers, and server-side Supabase queries in one deployable Vercel app.
- **Supabase RLS** enforces tenancy at the database layer, not just in UI filters.
- **API route handlers** are used instead of Edge Functions to reduce deployment overhead for the trial.
- **`pms_reservation_id`** is added to reservations so mock PMS sync can upsert deterministically without duplicate rows.
- **Half-open date ranges** use `created_at >= start` and `created_at < end + 1 day` everywhere date range filtering is applied. When no date range is selected, reservation analytics and lists are unfiltered by date.

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Supabase cloud project.

3. Link and apply migrations:

   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase migration up
   ```

4. Copy env vars:

   ```bash
   cp .env.example .env.local
   ```

5. Fill in `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

6. Start the app:

   ```bash
   pnpm dev
   ```

7. Open `http://localhost:3000`.

## Supabase Notes

The migration creates:

- `organizations`
- `users`
- `units`
- `reservations`

It also enables RLS, creates policies for org-scoped access, and adds an auth trigger that creates an organization, user profile, and starter units for each signup.

For a test account, sign up with any email/password in the app. If email confirmations are enabled in Supabase, either confirm the user or disable confirmations for the trial project.

## Deployment

Deploy to Vercel and add the same environment variables in the Vercel project settings. The recommended reviewer test credentials format is:

```text
Email: reviewer@example.com
Password: hostop-demo-password
```

Create this user through the app after deploying, run **Sync Reservations**, and verify dashboard data appears before sending the Vercel URL.

## Verification

Run:

```bash
pnpm lint
pnpm build
```

Manual checks:

- Signup creates an org, profile, and starter units.
- Login/logout works.
- `/dashboard` and `/reservations` redirect to login when unauthenticated.
- Sync creates about 50 reservations and re-sync does not duplicate them.
- Dashboard KPIs and chart update after sync, with unfiltered KPIs showing all synced reservations.
- Applied date range persists across dashboard and reservations pages, and clear controls return to the unfiltered view.
- Reservations filters and 10-row pagination work.
- Claude summary works when `ANTHROPIC_API_KEY` is present and returns a controlled error when missing.
- Two users cannot see each other’s units or reservations.

## AI Tool Usage

This project was planned and implemented with Codex. Useful prompts included:

- Asking for a decision-complete implementation plan from the HostOp trial prompt.
- Asking Codex to implement the plan end-to-end with Supabase RLS, Next.js App Router, and Tailwind.
- Asking Codex to verify the implementation with lint/build and tighten issues found during verification.
