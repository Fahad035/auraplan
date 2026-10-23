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