# Copilot Instructions

This is a Next.js App Router + Supabase trial project for a multi-tenant reservation analytics SaaS.

Follow the repository guidance in `AGENTS.md`.

Key constraints:

- Use TypeScript and pnpm.
- Protect all app data by organization.
- Preserve Supabase RLS policies and migrations.
- Date range filters must use `created_at >= start` and `created_at < end + 1 day`.
- Do not reset the date range when navigating between dashboard and reservations pages.
- Reservation sync must upsert idempotently by `org_id,pms_reservation_id`.
- Claude summary code must send aggregate metrics only.
- Never suggest committing `.env.local` or secrets.

Before handing off generated changes, run:

```bash
pnpm lint
pnpm build
```
