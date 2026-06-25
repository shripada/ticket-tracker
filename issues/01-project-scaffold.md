# Issue 1: Project Scaffold & DB Schema

## What to build

Bootstrap the full project foundation so all subsequent slices can build on a consistent, working base. This covers everything that is shared infrastructure rather than a user-facing feature.

- **Next.js App Router** project with TypeScript
- **PostgreSQL** database (local via Docker Compose, Vercel Postgres for production)
- **Prisma** schema covering all entities: `User`, `Ticket`, `Comment`, `Attachment`, `Category`, `ActivityLog`, `Allowlist`
- Dev seed script populating representative data for each role
- **Playwright** E2E test setup: shared test utilities, authenticated session helpers, CI config (GitHub Actions)
- **Prettier** configured project-wide with a pre-commit format check
- **Git** repository initialised with **commitlint** (`@commitlint/config-conventional`) enforced via commit-msg hook (Husky)
- Remote repository created and pushed using `gh` CLI

Every subsequent slice must ship at least one Playwright E2E test using the helpers established here.

## Acceptance criteria

- [ ] `npm run dev` starts the app with no errors
- [ ] Prisma migrations run cleanly; seed script populates all entity types
- [ ] `npx playwright test` runs (zero tests pass, zero fail — just the harness works)
- [ ] Prettier formats all files on `npm run format`; pre-commit hook blocks unformatted commits
- [ ] `git log` shows an initial commit; `gh repo view` confirms the remote exists
- [ ] A non-conventional commit message (e.g. `wip stuff`) is rejected by commitlint
- [ ] GitHub Actions CI runs on push: installs deps, runs Prisma migrate, runs Playwright

## Blocked by

None — can start immediately.
