# ADR 0004 — Cloudinary for Attachment Storage and Image Processing

**Status:** Accepted  
**Date:** 2026-06-25

## Context

Issue 5 (Ticket Creation) requires storing file attachments and converting image uploads to JPG compressed under 1 MB. Two options were considered:

- **Cloudflare R2** — S3-compatible dumb storage with no egress fees. Would require `sharp` on the server for image conversion before upload.
- **Cloudinary** — managed media CDN with a free tier (25 GB storage/bandwidth) and built-in image transformation via URL parameters.

## Decision

Use Cloudinary for attachment upload, storage, and delivery. Do not add `sharp` as a dependency.

## Reasons

- Cloudinary's upload API accepts raw files and returns a permanent CDN URL; no local processing step needed
- Image conversion to JPG and compression to under 1 MB are handled by Cloudinary transformation parameters at upload time, removing a server-side processing pipeline entirely
- Free tier (25 GB) is sufficient for a single-org internal tool
- One fewer native dependency (`sharp` requires platform-specific binaries that complicate CI and serverless deployments)

## Consequences

- Attachments are stored externally; the `Attachment.url` column holds the Cloudinary delivery URL
- Image conversion fidelity depends on Cloudinary's pipeline, not local code
- A `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`) environment variable must be provisioned per deployment
- If Cloudinary is unavailable, attachment upload fails — acceptable for an internal tool where attachments are optional
- Deleting a ticket's attachments requires a Cloudinary API call in addition to the DB delete (not yet implemented; deferred to a cleanup issue)
