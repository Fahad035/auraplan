# ADR 0008: The model decides, code calculates

## Status

Accepted

## Context

Early versions asked Gemini for rupee amounts. Totals could fall short of or
exceed the budget, and tasks could be scheduled before today.

## Decision

- Gemini returns relative budget **weights**, task offsets and vendor advice.
- The server converts weights to whole-rupee amounts that sum exactly to the
  budget after the 10% reserve (largest-remainder rounding).
- Tasks and vendors that would be overdue are pulled forward to today and
  flagged `urgent`, which the UI shows as "Do now".
- The final response is validated again before it is sent to the browser.

## Consequences

Budgets always add up and dates are always achievable. The model can no longer
return exact amounts, which is intentional. Refinement sends the current plan
back as tagged data so revisions stay consistent with it.
