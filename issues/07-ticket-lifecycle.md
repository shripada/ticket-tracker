# Issue 7: Ticket Lifecycle Management

## What to build

Implement the full ticket state machine and permission matrix so Agents and Admins can work tickets through to resolution.

**State transitions:**

```
Open → In Progress → On Hold → In Progress → Resolved
                                            → Closed
Any state → Open (reopen)
```

**Permission matrix:**

| Transition                          | User | Agent | Admin |
| ----------------------------------- | ---- | ----- | ----- |
| Create (→ Open)                     | ✅   | ✅    | ✅    |
| Assign + start (→ In Progress)      | ❌   | ✅    | ✅    |
| Place on hold (→ On Hold)           | ❌   | ✅    | ✅    |
| Resume (On Hold → In Progress)      | ❌   | ✅    | ✅    |
| Resolve (→ Resolved)                | ❌   | ✅    | ✅    |
| Close without resolution (→ Closed) | ❌   | ❌    | ✅    |
| Reopen (→ Open)                     | ✅   | ✅    | ✅    |

**Assignment & priority:**

- Agent self-assigns (cannot assign to another Agent)
- Admin can assign to any Agent
- Agent and Admin can set Assigned Priority, overriding Suggested Priority; both values are stored and displayed

**Activity log:**

- Every transition and assignment writes an `ActivityLog` entry with actor, action, and timestamp

## Acceptance criteria

- [ ] All valid transitions are available to the correct roles via the ticket detail UI
- [ ] Invalid transitions are not shown and are rejected server-side
- [ ] Agent cannot close a ticket without resolution (Admin-only)
- [ ] Both Suggested Priority and Assigned Priority are stored and visible when overridden
- [ ] Every state change and assignment creates an ActivityLog entry
- [ ] Playwright E2E tests:
  - [ ] Agent self-assigns, moves ticket Open → In Progress → Resolved
  - [ ] Agent attempts Close — blocked
  - [ ] Admin closes a ticket without resolution — succeeds
  - [ ] User reopens a resolved ticket — succeeds
  - [ ] Activity log reflects each transition in order

## Blocked by

- Issue 6 — Ticket List & Detail Views
