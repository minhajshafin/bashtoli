# Task: Production Deployment Runbook

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Deploy the application to Vercel production with a dedicated Supabase production project (running all 19 migrations 001–019, dual storage buckets, and `app_private` role hardening), Upstash Redis rate limiter cluster, Resend email domain verification, staging preview validation, and verified end-to-end smoke testing before custom domain cutover.

## Requirements

1. **Supabase Production Project Provisioning**:
   - Create a dedicated Supabase production project in a close regional data center (e.g. `ap-southeast-1` Singapore for optimal Bangladesh latency).
   - Apply all 19 database migrations in chronological sequence from `supabase/migrations/`:
     - `001_initial_schema.sql` through `008_rls_policies.sql` (core tables, audit logs, RLS).
     - `009_order_status_history.sql` through `015_suggestions_honeypot.sql` (status history, customer accounts, hero slides, category collage, suggestions).
     - `016_category_covers_storage.sql` (dual bucket policy).
     - `017_fix_product_images_insert_policy.sql` & `018_admin_roles_hardening.sql` (`app_private` schema isolation for `is_admin` and `is_staff_or_admin`).
     - `019_guest_order_claiming.sql` (`claim_guest_orders` atomic security-definer RPC).
   - Configure Storage Buckets:
     - `product-images`: public, 2 MB file size limit, allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
     - `category-covers`: public, 3 MB file size limit, allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
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

- [ ] All 19 Supabase migrations successfully applied in production database without schema conflicts.
- [ ] `app_private` schema isolation active; security helper functions not accessible directly via client PostgREST.
- [ ] Storage buckets `product-images` and `category-covers` created with public read access and correct upload size limits.
- [ ] Initial store owner account bootstrapped with `admin` role.
- [ ] Upstash Redis cluster active with valid REST credentials.
- [ ] Resend production domain verified with SPF, DKIM, and DMARC passing.
- [ ] All production environment variables configured in Vercel dashboard.
- [ ] Complete smoke test passes (storefront → guest checkout → emails → admin status change → guest claim).
- [ ] Custom domain DNS cutover completed with valid HTTPS certificate.
- [ ] Rollback plan documented and ready.

## Dependencies

- Phase 1–7 implementation complete and verified.
- [01-expand-e2e-tests.md](./01-expand-e2e-tests.md)
- [02-observability-and-hardening.md](./02-observability-and-hardening.md)
- Access to domain DNS registrar, Supabase, Upstash, Resend, and Vercel accounts.

## Files to Modify

| File | Action | Description |
|---|---|---|
| `.env.local.example` | Verify | Confirm all required production environment variables are documented |
| `docs/deployment.md` | Update | Update production runbook with migrations 001–019, dual buckets, and Upstash |
| `vercel.json` | Create/Verify | Ensure optimal caching and security headers |

## Definition of Done

- [ ] Production site live on `bashtoli.com` with active SSL.
- [ ] Database running on migration 019 with verified RLS policies.
- [ ] Smoke test executed and signed off on live production URL.
- [ ] Rollback procedure tested and documented.
