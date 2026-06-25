# Issue 4: Category Management (Admin)

## What to build

Admins need to maintain the list of ticket categories before Users can submit tickets. This is a simple CRUD screen in the Admin area:

- List all categories (name, active/inactive)
- Create a new category
- Edit a category name
- Deactivate a category (hides it from the ticket creation form; does not break existing tickets that use it)

Categories must be available in the ticket creation form (Issue 5), so this slice ships first.

## Acceptance criteria

- [ ] Admin can create a category; it appears in the list immediately
- [ ] Admin can rename a category
- [ ] Admin can deactivate a category; it no longer appears in the ticket creation dropdown
- [ ] Existing tickets referencing a deactivated category still display the category name correctly
- [ ] Non-Admin roles cannot access the category management screen (returns 403 / redirects)
- [ ] Playwright E2E tests:
  - [ ] Admin creates a category, verifies it appears in the list
  - [ ] Admin deactivates a category, verifies it disappears from ticket creation dropdown
  - [ ] Agent attempting to access category management is blocked

## Blocked by

- Issue 3 — Authentication & User Registration
