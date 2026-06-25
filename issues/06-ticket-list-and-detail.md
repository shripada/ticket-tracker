# Issue 6: Ticket List & Detail Views (Role-Scoped)

## What to build

The main working surface for all roles. Access is scoped by role — Users see only their own tickets; Agents and Admins see all tickets.

**Ticket list view:**

- Displays: ticket ID, title, category, suggested priority, assigned priority (if overridden), status, assigned agent, created date
- Role scoping enforced server-side (not just UI-hidden)
- Default sort: newest first

**Ticket detail view:**

- All ticket fields
- Assigned Agent (if any)
- Full activity log timeline (chronological)
- Comment thread placeholder (comments added in Issue 8)
- Attachments list with download links

## Acceptance criteria

- [ ] User sees only their own tickets in the list; cannot access another user's ticket detail by URL
- [ ] Agent and Admin see all tickets
- [ ] Ticket detail displays all fields, activity log, and attachment links
- [ ] Attempting to access a ticket you don't own (as User) returns 403
- [ ] Playwright E2E tests:
  - [ ] User logs in, sees only own tickets
  - [ ] Agent logs in, sees all tickets including those from other users
  - [ ] User attempting to access another user's ticket URL is blocked
  - [ ] Ticket detail page renders all fields correctly

## Blocked by

- Issue 5 — Ticket Creation
