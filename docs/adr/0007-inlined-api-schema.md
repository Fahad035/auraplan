# ADR 0007: Inline the shared schema in the serverless function

## Status

Accepted

## Context

`/api/plan` is deployed as an ESM Vercel function. A relative import from
`api/_shared/` failed at runtime (`ERR_MODULE_NOT_FOUND`) because the helper
module was not packaged with the function. Files under `api/` are also treated
as server functions, so the browser cannot import them during `vercel dev`.

## Decision

- `api/plan.ts` is self-contained and inlines the request/response schemas,
  budget enforcement and rate limiter.
- `src/domain/recommendation.ts` holds the same schemas for the browser client
  and unit tests.
- `tests/unit/schema-parity.test.ts` fails if the two copies drift apart.

## Consequences

Some duplication is accepted in exchange for a reliable deployment. The parity
test removes the main risk of that duplication.
