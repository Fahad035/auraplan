# Architecture Decision Records

Short records of the significant technical decisions behind AuraPlan: the context, the decision, and its consequences. Add a new numbered record when a decision changes how the system is built or operated.

| ADR                                               | Decision                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- |
| [0001](0001-frontend-stack.md)                    | React, TypeScript, Vite, Tailwind CSS and React Router          |
| [0002](0002-client-side-persistence.md)           | Keep planning state in browser storage, with no database        |
| [0003](0003-serverless-ai-pipeline.md)            | Call Gemini from a serverless API, never from the browser       |
| [0004](0004-budget-constraints-and-validation.md) | Constrain and validate budgets, including a contingency reserve |
| [0005](0005-api-schema-validation.md)             | Validate requests and model output with zod at the API boundary |
| [0006](0006-event-planning-state-management.md)   | Keep workflow state in React and API logic in one client module |
| [0007](0007-inlined-api-schema.md)                | Inline the shared schema in the serverless function             |
| [0009](0009-shared-schema-module.md)              | Share the schema module between the browser and the API         |
| [0008](0008-model-judgment-code-arithmetic.md)    | The model supplies judgment; code does the arithmetic           |

See also [`../ARCHITECTURE.md`](../ARCHITECTURE.md) and [`../RISKS.md`](../RISKS.md).
