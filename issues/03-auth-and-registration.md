# Issue 3: Authentication & User Registration

## What to build

End-to-end auth covering all three flows a user encounters:

**Login & session**

- Credentials-based login (email + password)
- Persistent session (NextAuth or equivalent)
- Logout clears session

**Password reset**

- "Forgot password" flow: enter email → receive reset link (Resend/SES) → set new password
- Reset tokens expire after 1 hour; single-use

**Registration with two-gate allowlist check**

- Registration form: name, email, password
- Gate 1: email domain must match a permitted domain set in the Setup Wizard
- Gate 2: email must appear in the Allowlist
- Failing either gate shows a clear error; no account is created
- Successful registration creates a `User`-role account (cannot self-elevate)
- Deactivated accounts are blocked from login with a descriptive message

## Acceptance criteria

- [ ] Admin (created via wizard) can log in and log out
- [ ] User with allowlisted email can register and log in
- [ ] Registration is rejected when email domain is not permitted
- [ ] Registration is rejected when email is not on the allowlist
- [ ] Deactivated account cannot log in
- [ ] Password reset email is sent; link sets a new password; old link cannot be reused
- [ ] Playwright E2E tests:
  - [ ] Happy-path registration → login
  - [ ] Registration blocked by domain mismatch
  - [ ] Registration blocked by allowlist miss
  - [ ] Login with wrong password shows error
  - [ ] Password reset flow completes successfully

## Blocked by

- Issue 1 — Project Scaffold & DB Schema
- Issue 2 — First-Run Setup Wizard
