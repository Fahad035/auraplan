# ADR 0002: Browser-Side Persistence for Planning State

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

AuraPlan is an individual project whose current scope does not require a dedicated application database. Some supported planning state can be retained in browser storage so users can continue working in the same browser without introducing database operations and hosting complexity.

## Decision

Use browser-side persistence for the planning data that the application currently stores locally. Do not introduce a remote database until a clear requirement—such as accounts, synchronization across devices, collaboration, or durable shared records—justifies it.

This decision does **not** mean that all data remains on the device: event information submitted for AI recommendations may be sent to the AuraPlan serverless endpoint and then to Google's Gemini service as needed to generate a response.

## Alternatives considered

- **A hosted database:** useful for accounts, multi-device synchronization, and shared plans, but introduces schema management, access controls, retention obligations, and operational complexity.
- **In-memory-only state:** simple, but data is lost when the relevant application state or page session is discarded.
- **Browser storage:** low operational overhead, but data is browser-specific and may be cleared or accessible to scripts running in the same origin.

## Consequences

### Positive

- No database service is required for the current local-persistence scope.
- Lower infrastructure and maintenance overhead.
- User data does not need to be stored in a central application database when it is only kept in browser storage.

### Trade-offs

- Browser storage is not a backup and may be cleared by the user or browser.
- Local state does not automatically synchronize across browsers or devices.
- Sensitive information should not be stored in browser storage without a careful privacy and security review.
- The AI request path still involves external processing when Gemini is used.

## Revisit when

Reconsider this decision if AuraPlan adds user accounts, cross-device access, collaborative planning, server-side history, or requirements for durable backups and deletion workflows.
