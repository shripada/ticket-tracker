# Issue 13: Ticket Archival

## What to build

Automatically archive tickets that have been in a terminal state (`Resolved` or `Closed`) for longer than a configurable period (default: 90 days). Archived tickets are read-only — no new comments, attachments, or state transitions are permitted.

**Configuration:**

- Admin can set the archival threshold (in days) via the Admin settings screen
- Setting takes effect on the next archival run; existing archives are not un-archived if the threshold increases

**Background job:**

- A scheduled job (cron or Next.js cron route) runs daily and archives any eligible tickets
- Archival writes an `ActivityLog` entry: "Ticket archived automatically"

**UI:**

- Archived tickets appear in the ticket list with an "Archived" badge
- Archived ticket detail is fully readable but all action buttons (comment, transition, assign) are hidden/disabled
- Users can still search and filter archived tickets

## Acceptance criteria

- [ ] Tickets in `Resolved` or `Closed` state older than the threshold are archived on the next job run
- [ ] Archived tickets cannot receive new comments (API returns 403)
- [ ] Archived tickets cannot change state (API returns 403)
- [ ] Archived tickets appear in search results with an "Archived" badge
- [ ] Admin can update the archival threshold; it applies from the next run onward
- [ ] ActivityLog records each automatic archival
- [ ] Playwright E2E tests:
  - [ ] Ticket in Resolved state with a backdated timestamp is archived by a manual job trigger
  - [ ] Attempting to comment on an archived ticket is blocked
  - [ ] Archived ticket appears in search results with correct badge

## Blocked by

- Issue 7 — Ticket Lifecycle Management
