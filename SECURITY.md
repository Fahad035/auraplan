
# Security Policy

## Supported Versions

Security fixes and vulnerability assessments are primarily focused on the latest code available on the `main` branch.

| Version | Security Support |
| --- | --- |
| Latest version on `main` | Primary focus |
| Older versions | Not guaranteed |

## Reporting a Vulnerability

If you discover a potential security vulnerability in AuraPlan, please report it responsibly.

### How to Report

1. Visit the [AuraPlan GitHub repository](https://github.com/Fahad035/auraplan).
2. Check whether GitHub's private vulnerability reporting or Security Advisories feature is available.
3. If available, submit your report privately through that feature.
4. If private reporting is unavailable, contact the repository maintainer through an appropriate private contact channel listed on their GitHub profile.

**Please do not publish exploitable vulnerability details in a public issue or pull request before the maintainer has had a reasonable opportunity to investigate.**

### Include the Following Information

When possible, include:

- A clear description of the vulnerability.
- The affected component, file, endpoint, or dependency.
- Steps to reproduce the issue.
- The potential impact.
- Relevant logs or screenshots with secrets and personal information removed.
- A suggested mitigation, if known.

Do not include API keys, passwords, access tokens, private user data, or other sensitive information in your report.

## Security Considerations

AuraPlan uses a React and TypeScript frontend, a Vercel serverless API, and Google's Gemini API for AI-powered recommendations.

Security-conscious development should include the following practices.

### API Key Protection

- Store `GEMINI_API_KEY` in local environment configuration or the deployment platform's secret settings.
- Never commit `.env.local` or other files containing real credentials.
- Never expose the Gemini API key through client-side code or `VITE_*` environment variables.
- Rotate the key immediately if it is exposed or suspected to be compromised.

### Input Validation

- Validate API request data on the server.
- Apply sensible limits to request sizes and user-supplied values.
- Validate AI-generated output before using it in the application.
- Do not treat AI-generated content as inherently trustworthy.

### Dependency Security

- Keep Node.js and project dependencies reasonably up to date.
- Review dependency advisories and update vulnerable packages.
- Run the project's available tests and production build after changes.
- Review automated security findings before merging changes.

### Data Privacy

- Avoid collecting or logging unnecessary personal information.
- Do not place sensitive event details, credentials, or personal information in public bug reports.
- Review browser storage before saving sensitive information locally.
- Understand which information is sent to external services when using AI features.

### Deployment Security

- Keep production secrets in Vercel environment-variable settings.
- Review API access controls, rate limits, and resource usage.
- Ensure errors do not expose credentials, internal stack traces, or sensitive configuration.
- Review security-related HTTP headers and deployment settings.

These practices are development and maintenance guidelines; they should not be interpreted as a guarantee that every control is already implemented.

## Scope

This policy applies to the AuraPlan code maintained in the official repository:

https://github.com/Fahad035/auraplan

Thank you for helping improve AuraPlan's security.
