# Product Requirements Document — Ticket Tracker

## 1. Overview

A responsive web-based ticket tracking application for a single organisation. Users log issues, Agents resolve them, and Admins manage the system and monitor health via a dashboard.

---

## 2. Goals

- Allow any permitted org member to submit and track support tickets
- Give Agents a clear queue to work from, with full ticket history
- Give Admins visibility into ticket volume, resolution speed, and team health
- Keep onboarding friction low via self-registration within org-controlled gates

## 3. Non-Goals (v1)

- Multi-tenant / SaaS mode
- SSO / OAuth / LDAP integration
- In-app real-time notifications
- SLA engine with automatic breach escalation
- Duplicate ticket detection
- Custom role definitions
- Ticket merging
- Full system-wide audit log

---

## 4. User Roles

| Role      | Description                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| **User**  | Any org member. Submits tickets, tracks own tickets, adds comments.                                                       |
| **Agent** | Support/helpdesk staff. Resolves tickets, self-assigns, overrides priority, adds comments.                                |
| **Admin** | Full control. All Agent capabilities plus dashboard, reports, user management, allowlist management, category management. |

**Role assignment rules:**

- New registrations default to `User`
- Only `Admin` can promote a `User` to `Agent` or `Admin`
- Users cannot self-elevate

---

## 5. Registration & Authentication

### 5.1 Authentication

- Username (email) + password
- App manages credentials (no SSO in v1)
- Email-based self-service password reset ("Forgot password" sends a reset link)

### 5.2 Two-Gate Registration

Registration requires passing **both** gates:

**Gate 1 — Org domain allowlist**

- Admin configures one or more permitted email domains (e.g. `acme.com`)
- Registration is rejected outright if the email domain does not match

**Gate 2 — Explicit email allowlist**

- Admin maintains a list of `(name, email)` pairs representing permitted individuals
- Even within an allowed domain, registration is rejected if the specific email is not on this list
- Removing an email from this list **immediately deactivates** that user's account

### 5.3 Allowlist Management (Admin)

- Admin dashboard screen for managing the email allowlist
- Search by name or email (fast lookup)
- Add entry: name + email
- Remove entry: immediately deactivates the account if already registered

### 5.4 First-Run Setup Wizard

- On first launch, a setup wizard creates the initial Admin account
- Wizard also collects: org name, permitted domain(s)
- No other Admin exists before this step

---

## 6. Ticket Management

### 6.1 Ticket Fields

| Field              | Set By                 | Notes                                            |
| ------------------ | ---------------------- | ------------------------------------------------ |
| Title              | User                   | Short summary                                    |
| Description        | User                   | Full detail                                      |
| Category           | User                   | Selected from Admin-configured list              |
| Suggested Priority | User                   | Low / Medium / High / Critical                   |
| Assigned Priority  | Agent / Admin          | Overrides suggested priority; both values stored |
| Status             | System / Agent / Admin | See lifecycle                                    |
| Assigned To        | Agent (self) / Admin   | Which Agent owns the ticket                      |
| Attachments        | User / Agent / Admin   | On creation and on comments                      |
| Created By         | System                 | The User who submitted                           |
| Created At         | System                 | Timestamp                                        |
| Updated At         | System                 | Timestamp                                        |

### 6.2 Categories

- Admin defines and manages the list of categories (e.g. `Bug`, `IT Support`, `HR`, `General`)
- At least one category must exist before tickets can be created
- Category is required on ticket creation

### 6.3 Priority

- User selects a **suggested priority** at creation: `Low`, `Medium`, `High`, `Critical`
- Agent or Admin can set an **assigned priority**, overriding the suggestion
- Both values are stored and displayed (e.g. "Requested: High | Assigned: Medium")
- Rationale: users tend to inflate priority; Agent override corrects this without erasing the original signal

### 6.4 Ticket Lifecycle

```
Open → In Progress → On Hold → In Progress → Resolved
                                            → Closed
```

**States:**
| State | Meaning |
|---|---|
| `Open` | Newly created, not yet picked up |
| `In Progress` | Assigned to an Agent, actively being worked |
| `On Hold` | Blocked, waiting on external input |
| `Resolved` | Issue fixed and confirmed |
| `Closed` | Dismissed without resolution (duplicate, invalid, out of scope) |

**Transition permissions:**

| Transition                          | User | Agent | Admin |
| ----------------------------------- | ---- | ----- | ----- |
| Create ticket (→ Open)              | ✅   | ✅    | ✅    |
| Assign + start (→ In Progress)      | ❌   | ✅    | ✅    |
| Place on hold (→ On Hold)           | ❌   | ✅    | ✅    |
| Resume (On Hold → In Progress)      | ❌   | ✅    | ✅    |
| Resolve (→ Resolved)                | ❌   | ✅    | ✅    |
| Close without resolution (→ Closed) | ❌   | ❌    | ✅    |
| Reopen (→ Open)                     | ✅   | ✅    | ✅    |

### 6.4a Ticket Rate Limit

- Users may create a maximum of **3 tickets per day** (rolling 24-hour window)
- Agents and Admins are not subject to this limit
- Rejected submissions must show a clear error: "You have reached your daily ticket limit (3). Try again tomorrow."

### 6.5 Attachments

- Allowed on: ticket creation and comments
- **Images**: auto-converted to JPG and compressed to under 1MB
- **All other files**: accepted as-is if under 1MB; rejected if over 1MB
- No restriction on file types
- No limit on number of attachments per ticket or comment

### 6.6 Comments

- All roles (`User`, `Agent`, `Admin`) can add comments
- Comments allowed in all states **except `Closed`**
- Comments support attachments (same rules as above)

### 6.7 Activity Log

- Every ticket has a visible activity timeline
- Logged events: state changes, priority overrides, assignment changes, comments added
- Each entry records: actor, action, timestamp
- Immutable — entries cannot be edited or deleted

---

## 7. Ticket Assignment

- **Self-assign**: Agent browses `Open` tickets and assigns to themselves
- **Admin-assign**: Admin can assign any ticket to any Agent
- Both mechanisms coexist
- Unassigned tickets remain in `Open` state until picked up

---

## 8. Notifications (Email)

Email notifications only (no in-app notifications in v1).

Agents and Admins use the Dashboard to monitor the ticket queue — they are **not** notified on every new ticket creation to avoid inbox flooding.

| Event                    | Recipients                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| Ticket created           | ~~All Agents + all Admins~~ — no notification; Agents/Admins use Dashboard |
| Ticket assigned to Agent | Assigned Agent only                                                        |
| State change             | Ticket creator + assigned Agent                                            |
| New comment added        | Ticket creator + assigned Agent                                            |

---

## 9. Search & Filtering

| Capability                             | User             | Agent       | Admin       |
| -------------------------------------- | ---------------- | ----------- | ----------- |
| Full-text search (title + description) | Own tickets only | All tickets | All tickets |
| Filter by status                       | ✅               | ✅          | ✅          |
| Filter by priority                     | ✅               | ✅          | ✅          |
| Filter by category                     | ✅               | ✅          | ✅          |
| Filter by assigned agent               | ❌               | ✅          | ✅          |

---

## 10. Admin Dashboard

### 10.1 Metrics

- Ticket counts by status (Open, In Progress, On Hold, Resolved, Closed)
- **Opened vs Closed over time** — are tickets resolving faster than they arrive?
- **Average time-to-resolution** — mean duration from `Open` to `Resolved`

### 10.2 Time Range

- Quick-select: Today, This Week, This Month, This Year
- Custom date range picker (any start + end date)
- All charts and metrics respond to the selected range

### 10.3 Export

- **PDF** — formatted report with charts, suitable for sharing with stakeholders
- **CSV** — raw data export suitable for spreadsheet analysis
- Both formats export data for the currently selected time range

---

## 11. User Management (Admin)

- View all registered users
- Search by name or email
- Change a user's role (`User` → `Agent`, `User` → `Admin`, etc.)
- Deactivate an account (blocks login without deleting ticket history)
- Manage email allowlist (see §5.2)

---

## 12. Recommended Tech Stack

| Layer        | Choice                                     | Rationale                                                            |
| ------------ | ------------------------------------------ | -------------------------------------------------------------------- |
| Framework    | Next.js (App Router)                       | Full-stack, responsive out of the box, strong ecosystem              |
| Database     | PostgreSQL                                 | Relational model fits tickets, comments, and activity logs perfectly |
| File storage | S3-compatible (e.g. AWS S3, Cloudflare R2) | Scalable attachment storage, CDN-friendly                            |
| Email        | Resend or AWS SES                          | Transactional email for notifications and password resets            |
| Deployment   | Vercel                                     | Zero-config Next.js hosting, environment management                  |

---

## 13. Archival Policy

- Tickets in `Resolved` or `Closed` state are automatically archived **30 days** after reaching that state
- Archived tickets are read-only — no new comments, no state changes, no reopening
- Archived tickets remain searchable and visible to all roles (Users see their own, Agents/Admins see all)
- The activity log is preserved on archived tickets
- Archival is non-destructive — tickets are flagged as archived, not deleted
