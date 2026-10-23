#!/usr/bin/env python3
"""Option B: remove the duplicated schema/limiter code from api/plan.ts and
import it from src/domain/recommendation.ts instead. Run from the repo root:

    python3 share_schema.py

Then run: npx prettier --write . && npm run check
Deploy to a Vercel PREVIEW and test /api/plan before relying on it.
"""
import pathlib
import re
import sys

root = pathlib.Path(".")
plan = root / "api/plan.ts"
shared = root / "src/domain/recommendation.ts"
if not plan.exists() or not shared.exists():
    sys.exit("Run this from the repository root.")


def must_replace(path: pathlib.Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if text.count(old) != 1:
        sys.exit(f"Expected exactly one match in {path}:\n  {old[:80]}")
    path.write_text(text.replace(old, new), encoding="utf-8")


# --- api/plan.ts: drop the inlined copy, import the shared module ------------
text = plan.read_text(encoding="utf-8")
start = text.index("// NOTE: everything between here and MAX_REQUEST_BYTES")
end = text.index("const MAX_REQUEST_BYTES")
text = text[:start] + text[end:]
text = text.replace('import { z } from "zod";\n', "", 1)
text = text.replace(
    "} from \"@google/genai\";\n",
    "} from \"@google/genai\";\n\n"
    "// The explicit .js extension is required by Node's ESM resolver at runtime;\n"
    "// TypeScript and Vite resolve it to recommendation.ts.\n"
    "import {\n"
    "  CONTINGENCY_PERCENT,\n"
    "  ModelOutputSchema,\n"
    "  PlanRequestSchema,\n"
    "  RecommendationSchema,\n"
    "  allocateBudget,\n"
    "  createRateLimiter,\n"
    "  type ModelOutput,\n"
    "  type PlanRequest,\n"
    "  type Recommendations,\n"
    "} from \"../src/domain/recommendation.js\";\n",
    1,
)
text = re.sub(
    r"type PlanRequest = z\.infer<typeof PlanRequestSchema>;\n"
    r"type ModelOutput = z\.infer<typeof ModelOutputSchema>;\n"
    r"type Recommendations = z\.infer<typeof RecommendationSchema>;\n\n",
    "",
    text,
    count=1,
)
plan.write_text(text, encoding="utf-8")

# --- shared module: export what the function needs ---------------------------
must_replace(
    shared,
    "// --- exports (the API function inlines everything above this line) ---\n",
    "// --- public API ---\n",
)
must_replace(
    shared,
    "export type PlanRequest = z.infer<typeof PlanRequestSchema>;\n",
    "export type PlanRequest = z.infer<typeof PlanRequestSchema>;\n"
    "export type ModelOutput = z.infer<typeof ModelOutputSchema>;\n",
)

# --- remove the now-pointless parity test ------------------------------------
parity = root / "tests/unit/schema-parity.test.ts"
if parity.exists():
    parity.unlink()

# --- docs ---------------------------------------------------------------------
adr7 = root / "docs/adr/0007-inlined-api-schema.md"
adr7_text = adr7.read_text(encoding="utf-8")
adr7.write_text(
    adr7_text.replace("- **Status:** Accepted", "- **Status:** Superseded by ADR 0009"),
    encoding="utf-8",
)
(root / "docs/adr/0009-shared-schema-module.md").write_text(
    """# ADR 0009: Share the schema module between the browser and the API

- **Status:** Accepted
- **Date:** 2026-10-23
- **Supersedes:** [ADR 0007](0007-inlined-api-schema.md)

## Context

ADR 0007 copied the request/response schemas, budget allocation and rate limiter into `api/plan.ts` because a relative import failed at runtime (`ERR_MODULE_NOT_FOUND`). The cause was an extensionless import in an ESM function; Node's ESM resolver needs the file extension. The copy added about 160 duplicated lines and needed a parity test.

## Decision

`api/plan.ts` imports `src/domain/recommendation.ts` using an explicit `.js` extension (`../src/domain/recommendation.js`). TypeScript, Vite and Vitest resolve it to the `.ts` source. The inlined copy and the parity test are removed, so there is a single source of truth.

## Consequences

- No duplicated validation code to keep in sync.
- The shared module must stay free of browser-only APIs and must import only packages that are installed for the function (`zod`).
- Verify `/api/plan` on a Vercel preview deployment after any change to the import structure.

## Revisit when

Revisit if the function runtime changes how local imports are resolved or traced.
""",
    encoding="utf-8",
)

adr_index = root / "docs/adr/README.md"
index_text = adr_index.read_text(encoding="utf-8")
row7 = re.search(r"^\| \[0007\].*\|\n", index_text, re.M)
if not row7:
    sys.exit("Could not find the ADR 0007 row in docs/adr/README.md")
adr_index.write_text(
    index_text.replace(
        row7.group(0),
        row7.group(0)
        + "| [0009](0009-shared-schema-module.md) | Share the schema module between the browser and the API |\n",
    ),
    encoding="utf-8",
)

arch = root / "docs/ARCHITECTURE.md"
arch_text = arch.read_text(encoding="utf-8")
line = "- [ADR 0008: The Model Decides, Code Calculates](adr/0008-model-judgment-code-arithmetic.md)\n"
if line not in arch_text:
    sys.exit("Could not find the ADR 0008 line in docs/ARCHITECTURE.md")
arch.write_text(
    arch_text.replace(
        line,
        line + "- [ADR 0009: Share the Schema Module Between Browser and API](adr/0009-shared-schema-module.md)\n",
    ),
    encoding="utf-8",
)

readme = root / "README.md"
readme_text = readme.read_text(encoding="utf-8")
readme_text = re.sub(
    r"(\| `api/plan\.ts` +\| )HTTP handler, prompt, Gemini call, enrichment\. Self-contained \(see ADR 0007\)\. +\|",
    r"\1HTTP handler, prompt, Gemini call, enrichment. |",
    readme_text,
)
readme_text = re.sub(
    r"Shared zod schemas and pure helpers \(also inlined into the API\)\.",
    "Zod schemas and pure helpers shared by the browser and the API (ADR 0009).",
    readme_text,
)
readme_text = readme_text.replace("159 tests", "153 tests")
readme.write_text(readme_text, encoding="utf-8")

risks = root / "docs/RISKS.md"
risks_text = risks.read_text(encoding="utf-8")
risks_text = re.sub(
    r"The API schema is inlined in `api/plan\.ts`.*?`src/domain/recommendation\.ts`\.",
    "The browser and `api/plan.ts` import the same schema module, `src/domain/recommendation.ts` (ADR 0009), so the rules cannot drift.",
    risks_text,
    count=1,
)
risks.write_text(risks_text, encoding="utf-8")

print("Done. Run: npx prettier --write . && npm run check")