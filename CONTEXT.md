# Domain Glossary — Ticket Tracker

## Ticket

A record submitted by a User describing an issue that needs resolution. A Ticket has a lifecycle: it is created, worked on, and eventually Resolved or Closed.

## User

A registered org member with the lowest privilege level. Can create Tickets, view their own Tickets, add Comments, and reopen Tickets. Cannot assign, resolve, or close Tickets.

## Agent

A registered org member responsible for resolving Tickets. Can assign Tickets to themselves, change Ticket state (except Close), and override Priority. Cannot access the Admin Dashboard or manage users.

## Admin

A registered org member with full system access. Inherits all Agent capabilities and additionally: manages the email Allowlist, manages user roles, accesses the Dashboard, exports Reports, closes Tickets without resolution, and configures Categories.

## Suggested Priority

The urgency level a User assigns to their own Ticket at creation time (Low / Medium / High / Critical). Represents the submitter's perspective. Always stored even when overridden.

## Assigned Priority

The urgency level set by an Agent or Admin, overriding the Suggested Priority. Represents the team's triage decision. Both values are visible on the Ticket.

## Status

The current state of a Ticket in its lifecycle. One of: Open, In Progress, On Hold, Resolved, Closed.

## Open

Initial status of a newly created Ticket. No Agent has picked it up yet.

## In Progress

A Ticket that has been assigned to an Agent and is actively being worked on.

## On Hold

A Ticket that cannot progress until external input is received (e.g. waiting on the User for more information). Not abandoned — expected to resume.

## Resolved

A Ticket whose underlying issue has been fixed and confirmed. Terminal state reachable only by Agents or Admins.

## Closed

A Ticket dismissed without resolution — e.g. a duplicate, invalid request, or out-of-scope item. Terminal state reachable only by Admins. No further Comments permitted.

## Comment

A text message (optionally with Attachments) added to a Ticket by any role. Used for clarification, updates, or back-and-forth. Allowed in all states except Closed.

## Activity Log

An immutable, chronological timeline on each Ticket recording every state change, priority override, assignment change, and Comment, with actor and timestamp. Cannot be edited or deleted.

## Allowlist

A list of `(name, email)` pairs maintained by an Admin. Defines which individuals are permitted to self-register. Removing an entry immediately deactivates the corresponding account.

## Category

An Admin-defined classification label applied to a Ticket at creation (e.g. Bug, IT Support, HR, General). Used for filtering, grouping, and reporting.

## Dashboard

An Admin-only view displaying ticket volume metrics, opened-vs-closed trend, and average time-to-resolution for a selected time range.

## Burn Rate

Shorthand for the opened-vs-closed trend chart on the Dashboard — whether the team is resolving Tickets faster than new ones arrive.

## Time-to-Resolution

The mean duration from a Ticket entering the Open state to reaching the Resolved state, measured over the selected Dashboard time range.

## Report

A generated export of Dashboard data for a selected date range. Available in PDF (formatted, for stakeholders) and CSV (raw data, for analysis).

## Assigned Priority Override

The act of an Agent or Admin setting an Assigned Priority that differs from the User's Suggested Priority. Both values remain stored.

## Setup Wizard

A one-time first-run flow that creates the initial Admin account and configures the org domain allowlist. Runs only when no Admin account exists.

## Ticket Rate Limit

A constraint preventing a User from creating more than 3 Tickets within a rolling 24-hour window. Applies to Users only; Agents and Admins are exempt.

## Archived Ticket

A Ticket in the `Resolved` or `Closed` state that has passed the 30-day archival threshold. Archived Tickets are read-only (no comments, no state changes, no reopening) but remain visible and searchable. Archival is non-destructive — the Ticket and its Activity Log are preserved.
