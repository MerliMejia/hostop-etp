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

For a test account, sign up with any email/password in the app.

## Verification

Run:

```bash
pnpm lint
pnpm build
```
