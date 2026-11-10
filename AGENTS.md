<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Bashtoli: e-commerce site for a local stationery shop. Live in production: real customers, real cash-on-delivery (COD) orders. There is no payment gateway.

## Stack
- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind
- Supabase: Postgres, Auth, Storage, Row Level Security (RLS)
- Vercel (hosting), Upstash Redis (rate limiting), Resend (email), Zod (validation)
- Tests: Vitest (unit, `tests/unit`), Playwright (E2E, `tests/e2e`)
- Package manager: npm. Use the script names in `package.json`; never invent commands.

## Environments & Releases
- Local (`.env.local`) and Vercel Preview use the STAGING Supabase project. Vercel Production uses the PRODUCTION Supabase project. Preview and local must never point at the production database.
- Agents have no production credentials. Never ask for, use, print, or write production keys or URLs. Production database changes are applied by the owner only.
- `main` deploys to production. Work on a branch, validate on the Preview deployment, and merge to `main` only when Verification passes. Never commit directly to `main`.
- Schema changes go to staging first, are verified (SQL smoke test + Playwright), and are then applied to production by the owner.
- `seed-test-data.sql`, `place_order_smoke.sql`, and the E2E suite run on staging only, never on production.
- Every variable required by `lib/env.ts` must exist in BOTH the Production and Preview Vercel scopes. A missing variable fails the production boot by design.

## Production Safety (never violate)
- No destructive or bulk SQL (DELETE/UPDATE without a tight WHERE, TRUNCATE, DROP) against production without a verified backup and explicit owner approval.
- Never delete or rewrite orders, order items, or status history. They are financial records; correct them with a new status/history entry.
- Hotfixes: smallest possible change, the same Verification as any other change, no skipping staging.
- If you find a data leak or auth bypass, stop and report file:line and impact to the owner before shipping a fix.
- Any secret that appears in chat, logs, a report, or a commit must be rotated immediately.

## Layout
- `app/(storefront)`, `app/(auth)`, `app/admin`, `app/api/{auth,search}`
- `proxy.ts`: Next 16 replacement for `middleware.ts`. Handles session refresh, admin guard, rate limiting (logic in `lib/supabase/middleware.ts`). Do not create `middleware.ts`.
- `lib/env.ts`: environment validation schema (validated at boot via `instrumentation.ts`).
- `lib/actions/`: all mutations (Server Actions; includes `admin-guard`, `cart-merge`, `variants-bulk`, `product-delete`, `product-status`).
- `lib/queries/`: all reads (includes `cart.ts`).
- `lib/order/access.ts`: pure order access resolution (`resolveOrderAccess`) and DTO contracts.
- `lib/hooks/use-hydrated.ts`: client hydration state hook (`useSyncExternalStore`).
- `lib/utils/`: utilities (`url`, `safe-redirect`, `action-error`, `order-token`).
- `lib/validations/`: Zod schemas, one file per domain.
- `lib/supabase/`: `client.ts` (browser), `server.ts` (`createClient`, `createPublicClient`, `createAdminClient`), `require-user.ts` (cached auth guard), `rate-limit.ts`, `database.types.ts`.
- `lib/config/delivery.ts`: client-side delivery fee estimate.
- `components/{admin,storefront,ui}`: UI only; no queries or business logic (includes `components/storefront/{skeletons,profile}/`).
- `supabase/migrations/`: source of truth for schema, RLS, functions. `001–006` are shipped and immutable.
- `supabase/scripts/`: `master-schema.sql`, `seed-test-data.sql` (staging only), `bootstrap-admin.sql`.
- `supabase/tests/place_order_smoke.sql`: transactional SQL smoke test for `place_order` (staging only).
- `docs/`: `architecture.md`, `database.md`, `open-items.md`, `LAUNCH_CHECKLIST.md`, `redesign.md` (create when the redesign starts). `docs/audit/` is gitignored working material. Update docs when behavior changes.

## Supabase Client Rules
- `createClient()` (user session, RLS applies): default for everything.
- `createPublicClient()`: anonymous reads of public catalog data.
- `createAdminClient()` (service role, bypasses RLS): server-only, after an explicit authorization check, with a one-line comment stating why RLS cannot be used. Do not add new uses without approval.
- Browser client uses the publishable key only.
- Modules holding secrets import `server-only`. Client components must never import `lib/supabase/server.ts`, directly or transitively.

## Security Rules (never violate)
- Server Actions are public HTTP endpoints. Authenticate and authorize inside every action. `proxy.ts` is not sufficient.
  - Staff actions: `assertStaffOrAdmin()` from `lib/actions/admin-guard.ts`.
  - Admin-only actions (staff management): verify `role === 'admin'` via `assertAdmin()`.
- Customer-facing and public Server Actions never return raw `error.message` (use `lib/utils/action-error.ts`, and log only code+message, never details).
- Every `/account/*` page and layout calls `requireUser()`.
- Order page access always goes through `resolveOrderAccess`, and the partial/gate views only ever receive the redacted DTO.
- Customers cancel orders only via the `cancel_order` RPC, never direct UPDATE.
- Environment variables are read through `lib/env.ts` for anything required in production.
- The client is untrusted. Price, delivery fee, total, and stock are computed in the SQL function `place_order`. Never accept them from the request.
- `lib/config/delivery.ts` must mirror the fees in `place_order`. Change both together and update the test.
- Every table has RLS enabled. A new table or column ships with its policy in the same migration.
- RLS cannot restrict columns. Any UPDATE policy open to non-staff users needs a column-guard trigger or must go through a `SECURITY DEFINER` RPC (e.g. `profiles.role`, `orders.status/total/user_id`).
- New SQL functions: `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` unless intentionally public. `SECURITY DEFINER` functions set `search_path`.
- Validate all input server-side with Zod: type, length, format. Never interpolate user input into PostgREST filter strings (`.or()`, `.ilike()`).
- Redirect targets (`redirectTo`, `next`) must be validated same-origin relative paths (via `safeRedirectPath`).
- Do not add new places where phone, email, or address appear in URLs or logs.
- Rate-limit sensitive public endpoints (checkout, order lookup, auth, search).
- Never log secrets or PII.
- Never reveal, print, quote, or copy secrets into chat, reports, docs, commit messages, test output, or logs. Secrets include `.env*` values, API keys, tokens, JWTs (`eyJ...`), the service-role key, and passwords. When searching or grepping, exclude `.env*` files and redact matches (show variable names and file:line only, never values). If a secret is found in a tracked file or output, report only its location and tell the user to rotate it.
- `NEXT_PUBLIC_` only for values safe in the browser. New env vars go in `.env.example` (no real values), `lib/env.ts`, and `docs/`.
- No new dependencies without stating why. `react-dom` is a required runtime dependency; do not remove it.

## Business Rules
- COD only. Do not add payment-gateway code or UI.
- Orders are created only through the `place_order` RPC (atomic: price lookup, stock decrement, order number, status history, items). `place_order` takes an idempotency key (checkout generates one per attempt).
- Order numbers come from SQL `generate_order_number` only.
- Status changes go through `updateOrderStatusAction` / `customerCancelOrderAction`. Cancellation restores stock via `increment_stock`.
- No discount or coupon logic exists. Do not add any without a written spec.

## UI/UX Redesign
Presentation changes only. A redesign must never alter a behavior contract or weaken a security rule.
- **Invariants to preserve:** `resolveOrderAccess` and the redacted DTO on the order page; `requireUser()` on every account page; server-side pricing and the checkout idempotency key; `useHydrated()` for any client-only state; wishlist and cart controls staying disabled until the auth-aware shell has mounted (`pending` mode in the Suspense fallback); input validation and rate limiting.
- **Process:** one page or flow per change, on a branch, reviewed on a Preview deployment. Update E2E specs and unit tests in the same change. Separate commits for restyling and for logic moves.
- **Deferred refactors:** the oversized components listed in `docs/open-items.md` (product-form, hero-slides-manager, category-collage-manager, product-client, checkout-form, order-list, variant-table, product-card) are split during the redesign of the page that owns them, never as a separate pre-redesign cleanup.
- **Design tokens:** use the existing Tailwind theme tokens (forest, gold, cream, etc.). Add new tokens to the theme; no inline hex values or arbitrary values.
- **Accessibility baseline:** semantic headings, labelled controls, visible focus, full keyboard operation, AA contrast, touch targets of at least 44px, and verification at a 360px-wide viewport. Rebuild modals and drawers on native `<dialog>` with `showModal()` for focus trapping.
- **Images and motion:** `next/image` with `sizes` always set; `priority` only on the single LCP image per page; animations respect `prefers-reduced-motion`; no new visual-effect libraries without justification.
- **Copy:** do not change legal text (privacy, terms) or business facts (address, hours, phone, WhatsApp) without the owner's confirmation. Changing a heading or button name means updating the E2E specs that match it.
- Record decisions and progress in `docs/redesign.md`.

## Code Conventions
- No `any`, `@ts-ignore`, or `@ts-nocheck`. Regenerate `database.types.ts` instead of casting RPC calls.
- Server Components by default; `"use client"` only when needed, kept small.
- Mutations only in `lib/actions`, reads only in `lib/queries`.
- Follow the existing action return pattern; no empty `catch`.
- Target ≤300 lines per file is a guideline; do not split a file solely to reach the number.
- Client-only state (localStorage, matchMedia, counts) must never be read during render without `useHydrated()`.
- No duplicated logic: extract on the second copy.
- Delete dead code; do not comment it out.
- Match existing naming and formatting. Do not reformat unrelated code.

## Testing
- Unit: Vitest (`tests/unit`).
- E2E: Playwright (`tests/e2e`), one worker. Requires `ORDER_COOKIE_SECRET` and `E2E_SUPABASE_URL` in `.env.local`. E2E tests must never run against production (`E2E_SUPABASE_URL` guard).
- E2E locators must ignore hidden elements (`getByRole`, or `text=... >> visible=true`), never `.first()` to dodge strict mode, because the Suspense fallback briefly duplicates content.
- Per-run E2E users are deleted in `afterAll`; `globalSetup` prunes stale `e2e-claim` / `e2e-admin` users.
- SQL smoke test: `supabase/tests/place_order_smoke.sql`, run in the SQL editor of the staging project only.

## Verification
Before declaring done, run and report verbatim:
1. Lint
2. `npx tsc --noEmit`
3. Vitest
4. `npm run build`
5. Playwright, if the change touches checkout, auth, admin, orders, or any UI covered by an E2E spec

Never claim success without running them. For UI changes also check a phone-width viewport on the Preview deployment.

## Change Discipline
- Smallest diff that solves the task. One concern per change; separate refactors from behavior changes.
- Plan first, and wait for approval, for anything touching auth, RLS, orders, pricing, migrations, or env vars.
- **Schema (post-launch):** migrations `001–006` are shipped and immutable; never edit them. Every schema change is a new numbered migration (`007_...` onward). Regenerate `supabase/scripts/master-schema.sql` so it equals the concatenation of all migrations. A migration must be backward compatible with the code currently in production: add columns nullable or with defaults; never drop or rename a column, or change a function signature that production code still calls, in the same release as the code that stops using it (expand, deploy, then contract in a later release). Include the matching RLS and GRANT/REVOKE statements in the same migration, make it idempotent where possible, and drop an old function signature explicitly rather than leaving an overload.
- No deleting files or renaming env vars without approval.
- When asked to write a report or doc to a file, write it there only. Do not repeat its contents in chat; reply with the file path.

## Definition of Done
- Checks above pass.
- Behavior verified through the real flow; describe how.
- Security rules re-checked for any code touching auth, data access, or orders.
- Summary: files changed, why, what remains unverified.

## Do Not Guess
If something is not in the repo, say "not found". Do not invent file paths, table names, or API behavior.