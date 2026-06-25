# ADR 0001 — Single-Org Deployment Model

**Status:** Accepted  
**Date:** 2026-06-25

## Context

The BRD described a ticketing app for "users in any organisation," which could be interpreted as either a multi-tenant SaaS (one instance, many isolated orgs) or a single-org deployment (one instance per organisation).

## Decision

Single-org deployment: each organisation installs and hosts their own instance of the application.

## Reasons

- The immediate use case is one specific organisation, not a commercial SaaS product
- Single-org eliminates all tenant isolation complexity (data segregation, cross-tenant leakage, per-tenant config)
- Ops burden stays with the deploying org, which is acceptable for an internal tool

## Consequences

- No tenant management screens needed
- All data in the database belongs to one org — no tenant_id columns or row-level security for multi-tenancy
- Scaling is per-deployment, not shared
- If multi-tenancy is needed later, it will require a significant rearchitecture of the data model
