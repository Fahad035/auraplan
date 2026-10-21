# ADR 0004: Budget Constraints and Expense Validation

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Event-planning recommendations are useful only when their proposed costs are consistent with the user's budget. Generative models can produce estimates that do not add up or exceed the available amount. AuraPlan therefore needs deterministic input checks and server-side constraints around generated expense values.

## Decision

Validate the submitted budget as a safe, valid numeric value and pass it to the serverless planning endpoint. The backend constrains generated expenses to the available planning budget while preserving a contingency allowance of approximately 10% according to the current API implementation.

Budget checks must be performed in application code rather than relying solely on instructions in the AI prompt. Displayed estimates must still be described as estimates, not confirmed vendor prices.

## Alternatives considered

- **Trust the model's arithmetic:** rejected because generated text and values may be inconsistent.
- **Prompt instructions alone:** useful guidance but not a deterministic enforcement mechanism.
- **Deterministic server-side constraints:** selected because the server can reject or adjust invalid generated values before returning them.

## Consequences

### Positive

- Reduces the likelihood of returning expense recommendations that exceed the configured planning allowance.
- Separates numerical constraints from natural-language generation.
- Encourages clear communication that budgets are estimates.

### Trade-offs

- A total budget constraint cannot guarantee that estimates match real vendor prices.
- Invalid or incomplete model output may need to be rejected or regenerated.
- A contingency percentage is a planning policy, not a universal financial rule.
- Currency, rounding, taxes, service charges, and location-specific prices may require additional domain logic.

## Revisit when

Reconsider the policy if AuraPlan adds multiple currencies, tax and fee calculations, detailed category allocations, user-configurable contingency percentages, or a deterministic client-side reconciliation engine. Do not claim mathematical reconciliation unless it is implemented and tested.
