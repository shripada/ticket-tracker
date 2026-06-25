# Issue 10: Email Notifications

## What to build

Transactional email notifications sent via Resend (or AWS SES). No in-app notifications in v1 — Agents and Admins monitor the queue via the Dashboard.

**Notification rules:**

| Event                    | Recipients                      |
| ------------------------ | ------------------------------- |
| Ticket assigned to Agent | Assigned Agent only             |
| Ticket state change      | Ticket creator + assigned Agent |
| New comment added        | Ticket creator + assigned Agent |

No notification is sent when a ticket is first created (Agents/Admins use the Dashboard to discover new tickets).

**Email content:**

- Subject: clear description of the event (e.g. "Ticket #42 has been resolved")
- Body: ticket title, current status, direct link to the ticket
- Plain-text fallback alongside HTML

**Local testing:**

- Use Mailpit (or similar local SMTP sink) in the dev/test environment to capture outgoing mail without sending real emails
- Playwright tests verify the correct email was captured by Mailpit

## Acceptance criteria

- [ ] Assigning an Agent sends exactly one email to that Agent
- [ ] Each state change sends exactly one email to creator and assigned Agent (not both if they are the same person)
- [ ] Adding a comment sends exactly one email to creator and assigned Agent (deduped if same person)
- [ ] Creating a ticket sends no notification emails
- [ ] Emails contain the ticket title and a working deep link
- [ ] Playwright E2E tests (via Mailpit):
  - [ ] Assign ticket → Agent receives email
  - [ ] Move ticket to Resolved → creator receives email
  - [ ] Add comment → both creator and Agent receive email
  - [ ] Create ticket → no email sent

## Blocked by

- Issue 7 — Ticket Lifecycle Management
- Issue 8 — Comments & Attachments
