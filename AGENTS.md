# AI Agent Instructions

This is the primary context file for Codex and other coding agents working in this repository.

## Project Summary

HostOp Engineering Trial Project: a small multi-tenant SaaS for ingesting mock PMS reservations into Supabase and showing revenue analytics in a Next.js dashboard.

Stack:

- Next.js App Router, TypeScript, React 19
- Tailwind CSS v4
- Supabase Auth, Postgres, RLS, migrations
- Recharts
- Anthropic Claude API for the optional monthly summary
- pnpm

## Commands

Use pnpm for all Node package work.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

Supabase migration workflow:

```bash
supabase link --project-ref <project-ref>
supabase migration up
```

Do not commit `.env.local` or any real Supabase/Anthropic keys.

## Important Files

- `src/app/dashboard/page.tsx` - dashboard KPIs, chart, sync, summary controls.
- `src/app/reservations/page.tsx` - reservation filters, pagination, table.
- `src/app/api/sync-reservations/route.ts` - mock PMS sync.
- `src/app/api/summarize-month/route.ts` - Claude summary API.
- `src/lib/data.ts` - Supabase queries and dashboard calculations.
- `src/lib/date-range.ts` - persistent date-range normalization and half-open filtering.
- `src/lib/auth.ts` - server-side user/profile lookup.
- `src/lib/supabase-*.ts` - Supabase clients and middleware integration.
- `supabase/migrations/` - database schema, RLS, triggers.

## Non-Negotiable Product Contracts

- Every user belongs to exactly one organization.
- App data must stay org-scoped.
- RLS is the source of truth for tenant isolation.
- Reservation date filters use `created_at`, not `check_in`.
- Date range filters must be half-open:
  - `created_at >= start`
  - `created_at < end + 1 day`
- Switching between dashboard and reservations must preserve the last selected date range.
- Reservation pagination is 20 rows per page.
- PMS sync must be idempotent. Use `org_id,pms_reservation_id` as the conflict target.
- Claude summaries must use aggregate metrics only, not raw guest/reservation details.

## Implementation Guidelines

- Prefer server components and server-side Supabase queries for protected data.
- Use `getUserProfile()` for protected pages and `getOptionalUserProfile()` for API routes that must return JSON `401`.
- Keep Tailwind classes inline unless a component becomes meaningfully reusable.
- Keep schema changes in Supabase migrations. Do not patch production schema manually without also adding a migration.
- Keep UI restrained and reviewer-friendly; this is an operational dashboard, not a marketing site.
- Do not add broad abstractions unless they reduce real duplication or clarify tenancy/date logic.

## Verification Before Handoff

Always run:

```bash
pnpm lint
pnpm build
```

When Supabase credentials are available, manually verify:

- Signup creates an org, profile, and starter units.
- Login/logout and protected redirects work.
- Sync creates about 50 reservations and a repeat sync does not duplicate them.
- Two users cannot see each other’s units or reservations.
- Filters, pagination, KPIs, chart, and persisted date range work.
- Claude summary shows a controlled error if `ANTHROPIC_API_KEY` is missing.
