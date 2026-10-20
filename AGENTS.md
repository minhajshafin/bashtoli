<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Bashtoli: e-commerce site for a local stationery shop. Production, real customers. Cash on delivery (COD) only; there is no payment gateway.

## Stack
- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind
- Supabase: Postgres, Auth, Storage, Row Level Security (RLS)
- Vercel (hosting), Upstash Redis (rate limiting), Resend (email), Zod (validation)
- Tests: Vitest (unit, `tests/unit`), Playwright (E2E, `tests/e2e`)
- Package manager: npm. Use the script names in `package.json`; never invent commands.

## Layout
- `app/(storefront)`, `app/(auth)`, `app/admin`, `app/api/{auth,search}`
- `proxy.ts`: Next 16 replacement for `middleware.ts`. Handles session refresh, admin guard, rate limiting (logic in `lib/supabase/middleware.ts`). Do not create `middleware.ts`.
- `lib/actions/`: all mutations (Server Actions)
- `lib/queries/`: all reads
- `lib/validations/`: Zod schemas, one file per domain
- `lib/supabase/`: `client.ts` (browser), `server.ts` (`createClient`, `createPublicClient`, `createAdminClient`), `rate-limit.ts`, `database.types.ts`
- `lib/config/delivery.ts`: client-side delivery fee estimate
- `components/{admin,storefront,ui}`: UI only; no queries or business logic
- `supabase/migrations/001–006`: source of truth for schema, RLS, functions
- `docs/`: `architecture.md`, `database.md`, `open-items.md`. Update when behavior changes.

## Supabase Client Rules
- `createClient()` (user session, RLS applies): default for everything.
- `createPublicClient()`: anonymous reads of public catalog data.
- `createAdminClient()` (service role, bypasses RLS): server-only, after an explicit authorization check, with a one-line comment stating why RLS cannot be used. Do not add new uses without approval.
- Browser client uses the publishable key only.
- Modules holding secrets import `server-only`. Client components must never import `lib/supabase/server.ts`, directly or transitively.

## Security Rules (never violate)
- Server Actions are public HTTP endpoints. Authenticate and authorize inside every action. `proxy.ts` is not sufficient.
  - Staff actions: `assertStaffOrAdmin()` from `lib/actions/admin-guard.ts`.
  - Admin-only actions (staff management): verify `role === 'admin'`.
- The client is untrusted. Price, delivery fee, total, and stock are computed in the SQL function `place_order`. Never accept them from the request.
- `lib/config/delivery.ts` must mirror the fees in `place_order`. Change both together and update the test.
- Every table has RLS enabled. A new table or column ships with its policy in the same migration.
- RLS cannot restrict columns. Any UPDATE policy open to non-staff users needs a column-guard trigger or must go through a `SECURITY DEFINER` RPC (e.g. `profiles.role`, `orders.status/total/user_id`).
- New SQL functions: `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` unless intentionally public. `SECURITY DEFINER` functions set `search_path`.
- Validate all input server-side with Zod: type, length, format. Never interpolate user input into PostgREST filter strings (`.or()`, `.ilike()`).
- Redirect targets (`redirectTo`, `next`) must be validated same-origin relative paths.
- Do not add new places where phone, email, or address appear in URLs or logs.
- Rate-limit sensitive public endpoints (checkout, order lookup, auth, search).
- Never log secrets or PII.
- Never reveal, print, quote, or copy secrets into chat, reports, docs, commit messages, test output, or logs. Secrets include `.env*` values, API keys, tokens, JWTs (`eyJ...`), the service-role key, and passwords. When searching or grepping, exclude `.env*` files and redact matches (show variable names and file:line only, never values). If a secret is found in a tracked file or output, report only its location and tell the user to rotate it.
- `NEXT_PUBLIC_` only for values safe in the browser. New env vars go in `.env.example` (no real values) and `docs/`.
- No new dependencies without stating why. `react-dom` is a required runtime dependency; do not remove it.

## Business Rules
- COD only. Do not add payment-gateway code or UI.
- Orders are created only through the `place_order` RPC (atomic: price lookup, stock decrement, order number, status history, items).
- Order numbers come from SQL `generate_order_number` only.
- Status changes go through `updateOrderStatusAction` / `customerCancelOrderAction`. Cancellation restores stock via `increment_stock`.
- No discount or coupon logic exists. Do not add any without a written spec.

## Code Conventions
- No `any`, `@ts-ignore`, or `@ts-nocheck`. Regenerate `database.types.ts` instead of casting RPC calls.
- Server Components by default; `"use client"` only when needed, kept small.
- Mutations only in `lib/actions`, reads only in `lib/queries`.
- Follow the existing action return pattern; no empty `catch`.
- Target ≤300 lines per file. Split when touching an oversized file; do not grow it.
- No duplicated logic: extract on the second copy. Known duplicates to consolidate: base-URL resolution (`lib/actions/auth.ts`), default-address reset (`addresses.ts`, `profile.ts`), confirm dialogs, error boundaries.
- Delete dead code; do not comment it out.
- Match existing naming and formatting. Do not reformat unrelated code.

## Verification
Before declaring done, run and report verbatim:
1. Lint
2. `npx tsc --noEmit`
3. Vitest
4. `npm run build`
5. Playwright, if the change touches checkout, auth, admin, or orders

Never claim success without running them.

## Change Discipline
- Smallest diff that solves the task. One concern per change; separate refactors from behavior changes.
- Plan first, and wait for approval, for anything touching auth, RLS, orders, pricing, migrations, or env vars.
- Schema changes are new migration files. Never edit a shipped migration. Keep `supabase/scripts/master-schema.sql` in sync with migrations.
- No deleting files or renaming env vars without approval.
- When asked to write a report or doc to a file, write it there only. Do not repeat its contents in chat; reply with the file path.

## Definition of Done
- Checks above pass.
- Behavior verified through the real flow; describe how.
- Security rules re-checked for any code touching auth, data access, or orders.
- Summary: files changed, why, what remains unverified.

## Do Not Guess
If something is not in the repo, say "not found". Do not invent file paths, table names, or API behavior.