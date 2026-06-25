# Issue 9: Search & Filtering

## What to build

Give all roles the ability to find tickets quickly via full-text search and structured filters. Scope is enforced server-side to match role permissions.

**Full-text search** (title + description):

| Role  | Scope            |
| ----- | ---------------- |
| User  | Own tickets only |
| Agent | All tickets      |
| Admin | All tickets      |

**Filters (all roles):**

- Status: Open / In Progress / On Hold / Resolved / Closed
- Priority: Low / Medium / High / Critical (matches Assigned Priority if set, else Suggested Priority)
- Category: any active category
- Assigned Agent: Agent and Admin only (Users do not see this filter)

Filters and search compose (AND logic). Results update without full page reload.

## Acceptance criteria

- [ ] Full-text search returns tickets matching title or description; Users see only their own results
- [ ] Each filter narrows results correctly when applied alone and in combination
- [ ] "Assigned Agent" filter is not visible to Users
- [ ] A User cannot retrieve another user's ticket via search or filter manipulation
- [ ] Playwright E2E tests:
  - [ ] User searches for a keyword present in their own ticket — finds it
  - [ ] User searches for a keyword present only in another user's ticket — no results
  - [ ] Agent filters by status "Open" — sees all open tickets
  - [ ] Combined filter (status + category) returns only matching tickets

## Blocked by

- Issue 6 — Ticket List & Detail Views
