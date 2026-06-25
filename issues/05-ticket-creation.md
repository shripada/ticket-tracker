# Issue 5: Ticket Creation

## What to build

Any authenticated User, Agent, or Admin can submit a support ticket. The creation form captures all required fields and enforces the configurable rate limit.

**Form fields:**

- Title (required)
- Description (required)
- Category (dropdown — active categories only)
- Suggested Priority: Low / Medium / High / Critical
- Attachments (optional; image files auto-converted to JPG and compressed to <1 MB; other files accepted as-is if <1 MB, rejected if over)

**On successful submission:**

- Ticket is created with status `Open`
- An `ActivityLog` entry is written: "Ticket created by {user}"
- User is redirected to the new ticket's detail page

**Rate limit:**

- Admins configure a maximum number of open tickets per User (stored in system config)
- Attempting to create a ticket when at the limit shows a clear error and blocks submission
- Rate limit applies to `User` role only; Agents and Admins are exempt

## Acceptance criteria

- [ ] Submitting a valid form creates a ticket with status `Open` and redirects to the detail page
- [ ] All fields are validated; missing required fields are highlighted
- [ ] Image attachments are converted to JPG and compressed to <1 MB before storage
- [ ] Non-image attachments >1 MB are rejected with a clear error
- [ ] Activity log records ticket creation
- [ ] User at the rate limit cannot submit a new ticket; receives a descriptive error
- [ ] Agent and Admin are not subject to the rate limit
- [ ] Playwright E2E tests:
  - [ ] User submits a ticket successfully, lands on detail page
  - [ ] User blocked when at rate limit
  - [ ] Image attachment is accepted; oversized non-image is rejected

## Blocked by

- Issue 3 — Authentication & User Registration
- Issue 4 — Category Management
