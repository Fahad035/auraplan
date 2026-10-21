# ADR 0001: Frontend Technology Stack

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

AuraPlan needs a responsive web interface for entering event requirements and reviewing AI-generated recommendations, budget information, timelines, and vendor-related planning details. As a solo-developed project, it benefits from a familiar toolchain, reusable UI components, and straightforward local development.

## Decision

Use the following frontend stack:

- **React** for component-based UI composition.
- **TypeScript** for static typing.
- **Vite** for development and production builds.
- **Tailwind CSS v4** for utility-based styling.
- **React Router** for client-side navigation.
- **Vitest** for automated tests.

## Alternatives considered

- **Plain JavaScript and DOM manipulation:** fewer framework concepts, but less convenient for a multi-view interactive application.
- **A different frontend framework:** viable, but switching would add learning and migration costs without a demonstrated need.
- **A heavier full-stack framework:** could be appropriate later, but the current Vite frontend and Vercel API arrangement is sufficient for the present scope.

## Consequences

### Positive

- Component reuse supports consistent UI behavior.
- TypeScript helps catch some classes of errors before runtime.
- Vite provides a simple development and build workflow.
- Tailwind CSS supports rapid visual iteration.

### Trade-offs

- Client-side state and API behavior still require explicit design and testing.
- Tailwind utility classes can become inconsistent without shared design tokens and component conventions.
- TypeScript cannot guarantee runtime data validity; external data must still be validated.

## Revisit when

Reconsider the stack if the application needs substantial server-rendered content, complex shared state, or requirements that the current tooling cannot meet efficiently.
