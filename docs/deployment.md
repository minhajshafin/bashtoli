# Deployment

## Hosting

| Service | Role |
|---|---|
| Vercel | Next.js application hosting |
| Supabase | Database, auth, file storage |

## Environments

### Local Development

1. Clone repository
2. Copy `.env.local.example` → `.env.local`
3. Fill in Supabase and Resend credentials
4. Run `npm run dev`

### Staging (Recommended)

- Separate Supabase project or branch
- Vercel preview/staging deployment
- Resend test mode
- Used for owner review before launch (Phase 7–8)

### Production

- Supabase production project
- Vercel production deployment
- Resend production API key
- Sentry DSN configured
- Custom domain (if applicable)

## Environment Variables

See [Tech Stack — Environment Variables](./tech-stack.md#environment-variables-planned) for the full list.

**Critical:** `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client. Verify with `grep` that it does not appear in client bundles.

## Vercel Configuration (Planned)

```
vercel.json (if needed)
├── Build command: next build
├── Output: .next
└── Environment variables set in Vercel dashboard
```

## Supabase Setup

1. Create Supabase project (Phase 1)
2. Run migrations from `supabase/migrations/` in order (`001_` → `008_`)
3. Configure Storage bucket `product-images` (public, 2 MB limit, WebP/JPEG/PNG)
4. Set up RLS policies (migration `008_rls_policies.sql`)
5. Bootstrap first admin user — see section below

## Bootstrapping the First Admin User

There is no admin UI until Phase 2. Use this one-time SQL script to promote
the first user to `admin` immediately after they sign up.

### Step-by-step

1. **Sign up** via the app's login page (or via Supabase Dashboard →
   Authentication → Add user).

2. **Copy the user UUID** from:
   `Supabase Dashboard → Authentication → Users → click the user row → copy UUID`

3. **Open the SQL script** at `supabase/scripts/bootstrap-admin.sql`.

4. **Replace `<USER_UUID>`** on line 19 with the real UUID, e.g.:
   ```sql
   target_user_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
   ```

5. **Run the script** in:
   `Supabase Dashboard → SQL Editor → paste → Run`

6. The script prints a `NOTICE` confirming the promotion and then returns
   a `SELECT` showing all admin profiles for verification.

### Fallback: manual dashboard update

If the SQL Editor is not available, update the role directly:

1. `Supabase Dashboard → Table Editor → profiles`
2. Find the row by user ID
3. Click the `role` cell → change value to `admin` → Save

### Dev environment default credentials

A default admin account has been created for the **development** Supabase project:

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@example.com`    |
| Password | `mypassword123`        |
| Role     | `admin`                |
| UUID     | `570f141c-c3c1-45fb-aec5-93a463932bfc` |

> [!CAUTION]
> **Change these credentials before going to production.**
> Log in to the Supabase Dashboard → Authentication → Users, select this user,
> and update the email and password to the real owner's credentials.
> Alternatively, delete this account and run `bootstrap-admin.sql` with a
> newly signed-up real account.

### Notes

- The script is **idempotent** — safe to run multiple times on the same user.
- Running it on an already-admin user produces the same result.
- **Do not hardcode the UUID** in the repository — always paste it at run time.
- For production: run the script once, then remove the UUID from your clipboard.

## Launch Checklist (Phase 8)

### Pre-Deploy

- [ ] All E2E tests passing
- [ ] Sentry configured and receiving test events
- [ ] Production environment variables set in Vercel
- [ ] Supabase RLS policies reviewed
- [ ] Resend domain verified (production)
- [ ] Owner has entered real product catalog
- [ ] About/Contact pages populated with business info
- [ ] WhatsApp number configured

### Deploy

- [ ] Deploy to Vercel production
- [ ] Verify custom domain (if applicable)
- [ ] Smoke test: browse → cart → checkout → admin order view
- [ ] Verify email notifications (owner + customer)

### Post-Launch

- [ ] Handoff training session with owner/staff
- [ ] Document admin dashboard usage for non-technical users
- [ ] Monitor Sentry for first 48 hours
- [ ] Confirm owner can manage products and orders independently

## Rollback Plan

- Vercel instant rollback to previous deployment
- Database migrations should be backward-compatible or have down migrations
- Keep staging environment available for hotfix verification

## Monitoring Post-Launch

| Tool | What to Watch |
|---|---|
| Sentry | Unhandled errors, checkout failures |
| Vercel Analytics | Page load times, traffic |
| Supabase Dashboard | DB performance, storage usage |
| Resend Dashboard | Email delivery rates |
