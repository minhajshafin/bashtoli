# Task: Unit Testing Setup

**Phase:** 1 — Setup & Schema  
**Week:** 2

## Goal

Install and configure Vitest for unit testing server actions, utilities, and business logic. Establishes the testing pattern used in all subsequent phases.

## Requirements

- Install `vitest` and `@vitejs/plugin-react`
- Configure `vitest.config.ts` with proper path aliases to match `tsconfig.json`
- Create `tests/unit/` directory
- Write one example unit test to verify setup (e.g., test the order number format utility once created)
- Unit tests run in isolation — no live Supabase connection required
- Add `test` script to `package.json`: `vitest run`
- Add `test:watch` script: `vitest`

## Acceptance Criteria

- [x] `npm test` runs Vitest and all tests pass
- [x] TypeScript types resolve correctly in test files
- [x] Example unit test passes
- [x] Test output is clear and readable

## Dependencies

- [01-init-nextjs.md](./01-init-nextjs.md)

## Files to Modify

| File | Action |
|---|---|
| `vitest.config.ts` | Create |
| `tests/unit/example.test.ts` | Create |
| `package.json` | Update (add test scripts) |

## Definition of Done

- [x] Vitest installed and configured
- [x] `npm test` exits with code 0
- [x] Pattern documented for writing unit tests alongside server actions
