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
2. Run migrations from `supabase/migrations/`
3. Configure Storage bucket for product images
4. Set up RLS policies
5. Bootstrap first admin user via SQL script

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
