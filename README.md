# AuraPlan

**GenAI-Powered Planning Assistant for Events & Celebrations**

**Every celebration, beautifully planned.**

AuraPlan is an AI-powered event-planning assistant that helps users organize celebrations through AI-generated recommendations, budget-aware planning, event timelines, and vendor coordination. Built with React, TypeScript, and Google's Gemini API, AuraPlan brings essential planning information together in a single, intuitive dashboard.

---

## What It Does

Provide your event requirements, event date, and total budget, and AuraPlan helps you:

1. **Generate AI-Powered Recommendations (ideas, budget, timeline and vendor checklist)** — Use Google's Gemini model to generate event-planning recommendations based on the user's requirements and budget.
2. **Plan and Monitor Budgets** — Organize planned expenses, review budget allocations, and account for a contingency reserve when generating recommendations.
3. **Create and Organize Events** — Enter event details and maintain a structured view of your celebration's planning information.
4. **Manage Event Timelines** — Review event-related tasks, milestones, and deadlines through the planning dashboard.
5. **Organize Vendor Information** — Keep vendor-related planning details accessible alongside other event information.
6. **Track Planning Progress** — Use the operations dashboard to review event information, budget status, and planning progress.
7. **Access a Responsive Interface** — Work with a modern interface designed for supported desktop and mobile screen sizes.

AuraPlan aims to make event planning more organized and accessible. AI-generated recommendations and expense estimates are suggestions, not guarantees of actual costs.

**Important:** Always verify vendor quotations, contract terms, venue availability, local permits, and other event requirements before making payments or signing agreements.

---

## Quick Start

### Prerequisites

- Node.js and npm.
- Git.
- A Google Gemini API key for AI-powered recommendations.
- Vercel CLI to run the frontend and serverless API together locally.

### Setup

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Fahad035/auraplan.git
cd auraplan
npm install
```

Create a `.env.local` file in the project root and configure your Gemini API key:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace the placeholder with your own API key. Keep this file private and out of version control.

Install the Vercel CLI if necessary:

```bash
npm install -g vercel
```

Start the local application:

```bash
vercel dev
```

Open the local address printed in your terminal. The configured development address is typically:

**http://localhost:3000**

Using `vercel dev` allows the application to access its `/api/plan` serverless endpoint during local development.

### Verify the Application

Run the available automated tests:

```bash
npm test
npm run test:coverage   # enforces coverage thresholds
npm run lint && npm run typecheck
```

Build the production application:

```bash
npm run build
```

Both commands should complete successfully before you deploy changes.

---

## Architecture

AuraPlan separates the React frontend from server-side AI requests.

```text
                    USER
                      |
                      v
          React + TypeScript Frontend
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       Event       Budget      Operations
      Creation    Planning     Dashboard
          |           |           |
          +-----------+-----------+
                      |
                      v
                 /api/plan
             Vercel Serverless API
                      |
                      v
              Zod Request Validation
                      |
                      v
                Google Gemini
                      |
                      v
            Validated API Response
                      |
                      v
              AuraPlan Interface
```

### Key Design Decisions

- **Frontend and backend separation** — AI requests are handled through a serverless API endpoint instead of calling Gemini directly from browser code with a private API key.
- **Type-safe development** — TypeScript supports safer development across frontend and backend code.
- **Request validation** — Zod is used to validate API request data before processing.
- **Budget-aware recommendations** — Event budget and date information are passed to the planning API, with server-side validation and expense constraints.
- **Serverless architecture** — The `/api/plan` endpoint is designed to run as a Vercel serverless function.
- **Browser-side persistence** — Supported planning data can be retained in browser storage, depending on the application's implementation.
- **Responsive user experience** — React, Tailwind CSS, and reusable components support a consistent planning interface.

---

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Backend | Vercel Serverless Functions |
| Generative AI | Google Gemini |
| Schema Validation | Zod |
| Automated Testing | Vitest |
| Deployment | Vercel |
| Version Control | Git and GitHub |

---

## Testing & Quality Assurance

AuraPlan uses Vitest for automated testing and Vite for production builds.

Run the available checks with:

```bash
npm test
npm run build
```

### What These Checks Help Verify

- **Automated tests** — Exercise the application's tested functions and workflows.
- **Production build** — Verify that Vite can compile the application for production.
- **Request validation** — Test request handling and validation behavior where covered by the test suite.
- **Regression prevention** — Rerun tests after changes to help identify unintended behavior.

The exact test count, coverage percentage, and security status depend on the current test suite and the results of the latest run. No test count or coverage percentage is claimed here.

---

## Security Model & Best Practices

AuraPlan includes server-side API handling and request validation. Security depends on the implementation, deployment configuration, and continued maintenance.

### API Key Protection

- Keep `GEMINI_API_KEY` in server-side environment variables.
- Never expose private API credentials through client-side code or `VITE_*` environment variables.
- Keep `.env.local` out of version control.
- Rotate credentials if they are exposed.

### Request Validation

- Validate incoming request data before processing it.
- Apply appropriate limits to user-supplied values and request sizes.
- Validate generated data before relying on it in the user interface.
- Treat AI output as potentially inaccurate and review it before making decisions.

### API and Deployment Security

- Use appropriate request throttling to reduce abuse and excessive API usage.
- Configure security-related HTTP headers.
- Avoid exposing secrets, internal stack traces, or sensitive configuration in error responses.
- Keep dependencies updated and review security advisories.

### Security Reporting

For vulnerability reporting instructions, see [`SECURITY.md`](SECURITY.md).

These practices are not a guarantee that every possible security risk has been eliminated. Review the actual implementation and deployment configuration before making security claims.

---

## Deployment

AuraPlan is deployed on Vercel.

- **Live Application:** https://auraplan-khaki.vercel.app
- **GitHub Repository:** https://github.com/Fahad035/auraplan

### Deployment Steps

1. Import the AuraPlan GitHub repository into Vercel.
2. Configure `GEMINI_API_KEY` in the Vercel project settings.
3. Ensure the environment variable is available to the deployment environments that need it.
4. Deploy the application.
5. Test event creation, API responses, budget behavior, and the operations dashboard in the deployed environment.

Never include your actual API key in the repository, README, screenshots, or public logs.

---

## Future Improvements

Potential areas for further development include:

- More detailed event templates and reusable planning presets.
- Enhanced expense breakdowns and budget comparison tools.
- Calendar integration and deadline reminders.
- Exportable event plans and printable schedules.
- More comprehensive automated tests and coverage reporting.
- Additional accessibility checks and usability improvements.
- More detailed vendor comparison and coordination workflows.

These are possible future enhancements, not claims that the features are already available.

---

## Disclaimer

AuraPlan is an informational event-planning assistant. AI-generated recommendations, budgets, and timelines may be incomplete or inaccurate and should not be treated as professional, legal, financial, or safety advice. Actual prices and requirements vary by vendor, venue, and location.

Always independently verify quotations, contracts, insurance requirements, permits, venue policies, and other relevant details before committing money or making binding arrangements.

---

## License

This project currently declares an MIT license. Refer to the repository's `LICENSE` file for the applicable terms.

---

## Project

**AuraPlan — Every celebration, beautifully planned.**

Built to make planning celebrations more organized, intuitive, and accessible.

- **Developer:** [Fahad035](https://github.com/Fahad035)
- **Repository:** [github.com/Fahad035/auraplan](https://github.com/Fahad035/auraplan)
- **Live Application:** [auraplan-khaki.vercel.app](https://auraplan-khaki.vercel.app)