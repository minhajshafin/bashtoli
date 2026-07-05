# Task: Production Deployment

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Deploy the application to Vercel production with all environment variables, Supabase production project, and verified smoke test.

## Requirements

- Create Supabase production project (or promote dev)
- Run all migrations on production database
- Bootstrap first admin user in production
- Configure Vercel production deployment
- Set all environment variables in Vercel dashboard
- Configure custom domain (if applicable)
- Verify Resend production domain/email
- Run smoke test: browse → cart → checkout → admin order view
- Follow [Deployment — Launch Checklist](../docs/deployment.md#launch-checklist-phase-8)

## Acceptance Criteria

- [ ] Production site accessible at Vercel URL (and custom domain if configured)
- [ ] All migrations applied to production database
- [ ] First admin user bootstrapped and can log in
- [ ] Smoke test passes on production
- [ ] Email notifications work in production (owner + customer)
- [ ] No service role key exposed in client bundle
- [ ] Sentry receiving production errors

## Dependencies

- All prior phases complete
- [02-sentry-setup.md](./02-sentry-setup.md)
- [01-expand-e2e-tests.md](./01-expand-e2e-tests.md)
- Owner catalog populated
- Branding and contact info finalized

## Files to Modify

| File | Action |
|---|---|
| `vercel.json` | Create (if needed) |
| `docs/deployment.md` | Update |
| `.env.local.example` | Verify complete |

## Definition of Done

- [ ] Production deployment live and stable
- [ ] Launch checklist in [Deployment](../docs/deployment.md) fully checked
- [ ] Rollback plan verified (Vercel instant rollback)
