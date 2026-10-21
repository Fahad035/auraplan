# AuraPlan Risk Register

This document records important product, technical, security, and operational risks for AuraPlan. It is a working register, not a claim that all listed mitigations have been implemented or independently verified.

## Risk ratings

- **Likelihood:** Low, Medium, or High.
- **Impact:** Low, Medium, or High.
- Ratings are qualitative and should be revised as the application evolves.

## Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation / follow-up |
|---|---|---|---|---|
| R-01 | Gemini API key is accidentally exposed | Medium | High | Keep it in server-side environment variables; ignore local secret files; rotate exposed keys immediately. |
| R-02 | AI-generated costs are inaccurate or exceed real quotations | High | High | Enforce application-level budget constraints, label values as estimates, and ask users to verify vendor quotes. |
| R-03 | Model output is malformed or incomplete | Medium | Medium | Validate output at runtime, handle invalid responses safely, and add tests for malformed output. |
| R-04 | API endpoint is abused, causing excessive usage or cost | Medium | High | Apply request limits, input bounds, monitoring, and appropriate provider-side quotas. Verify whether rate limiting is reliable across serverless instances. |
| R-05 | Gemini or Vercel service becomes unavailable | Medium | Medium | Show clear errors, avoid exposing internals, and test failure states. Consider retry behavior carefully to avoid repeated costs. |
| R-06 | Browser-stored planning data is lost or modified | Medium | Medium | Handle missing or malformed stored values, explain local-storage limitations, and consider export or backup features if needed. |
| R-07 | Sensitive event details are sent to an external AI provider | Medium | High | Minimize submitted data, avoid unnecessary personal information, explain relevant data handling, and review provider terms and retention settings. |
| R-08 | Dependency vulnerability affects the application | Medium | High | Keep dependencies updated, review advisories, run dependency audits, and evaluate automated security findings. |
| R-09 | Security headers or deployment settings are incomplete | Medium | High | Review deployed headers and platform configuration; add a suitable Content Security Policy only after testing application compatibility. |
| R-10 | User interface becomes difficult to use with assistive technology | Medium | Medium | Test keyboard navigation, focus visibility, semantic labels, contrast, and reduced-motion behavior. Avoid claiming conformance without an audit. |
| R-11 | Browser and server validation rules drift apart | Medium | Medium | Maintain explicit schemas and tests for valid values, boundaries, and invalid input. |
| R-12 | Documentation claims features or guarantees that are not implemented | Medium | Medium | Update README, ADRs, and this register with code changes; verify claims before publishing. |

## Priority follow-ups

1. Confirm that no real credentials are tracked by Git.
2. Test API input boundaries and malformed model responses.
3. Verify production response headers and error handling.
4. Confirm the actual behavior and limits of API rate limiting in the deployed environment.
5. Run tests, production builds, and dependency security checks before releases.
6. Review data sent to Gemini and data retained in browser storage.

## Review cadence

Review this document when changing the AI provider, API boundary, persistence strategy, authentication model, deployment platform, or handling of personal data. Update risk ratings based on observed behavior and verified controls.
