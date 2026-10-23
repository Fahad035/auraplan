# ADR 0009: Share the schema module between the browser and the API

- **Status:** Accepted
- **Date:** 2026-10-23
- **Supersedes:** [ADR 0007](0007-inlined-api-schema.md)

## Context

ADR 0007 copied the request/response schemas, budget allocation and rate limiter into `api/plan.ts` because a relative import failed at runtime (`ERR_MODULE_NOT_FOUND`). The cause was an extensionless import in an ESM function; Node's ESM resolver needs the file extension. The copy added about 160 duplicated lines and needed a parity test.

## Decision

`api/plan.ts` imports `src/domain/recommendation.ts` using an explicit `.js` extension (`../src/domain/recommendation.js`). TypeScript, Vite and Vitest resolve it to the `.ts` source. The inlined copy and the parity test are removed, so there is a single source of truth.

## Consequences

- No duplicated validation code to keep in sync.
- The shared module must stay free of browser-only APIs and must import only packages that are installed for the function (`zod`).
- Verify `/api/plan` on a Vercel preview deployment after any change to the import structure.

## Revisit when

Revisit if the function runtime changes how local imports are resolved or traced.
