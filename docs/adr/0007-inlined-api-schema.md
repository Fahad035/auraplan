# ADR 0007: Inline the shared schema in the serverless function

- **Status:** Superseded by ADR 0009
- **Date:** 2026-10-22

## Context

`/api/plan` is deployed as an ESM Vercel function. A relative import from a shared helper module failed at runtime (`ERR_MODULE_NOT_FOUND`) because the module was not packaged with the function. Files under `api/` are also treated as server functions, so the browser cannot import them during `vercel dev`.

## Decision

- `api/plan.ts` is self-contained and inlines the request and response schemas, budget allocation and rate limiter.
- `src/domain/recommendation.ts` holds the same code for the browser client and unit tests, and is the source of truth.
- `tests/unit/schema-parity.test.ts` fails if the two copies drift apart.

## Alternatives considered

- **Relative import from the function:** failed in production, as described above.
- **A build step that bundles the function:** removes the duplication but changes the deployment pipeline, which was not worth the risk for this project.

## Consequences

Some duplication is accepted in exchange for a reliable deployment. The parity test removes the main risk of that duplication.

## Revisit when

Revisit if the deployment platform bundles relative imports for ESM functions, or if a bundling step is added to the build.
