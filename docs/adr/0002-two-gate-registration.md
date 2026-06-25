# ADR 0002 — Two-Gate Registration Model

**Status:** Accepted  
**Date:** 2026-06-25

## Context

The app uses self-registration (users register themselves), but it's a single-org internal tool — random external users must not be able to create accounts.

Two constraints must be satisfied:

1. Only users from the correct organisation can register (domain-level)
2. Even within the org, only specific individuals who have been pre-approved can register (individual-level)

## Decision

Registration requires passing two independent gates:

- **Gate 1 — Domain allowlist**: The email's domain must match one of the Admin-configured permitted domains
- **Gate 2 — Email allowlist**: The specific email address must appear in the Admin-managed `(name, email)` list

Both gates must pass. Failing either rejects registration.

Removing an email from Gate 2 immediately deactivates the corresponding account.

## Reasons

- Gate 1 alone is insufficient: anyone with a company email (including contractors, alumni with lingering addresses) could register
- Gate 2 alone without Gate 1 is manageable but offers no fast "block everyone outside the org" lever
- Together they give Admin both coarse-grained (domain) and fine-grained (individual) control
- One deactivation action (remove from allowlist) immediately revokes access — no separate deactivation step required, reducing offboarding errors

## Consequences

- Admin must add each new joiner to the allowlist before they can register
- Offboarding is a single action with immediate effect
- The allowlist becomes a source of truth for "who is permitted" — it must be kept current
- If the org changes domain, Admin must update Gate 1 config
