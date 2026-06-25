# ADR 0003 — Email-Only Notifications (v1)

**Status:** Accepted  
**Date:** 2026-06-25

## Context

Users, Agents, and Admins need to be informed when key ticket events occur (creation, assignment, state changes, comments). Two delivery mechanisms were considered: email and in-app (notification bell/inbox).

## Decision

v1 delivers notifications via email only. No in-app notification system.

## Reasons

- Email requires zero additional infrastructure — every user already has it
- In-app notifications require: WebSocket or polling infrastructure, a notification inbox UI component, read/unread state management, per-user notification preferences — significant scope for an ancillary feature
- Email covers all the notification use cases with negligible implementation cost

## Consequences

- Users must check their email to learn about ticket activity
- No notification badge or bell icon in the UI
- If users have noisy inboxes, they may miss notifications — acceptable risk for v1
- In-app notifications are a natural v2 addition once core flows are validated
