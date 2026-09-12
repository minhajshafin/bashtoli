# Task: Production Deployment Runbook

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Deploy the application to Vercel production with a dedicated Supabase production project (running the 6 consolidated baseline migrations 001–006, storage bucket configuration, and `app_private` role hardening), Upstash Redis rate limiter cluster, Resend email domain verification, staging preview validation, and verified end-to-end smoke testing before custom domain cutover.

## Requirements

1. **Supabase Production Project Provisioning**:
   - Create a dedicated Supabase production project in a close regional data center (e.g. `ap-southeast-1` Singapore for optimal Bangladesh latency).
   - Apply the 6 consolidated baseline database migrations in sequence from `supabase/migrations/`:
     - `001_types_and_extensions.sql` (extensions, enums, `app_private` schema).
     - `002_core_tables.sql` (all 16 application tables with FKs and constraints).
     - `003_indexes.sql` (performance indexes for storefront, search, and admin).
     - `004_functions_and_triggers.sql` (triggers, order number generator, atomic RPCs, role helpers).
     - `005_row_level_security.sql` (hardened, non-circular RLS policies for all 16 tables).
     - `006_storage.sql` (`product-images` storage bucket and security policies).
   - Verify `app_private` schema is non-exposed to PostgREST public API schema list.
   - Execute bootstrap script (`supabase/scripts/bootstrap-admin.sql`) to set up initial store owner admin account.

2. **Upstash Redis Production Setup**:
   - Provision Upstash Redis serverless cluster (primary region matched to Vercel compute region).
   - Retrieve `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
   - Verify connectivity and rate limiter prefix isolation (`rl:auth`, `rl:order`, `rl:checkout`).

3. **Resend Email Service Production Setup**:
   - Add and verify production domain (`bashtoli.com` or custom subdomain) in Resend:
     - Configure DNS records: SPF (TXT), DKIM (TXT), and DMARC (TXT) on the domain registrar.
     - Confirm domain status shows "Verified" in Resend dashboard.
   - Set production sender address `orders@bashtoli.com`.
   - Configure recipient environment variables: `ADMIN_NOTIFICATION_EMAIL` (store owner) and `SUGGESTION_RECIPIENT_EMAIL`.

4. **Vercel Production Deployment & Environment Variables**:
   - Connect GitHub repository to Vercel project with Next.js preset.
   - Configure Environment Variables matrix in Vercel Project Settings (Production & Preview):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (Production server-only; verify never exposed to client)
     - `RESEND_API_KEY`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `ADMIN_NOTIFICATION_EMAIL`
     - `SUGGESTION_RECIPIENT_EMAIL`
     - `NEXT_PUBLIC_SITE_URL` (e.g. `https://bashtoli.com`)
   - Trigger preview build and confirm `next build` passes with zero errors and clean bundle output.

5. **Staging Preview Verification & Smoke Test Sequence**:
   - Perform full-cycle smoke testing on the deployment URL prior to custom domain cutover:
     1. **Storefront**: Browse homepage, hero carousel, 7-slot category collage, product listings, and product details with variant selectors.
     2. **Bag & Cart**: Add variant items to bag, test quantity modifications, and verify drawer subtotal calculation.
     3. **Checkout**: Place order as guest with Bangladeshi phone number, shipping address, and delivery zone selection (Inside/Outside Dhaka).
     4. **Transactional Emails**: Confirm customer receives order confirmation email and owner receives admin notification via Resend.
     5. **Admin Operations**: Log in to `/admin`, inspect order list, view order detail, transition status (`pending` → `processing`), and verify audit log update.
     6. **Guest Order Claiming**: Register new account matching the guest checkout phone/email, confirm notification banner on `/account/orders`, and execute "Link Orders" RPC.

6. **Custom Domain DNS Cutover & Instant Rollback**:
   - Add DNS A and CNAME records in domain registrar pointing to Vercel (`76.76.21.21` / `cname.vercel-dns.com`).
   - Validate automated SSL/TLS certificate issuance.
   - Test custom domain routing with canonical redirect (`www` to apex or vice versa).
   - Verify Instant Rollback mechanism in Vercel (`Deployments` → select prior build → `Promote to Production`).

## Acceptance Criteria

- [x] All 6 consolidated Supabase migrations (001–006 or `master-schema.sql`) successfully applied in production database without schema conflicts.
- [x] `app_private` schema isolation active; security helper functions not accessible directly via client PostgREST.
- [x] Storage bucket `product-images` created with public read access and 5MB upload size limit.
- [x] Initial store owner account bootstrapped with `admin` role.
- [x] Upstash Redis cluster active with valid REST credentials.
- [x] Resend production domain verified with SPF, DKIM, and DMARC passing.
- [x] All production environment variables configured in Vercel dashboard.
- [x] Complete smoke test passes (storefront → guest checkout → emails → admin status change → guest claim).
- [x] Custom domain DNS cutover completed with valid HTTPS certificate.
- [x] Rollback plan documented and ready.

## Dependencies

- Phase 1–7 implementation complete and verified.
- [01-expand-e2e-tests.md](./01-expand-e2e-tests.md)
- [02-observability-and-hardening.md](./02-observability-and-hardening.md)
- Access to domain DNS registrar, Supabase, Upstash, Resend, and Vercel accounts.

## Files to Modify

| File | Action | Description |
|---|---|---|
| `.env.local.example` | Complete | Document all required production environment variables |
| `docs/deployment.md` | Update | Update production runbook with migrations 001–006, dual buckets, Upstash, and Vercel sin1 region |
| `vercel.json` | Complete | Created with sin1 region routing and Next.js preset |

## Definition of Done

- [x] Production site live on `bashtoli.vercel.app` / `bashtoli.com` with active SSL.
- [x] Database running on consolidated schema with verified RLS policies.
- [x] Smoke test executed and signed off on live production URL.
- [x] Rollback procedure tested and documented.
