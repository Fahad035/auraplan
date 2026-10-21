# ADR 0006: Event Planning Workflow and State Management

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

AuraPlan has an event creation flow and an operations view for reviewing generated planning information. The project is maintained by an individual developer, so state management should remain understandable and avoid introducing infrastructure before the product needs it.

## Decision

Keep the current event creation and operations workflow within the React application, using the project's existing component and state-management approach. Use the existing browser-side persistence mechanisms for supported data that should survive page reloads. Keep API request logic in the shared frontend API module rather than duplicating request handling across UI components.

Do not introduce a global state library, session cache, or server-side event store solely for hypothetical future needs.

## Alternatives considered

- **A dedicated global state library:** can help when shared state becomes complex, but introduces additional concepts and dependencies.
- **A server-side session or database:** supports durable and shared state, but is not required by the current single-user workflow.
- **Component and existing application state:** selected for its lower complexity and fit with the current scope.

## Consequences

### Positive

- Keeps the workflow approachable for a solo maintainer.
- Avoids unnecessary dependencies and infrastructure.
- Encourages separation between UI components and API request logic.

### Trade-offs

- State sharing can become harder as the number of views and workflows grows.
- Browser storage requires defensive parsing and handling of stale or malformed data.
- Local persistence does not provide account-based synchronization or collaboration.

## Revisit when

Reconsider this decision if the application adds complex cross-view interactions, multiple simultaneous plans, collaboration, undo/redo, or server-synchronized accounts. Choose any new state-management approach based on measured complexity.
