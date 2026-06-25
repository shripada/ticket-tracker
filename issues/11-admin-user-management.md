# Issue 11: Admin — User Management & Allowlist

## What to build

Admin-only screens for managing who can access the system and what role they hold.

**User management:**

- List all registered users (name, email, role, status: active/deactivated)
- Search by name or email
- Change a user's role: `User` → `Agent`, `User` → `Admin`, or any role downgrade
- Deactivate an account (blocks login immediately; ticket history preserved)
- Reactivate a deactivated account

**Allowlist management:**

- List all allowlist entries (name + email)
- Search by name or email
- Add a new entry (name + email)
- Remove an entry — if the user has already registered, their account is deactivated immediately

## Acceptance criteria

- [ ] Admin can view and search all users
- [ ] Admin can promote a User to Agent or Admin
- [ ] Admin can deactivate a user; that user cannot log in while deactivated
- [ ] Admin can reactivate a deactivated user; they can log in again
- [ ] Removing an allowlist entry for a registered user deactivates that account immediately
- [ ] Non-Admin roles cannot access user management or allowlist screens
- [ ] Playwright E2E tests:
  - [ ] Admin promotes User to Agent; Agent can now access Agent-only actions
  - [ ] Admin deactivates user; deactivated user's login attempt is blocked
  - [ ] Admin removes allowlist entry for a registered user; that user is immediately deactivated

## Blocked by

- Issue 3 — Authentication & User Registration
