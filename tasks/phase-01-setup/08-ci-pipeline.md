# Task: CI Pipeline

**Phase:** 1 — Setup & Schema  
**Week:** 2

## Goal

Add a GitHub Actions workflow to run lint, type checking, and build verification on every push and pull request. Prevents broken code from merging.

## Requirements

- GitHub Actions workflow at `.github/workflows/ci.yml`
- Trigger: on push to `main`, and on all pull requests
- Steps:
  1. Checkout code
  2. Set up Node.js (match version in `.nvmrc` or `package.json` engines)
  3. Install dependencies (`npm ci`)
  4. Run lint (`npm run lint`)
  5. Run type check (`npx tsc --noEmit`)
  6. Run unit tests (`npm test`)
  7. Run build (`npm run build`) — catches missing env var errors
- Use cached `node_modules` for speed
- Environment variables: use dummy/placeholder values for build step (no real Supabase connection needed for build)

## Acceptance Criteria

- [ ] Workflow file exists and is valid YAML
- [ ] CI passes on a clean push to `main`
- [ ] CI fails if lint errors are introduced
- [ ] CI fails if TypeScript errors are introduced
- [ ] CI fails if build breaks

## Dependencies

- [01-init-nextjs.md](./01-init-nextjs.md)
- [07-unit-testing-setup.md](./07-unit-testing-setup.md)

## Files to Modify

| File | Action |
|---|---|
| `.github/workflows/ci.yml` | Create |

## Definition of Done

- [ ] CI runs automatically on push
- [ ] All steps pass on clean codebase
- [ ] CI extended in Phase 4 to include Playwright E2E tests
