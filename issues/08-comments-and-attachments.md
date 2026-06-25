# Issue 8: Comments & Attachments

## What to build

Add the comment thread to the ticket detail view and allow file attachments on both ticket creation (already wired in Issue 5) and comments.

**Comment thread:**

- Any authenticated user who can view the ticket (role-scoped per Issue 6) can add a comment
- Comments display: author name, timestamp, body (markdown supported), attachments
- Comments are immutable after posting (no edit/delete in v1)

**Attachments on comments:**

- Same attachment rules as ticket creation: images → JPG, compressed <1 MB; other files <1 MB accepted; >1 MB rejected
- Multiple attachments per comment allowed
- Attachments stored in S3-compatible storage; displayed as download links (images shown inline as thumbnails)

**Activity log:**

- Each new comment writes an `ActivityLog` entry: "Comment added by {user}"

## Acceptance criteria

- [ ] User can add a comment to their own ticket
- [ ] Agent/Admin can add a comment to any ticket
- [ ] Comments appear in chronological order below the activity log
- [ ] Image attachment on a comment is compressed and stored; thumbnail shown inline
- [ ] Non-image attachment >1 MB is rejected with a clear error
- [ ] Activity log records each comment addition
- [ ] Playwright E2E tests:
  - [ ] User adds a plain-text comment; it appears immediately
  - [ ] User attaches an image to a comment; thumbnail renders
  - [ ] Oversized non-image attachment is rejected
  - [ ] Agent adds a comment to a ticket they did not create

## Blocked by

- Issue 6 — Ticket List & Detail Views
