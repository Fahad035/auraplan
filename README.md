# AuraPlan

**AI-powered planning assistant for weddings, birthdays and community events.**
Every celebration, beautifully planned.

- **Live app:** https://auraplan-khaki.vercel.app
- **Repository:** https://github.com/Fahad035/auraplan

Describe your event once (type, date, location, guests, budget) and AuraPlan builds a plan you can edit and track:

- **Budget:** a category split that always adds up to exactly your budget after a 10% contingency reserve.
- **Timeline:** milestones with real calendar dates counted back from the event day. Anything already overdue is pulled to today and flagged **Do now**.
- **Vendor checklist:** the vendors to book, what to look for, a question to ask and a book-by date. Booked status is saved in your browser.
- **Personalized ideas:** each idea explains why it fits your event, location and guest count.
- **Refine:** ask for changes in plain words ("make it cheaper"). The plan is revised, not restarted, and completed tasks and booked vendors are kept.
- **Export and print:** download JSON or a Markdown summary, or print the plan.

> Plans are AI-generated suggestions. Verify quotes, contracts, permits and availability before paying or signing anything.

## Challenge, approach and assumptions

**Chosen vertical:** Challenge 5, Celebration & Event Planner. AuraPlan helps a host who is organizing a wedding, birthday or community event on a fixed budget.

**Approach and logic**
- The host gives the event type, date, location, guest count and budget. The planner turns that context into decisions: how to split the budget, which tasks to do and when, which vendors to book, and which ideas fit.
- The AI model supplies judgment (relative budget weights, task offsets, vendor advice, tailored ideas). Plain code does the arithmetic, so budgets always add up and dates are always achievable.
- Time pressure changes the plan: tasks that would already be overdue are pulled to today and flagged "Do now", and vendor book-by dates are capped at today.
- The host stays in control: every task, expense and vendor is editable, and "Refine plan" revises the plan from a plain-language request while keeping completed tasks and booked vendors.

**Assumptions**
- Amounts are in Indian rupees (INR), and a 10% contingency reserve is held back from the budget.
- Costs and vendor advice are estimates, not quotes. Vendor names are generic roles, never real businesses.
- Plans are stored in the browser only (no accounts), so they do not sync across devices.
- Dates are calendar dates in the host's local time; the server compares them in UTC.

## How it works

```
Browser (React + TypeScript)
  │  POST /api/plan  (create or refine)
  ▼
api/plan.ts — Vercel serverless function
  content-type + size checks → rate limit → zod request validation
  → Gemini (structured JSON, 20 s timeout, one retry on 429/5xx)
  → zod validation of the model output
  → deterministic enrichment (budget amounts, urgency flags)
  → zod validation of the response → JSON
```

**The model does the judgment and code does the arithmetic.** Gemini returns relative budget weights, task offsets and vendor advice. The server turns weights into whole-rupee amounts that sum exactly to the available budget (largest-remainder rounding) and flags tasks that would already be overdue. Language models are unreliable at both, so plans never contain totals that do not add up.

| Path | Responsibility |
|---|---|
| `api/plan.ts` | HTTP handler, prompt, Gemini call, enrichment. Self-contained (see ADR 0007). |
| `src/domain/recommendation.ts` | Shared zod schemas and pure helpers (also inlined into the API). |
| `src/domain/planBuilder.ts` | Turns API results into plan data; applies refinements. |
| `src/domain/*.ts` | Budget, timeline, checklist, export and storage-schema logic. |
| `src/features/` | Assistant (creation form) and operations dashboard UI. |

## Run locally

Requires Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env.local      # then set GEMINI_API_KEY
npx vercel dev                  # http://localhost:3000 (frontend + /api/plan)
```

`GEMINI_MODEL` optionally overrides the default model.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test:coverage   # enforces coverage thresholds
npm run build
```

Tests cover the domain logic, the `/api/plan` handler (405/413/415/429/400/500/502/504 paths, retries, urgency flags, refinement), prompt construction and the injection boundary, the browser API client, storage, export, schema parity between the API and the client, and axe accessibility checks on the creation form and the operations page in both themes. CI runs lint, type check, coverage and `npm audit` on every push, plus CodeQL.

## Quality, by the judging criteria

| Criterion | Evidence | Where |
|---|---|---|
| Code quality | Strict TypeScript (`strict`), ESLint with complexity, nesting and parameter limits and `--max-warnings=0`, Prettier and EditorConfig, small single-purpose modules, and shared UI primitives. Business rules are pure functions in `src/domain`. Every field limit is declared once in `LIMITS`. | `eslint.config.js`, `src/domain/`, `src/components/ui/` |
| Security | Server-side API key, strict zod validation of requests and model output, a 16 KB body cap, content-type and rate-limit checks, user text passed to the model only as tagged JSON data, a strict CSP and security headers, generic error messages, and `npm audit` plus CodeQL in CI. | `api/plan.ts`, `vercel.json`, `.github/workflows/` |
| Efficiency | The model returns only judgment (weights, offsets, advice) and code does the arithmetic. Edits recompute locally with no extra AI call. The operations page is code-split, requests have a 20 s timeout with one retry on transient errors, and responses are never cached on shared caches. | `src/domain/planBuilder.ts`, `src/app/routes.tsx` |
| Testing | 159 tests across domain logic, the API handler (every status path), the browser client, storage, export, components and full user flows, plus axe checks. Coverage is about 97% statements, and CI enforces minimum thresholds. A parity test keeps the API's inlined schema identical to the shared one. | `tests/`, `vite.config.ts` |
| Accessibility | Skip link, landmarks, labelled controls, errors announced and moved into focus, live status messages, keyboard operation, visible focus rings, light and dark themes, reduced motion, and axe checks on the creation form and operations page in both themes. | `tests/accessibility/`, `src/index.css` |
| Problem alignment | Weddings, birthdays and community events, each with a budget, a dated timeline, a vendor checklist and personalized ideas, plus plain-language refinement and export. | `src/features/`, `api/plan.ts` |

## Security

- `GEMINI_API_KEY` exists only as a server-side environment variable. `.env*` files are git-ignored.
- Both trust boundaries use strict zod schemas: user input (enums, bounded numbers, a real calendar date, length-capped text, unknown keys rejected, 16 KB body cap) and model output (anything off-schema returns 502 and is never forwarded).
- User text reaches the model only as JSON inside tagged data blocks, and the system instruction says to treat them as data, never as instructions.
- Headers in `vercel.json`: a Content-Security-Policy that limits scripts to same-origin plus one pinned hash (`'unsafe-inline'` is allowed for styles only, because Vite's dev server injects inline styles), HSTS, `nosniff`, referrer and permissions policies, COOP and `frame-ancestors 'none'`.
- Errors returned to users are generic; logs never include the API key, prompts or user text.
- **Known limit:** the rate limiter is in memory per function instance, so it is a best-effort guard. For strict global limits, add a Vercel Firewall rate-limit rule or a shared store.

## Accessibility

Semantic landmarks, a skip link, a label on every control, errors announced with `role="alert"` and moved into focus, live status messages, keyboard operation with visible focus rings, reduced-motion support, light and dark themes, and automated axe checks in CI. This is not a formal WCAG audit.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/RISKS.md`](docs/RISKS.md), [`docs/adr/`](docs/adr/) (architecture decisions) and [`SECURITY.md`](SECURITY.md).

## Disclaimer and license

AuraPlan is informational and not professional, legal, financial or safety advice. MIT licensed; see `LICENSE`.