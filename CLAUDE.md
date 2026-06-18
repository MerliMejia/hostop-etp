# Claude Project Context

Follow `AGENTS.md` as the source of truth for architecture, commands, and invariants.

## Quick Orientation

This repository is a Next.js + Supabase multi-tenant reservation analytics app. The main risks are tenant isolation, date-range correctness, and keeping the mock PMS sync idempotent.

## Working Rules

- Preserve Supabase RLS and org scoping in every data path.
- Preserve the half-open date range contract in `src/lib/date-range.ts`.
- Never expose `.env.local`, service-role keys, anon keys, or Anthropic keys in commits or responses.
- Use pnpm.
- Run `pnpm lint` and `pnpm build` before claiming completion.

## High-Value Review Targets

- `supabase/migrations/` for RLS and trigger correctness.
- `src/lib/data.ts` for analytics calculations and filtering.
- `src/app/api/sync-reservations/route.ts` for idempotent sync behavior.
- `src/app/api/summarize-month/route.ts` for aggregate-only Claude prompts.
