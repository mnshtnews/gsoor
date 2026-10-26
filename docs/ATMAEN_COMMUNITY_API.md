# Atmaen community API contract

The public reassurance community is separate from private Atmaen safety cases. No endpoint reads, publishes, or links a `Case`; the feed stores no subject name, phone number, applicant details, or case identifier.

## Public reads

- `GET /api/v1/atmaen/community/posts?page=1&pageSize=10&countryId=&status=&sort=new|active` returns published posts with public author display names, geography, status, content and engagement counts. Anonymous reads are allowed.
- `GET /api/v1/atmaen/community/posts/{id}` returns the post and newest 20 comments. Hidden and missing entries both return 404.

## Authenticated writes

Writes require a Jusoor JWT forwarded server-side by the same-origin BFF.

- `POST /api/v1/atmaen/community/posts`: `{ countryId, cityId, status, message, publicConsent }`.
- `POST /api/v1/atmaen/community/posts/{id}/comments`: `{ text }`.
- `POST /api/v1/atmaen/community/posts/{id}/like`: toggles caller like.
- `POST /api/v1/atmaen/community/posts/{id}/reports`: `{ reason }`.

Creation requires explicit consent, a valid country/city pair, allowlisted status, bounded plain text, and rejects phone/email/URL-like content. Content is never interpreted as HTML. Community entries are explicitly labeled unverified. Reports are persisted without publishing reporter identity.

The existing anonymous OTP/private `/cases` flow is unchanged. A private case never creates a community post; sharing requires a separate deliberate action.

## Moderation

- GET /api/v1/atmaen/community/reports is restricted to SeniorEditor, ManagingEditor, EditorInChief, and SystemAdmin. It returns up to 100 reports for currently published posts; reporter identity is never returned.
- POST /api/v1/atmaen/community/posts/{id}/moderation with { isPublished: false } hides a reported post. The matching CMS view is /cms/atmaen-community; it is separate from private case management.
