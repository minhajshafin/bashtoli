# Production Launch Checklist

This checklist tracks the operational, infrastructure, security, and verification steps required to transition Bashtoli from pre-launch development to live production.

---

## 1. Database Provisioning (Supabase Production)

- [ ] **Create Production Supabase Project**: Provision a fresh, dedicated project on Supabase in the target geographical region (e.g. Singapore / Southeast Asia).
- [ ] **Apply Master Schema**: Run [`supabase/scripts/master-schema.sql`](../supabase/scripts/master-schema.sql) in the Supabase SQL Editor to establish all tables, extensions, RLS policies, storage bucket configurations, and stored procedures.
  > [!CAUTION]
  > Never execute [`supabase/scripts/seed-test-data.sql`](../supabase/scripts/seed-test-data.sql) on the production database. Seed data contains mock test accounts and placeholder products.
- [ ] **Bootstrap Store Owner Admin**: Run [`supabase/scripts/bootstrap-admin.sql`](../supabase/scripts/bootstrap-admin.sql) with the store owner's initial email to grant the `admin` role and record the immutable audit trail entry.
- [ ] **Confirm Database Backup Strategy**: Verify automated daily database backups or Point-in-Time Recovery (PITR) are enabled in the Supabase project settings to safeguard live orders and customer records.

---

## 2. Supabase Auth & Email Settings

- [ ] **Email Confirmations Enabled**: In Supabase Dashboard -> **Authentication** -> **Providers** -> **Email**, verify **"Confirm email"** is turned ON.
- [ ] **Site URL & Redirect URLs**:
  - Set **Site URL** to the production domain (e.g. `https://bashtoli.com`).
  - Add production and preview redirect URLs under **Redirect URLs** (e.g. `https://bashtoli.com/api/auth/callback` and `https://*.vercel.app/api/auth/callback`).
- [ ] **Leaked Password Protection**: Enable leaked-password protection (HaveIBeenPwned integration) under Supabase Auth security settings if supported by the project tier.
- [ ] **Custom SMTP Configuration**:
  - Configure custom SMTP in Supabase Auth settings to send auth confirmation and password-reset emails through Resend SMTP.
- [ ] **Domain Verification in Resend**:
  - Verify the sending domain (DKIM, SPF, and DMARC DNS records) in the Resend dashboard.
- [ ] **Sender Address Configuration**:
  - Configure verified sender address (e.g. `orders@bashtoli.com` or `noreply@bashtoli.com`) for transactional customer notifications and admin alerts.

---

## 3. Distributed Cache & Rate Limiting (Upstash)

- [ ] **Create Production Redis Database**: Provision an Upstash Serverless Redis database with REST API enabled in the same or nearest region.
- [ ] **Verify Connection Limits**: Ensure read/write quotas accommodate anticipated launch traffic.

---

## 4. Vercel Hosting & Environment Configuration

Configure the following environment variables in Vercel under Project Settings -> **Environment Variables**. Every variable below is required by `lib/env.ts` in production and must be set across **BOTH** the **Production** and **Preview** scopes.

> [!IMPORTANT]
> Variables are listed by NAME ONLY. Never log, share, or commit real secret values.

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production & Preview)
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Production & Preview)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production & Preview)
- [ ] `ORDER_COOKIE_SECRET` (Production & Preview — minimum 32 characters)
- [ ] `UPSTASH_REDIS_REST_URL` (Production & Preview)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (Production & Preview)
- [ ] `RESEND_API_KEY` (Production & Preview)
- [ ] `ADMIN_NOTIFICATION_EMAIL` (Production & Preview — destination for new order alerts)
- [ ] `NEXT_PUBLIC_APP_URL` (Production & Preview — canonical base URL)

---

## 5. Assets & Branding

- [ ] **OpenGraph Social Preview Image**: Ensure a high-resolution 1200x630 PNG is provided at `public/og-fallback.png` for link unfurling and social sharing cards.

---

## 6. Security Hygiene & Cleanup

- [ ] **Pre-Push Repository Hygiene & Secret Audit**: Before the first push: confirm the repo visibility, run the secret scan from step 2, and confirm docs/audit/ is not tracked (git ls-files docs/audit returns nothing).
- [ ] **Tear Down Development Database**: Delete the pre-launch development Supabase project once production data has been verified.
- [ ] **Purge Dev Credentials**: Audit Vercel environment variables to guarantee no legacy development API keys, database URLs, or secret tokens remain in any environment.
- [ ] **Error Monitoring & Logging**: Decide on and establish centralized error monitoring and alerting (e.g., Sentry, Vercel Log Drains, or alert webhooks) for critical runtime exceptions.

---

## 7. Migration Model Transition

- [ ] **Flip AGENTS.md Rule**: Immediately upon completing the first production deployment, edit `AGENTS.md` under **Change Discipline** to retire the pre-launch schema rule. From this point forward:
  - Migrations in `supabase/migrations/` become **append-only** (e.g. `007_*.sql`).
  - Existing migrations `001`–`006` must never be modified retrospectively.

---

## 8. Post-Deploy Smoke Test (Real Flow Verification)

Execute a complete end-to-end operational test on the live production URL:

- [ ] **Place a Real Cash on Delivery (COD) Order**:
  - Browse catalog, add variant to cart, and complete `/checkout` with a real physical address and phone number.
- [ ] **Verify Order Confirmation & Tracking**:
  - Confirm redirection to `/order/[orderNumber]`.
  - Confirm guest tracking works via the generated token URL.
- [ ] **Verify Email Dispatch**:
  - Verify customer confirmation email arrives in inbox.
  - Verify store admin receives alert notification email at `ADMIN_NOTIFICATION_EMAIL`.
- [ ] **Verify Admin Dashboard Fulfillment**:
  - Log in to `/admin/orders` using the bootstrap admin account.
  - Verify the order appears with correct customer details, line items, and financial calculations.
  - Update status to `confirmed`.
- [ ] **Verify Self-Service Customer Cancellation**:
  - Test cancellation within the 24-hour window (or cancel as customer/admin).
  - Verify order status updates to `cancelled`.
  - Verify variant stock quantity is restored in `product_variants` via `increment_stock`.
