# Issue 12: Admin — Dashboard & Reports

## What to build

An Admin-only dashboard giving visibility into ticket volume, resolution speed, and team health.

**Metrics:**

- Ticket counts by status (Open, In Progress, On Hold, Resolved, Closed)
- **Opened vs Closed over time** — line or bar chart showing whether tickets are resolving faster than they arrive (burn rate)
- **Average time-to-resolution** — mean duration from `Open` to `Resolved` across the selected period

**Time range filter:**

- Preset ranges: Last 7 days, Last 30 days, Last 90 days, Custom date range
- All metrics update when the range changes

**Export:**

- **PDF** — formatted report with charts, suitable for sharing with stakeholders
- **CSV** — raw ticket data for the selected time range, suitable for spreadsheet analysis

## Acceptance criteria

- [ ] Status counts are accurate and update in real time as tickets change state
- [ ] Opened-vs-Closed chart reflects the selected time range correctly
- [ ] Average time-to-resolution is calculated only from tickets that reached `Resolved` status
- [ ] Changing the time range updates all metrics without a full page reload
- [ ] PDF export downloads a formatted document containing charts and summary metrics
- [ ] CSV export downloads raw ticket rows for the selected range
- [ ] Non-Admin roles cannot access the dashboard (returns 403 / redirects)
- [ ] Playwright E2E tests:
  - [ ] Dashboard loads and displays non-zero counts after tickets are created
  - [ ] Time range change updates metrics
  - [ ] PDF download is triggered and file is received
  - [ ] CSV download is triggered and file is received
  - [ ] Agent attempting to access dashboard is blocked

## Blocked by

- Issue 7 — Ticket Lifecycle Management
