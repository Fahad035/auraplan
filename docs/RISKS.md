# AuraPlan Risk Register

This document records important product, technical, security, and operational risks for AuraPlan. It is a working register, not a claim that all listed mitigations have been independently verified. Each mitigation states what is implemented in the repository and what still needs verification in the deployed environment.

## Risk ratings

- **Likelihood:** Low, Medium, or High.
- **Impact:** Low, Medium, or High.
- Ratings are qualitative and should be revised as the application evolves.
- **Status:** *Mitigated* (a control exists in code and is covered by tests), *Partly mitigated* (a control exists with a known limitation), or *Open* (follow-up needed).

## Risks and mitigations

| ID | Risk | Likelihood | Impact | Status | Mitigation / follow-up |
|---|---|---|---|---|---|
| R-01 | Gemini API key is accidentally exposed | Medium | High | Mitigated | The key is read only on the server (`process.env.GEMINI_API_KEY` in `api/plan.ts`), is never sent to the browser, and `.env*` files are git-ignored. Error responses and logs never include the key, the prompt, or provider responses. Rotate the key immediately if exposure is suspected. |
| R-02 | AI-generated costs are inaccurate or exceed real quotations | High | High | Partly mitigated | The model returns relative budget *weights* only; code converts them to whole-rupee amounts that sum exactly to the budget left after the 10% contingency reserve (largest-remainder rounding, covered by tests). Amounts are labelled as estimates and users are told to verify quotes. Real-world prices cannot be guaranteed. |
| R-03 | Model output is malformed or incomplete | Medium | Medium | Mitigated | Output is parsed and validated against a strict schema on the server; invalid, empty or non-JSON responses return a safe 502, and the browser validates the response again. Covered by API and client tests. |
| R-04 | API endpoint is abused, causing excessive usage or cost | Medium | High | Partly mitigated | Controls in code: structured input only (no client-chosen prompts), strict field limits, a request size limit, content-type checks, a per-IP limit of 10 requests per minute, and a 20 second Gemini timeout. **Limitation:** the rate limiter is in memory, so each serverless instance counts separately and the limit is best-effort. Use a shared store (for example Vercel KV or Upstash) and set provider-side quotas and billing alerts for strict limits. |
| R-05 | Gemini or Vercel service becomes unavailable | Medium | Medium | Mitigated | Transient provider errors (429, 500, 503) are retried once; timeouts return a clear 504; other failures return generic messages without internals. The UI shows the error and keeps the form usable. Retries are limited to one to avoid repeated costs. |
| R-06 | Browser-stored planning data is lost or modified | Medium | Medium | Partly mitigated | Stored plans are validated on load and malformed entries are dropped; save failures show an alert instead of failing silently. Plans can be exported as JSON or Markdown for backup. Data lives only in one browser and does not sync across devices. |
| R-07 | Sensitive event details are sent to an external AI provider | Medium | High | Partly mitigated | Only the event type, date, location, guest count, budget and the user's optional change request are sent; no accounts or contact details are collected. Users should avoid entering personal information in free-text fields. Review Google's current API data-handling terms and retention settings for your key. |
| R-08 | Dependency vulnerability affects the application | Medium | High | Mitigated | `npm audit --omit=dev` runs in CI; CodeQL runs on pushes, pull requests and weekly. Keep dependencies updated and review advisories before releases. |
| R-09 | Security headers or deployment settings are incomplete | Medium | High | Partly mitigated | `vercel.json` sets a Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy and Cross-Origin-Opener-Policy. Production uses a strict CSP (no inline scripts or styles); localhost uses a relaxed policy because Vite's dev server injects inline code. **Verify on the deployed site** that the strict policy is the one served and that the app loads without CSP violations. |
| R-10 | User interface becomes difficult to use with assistive technology | Medium | Medium | Partly mitigated | Implemented: skip link, labelled form controls, linked error messages, visible focus, reduced-motion support, per-page titles, a real 404 page and light/dark themes. axe-core checks run in automated tests (light and dark). This is not a conformance claim: colour contrast and screen-reader behaviour still need manual testing. |
| R-11 | Browser and server validation rules drift apart | Medium | Medium | Mitigated | The API schema is inlined in `api/plan.ts` because Vercel does not bundle relative imports for this ESM function (see ADR 0007). A parity test fails if it drifts from `src/domain/recommendation.ts`. |
| R-12 | Documentation claims features or guarantees that are not implemented | Medium | Medium | Open | Update the README, ADRs and this register with code changes; verify claims before publishing. |
| R-13 | Prompt injection through free-text fields (location, change request) | Medium | Medium | Partly mitigated | User text is sent as JSON-encoded data inside delimited tags, with system instructions telling the model to treat it as data and never follow instructions inside it. All model output is schema-validated, budget arithmetic is done in code, and the model has no tools or access to secrets. Injection can still change the *content* of ideas or task titles, so users should review generated plans. |
| R-14 | Local development settings weaken production security | Low | Medium | Open | The relaxed localhost CSP must never be served in production. Confirm after each deployment that responses on the production domain carry the strict policy (browser DevTools, Network tab, response headers). |
| R-15 | Browser-only persistence is a single point of failure for user data | Medium | Low | Partly mitigated | Same constraints as R-06. Consider account-based storage only if multi-device use becomes a requirement. |

## Priority follow-ups

1. Confirm that no real credentials are tracked by Git.
2. Verify production response headers (especially the strict CSP) and error handling on the deployed site.
3. Move the rate limiter to a shared store and set provider-side quotas and billing alerts.
4. Confirm the configured Gemini model name is available to the production key.
5. Run manual keyboard, screen-reader and colour-contrast checks on the deployed site.
6. Run lint, type-check, tests with coverage, a production build and a dependency audit before every release.
7. Review the data sent to Gemini and the data retained in browser storage.

## Review cadence

Review this document when changing the AI provider, API boundary, persistence strategy, authentication model, deployment platform, or handling of personal data. Update ratings and statuses based on observed behavior and verified controls.