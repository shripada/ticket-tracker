# Issue 2: First-Run Setup Wizard

## What to build

When the application has no Admin account, every route should redirect to `/setup`. The wizard collects the minimum information needed to make the system operational:

- Org name
- Permitted email domain(s) (seeds the Allowlist)
- Initial Admin email + password

On submission, the wizard creates the Admin account and writes the domain allowlist entry. After completion, the app behaves normally and the `/setup` route becomes inaccessible.

## Acceptance criteria

- [ ] Visiting any route with no Admin in the DB redirects to `/setup`
- [ ] `/setup` is inaccessible once an Admin account exists (redirects to login)
- [ ] Wizard form validates: org name required, domain format valid, password meets minimum strength
- [ ] Submitting the wizard creates an Admin user and at least one allowlist domain entry in the DB
- [ ] After wizard completion, the Admin can log in immediately
- [ ] Playwright E2E test: fresh DB → visit `/` → land on `/setup` → complete wizard → land on login → log in as Admin → succeed

## Blocked by

- Issue 1 — Project Scaffold & DB Schema
