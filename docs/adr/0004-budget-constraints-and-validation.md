# ADR 0003: Serverless AI Recommendation Pipeline

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

AuraPlan uses Google's Gemini model to generate event-planning recommendations. Calling Gemini directly from the browser with a private API key would expose that credential to users and browser tooling.

The project needs a simple backend boundary without maintaining a dedicated long-running server.

## Decision

Route AI recommendation requests through the Vercel serverless endpoint at `/api/plan`. The endpoint uses the server-side `GEMINI_API_KEY` environment variable and validates request data before calling the model.

The frontend calls the application endpoint; it must not contain the private Gemini API key.

## Request flow

1. A user submits event requirements, event date, and budget through the frontend.
2. The frontend sends a request to `/api/plan`.
3. The serverless handler validates the request.
4. The handler sends an appropriately constructed request to Gemini.
5. The server validates and constrains the returned planning data.
6. The API responds to the frontend, which presents the recommendations.

## Alternatives considered

- **Direct browser-to-Gemini requests with a private key:** rejected because the key would be exposed.
- **A separately hosted persistent backend:** viable, but adds deployment and maintenance overhead for the current project.
- **A different managed AI provider:** possible, but Gemini is the selected provider for this implementation.

## Consequences

### Positive

- Private credentials remain on the server side when configured correctly.
- The frontend is decoupled from provider credentials and can call a stable application endpoint.
- Serverless deployment reduces the need to operate a dedicated server.

### Trade-offs

- Requests depend on network connectivity, provider availability, provider limits, and deployment configuration.
- AI usage may incur costs depending on the account and model.
- Serverless instances may not share in-memory state reliably; in-memory rate limiting should not be treated as a globally consistent distributed limit.
- Request timeouts, abuse protection, and provider errors must be handled explicitly.

## Revisit when

Reconsider this architecture if sustained traffic, background processing, multi-provider routing, streaming, or stronger centralized usage controls require a different backend design.
