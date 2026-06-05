# fp-inntektsmelding-frontend

Employer-facing frontend for submitting inntektsmelding.

## Shared context

- Source of truth for shared domain, architecture, and conventions: `navikt/fp-context`
- Copilot Space: `navikt/TeamForeldrepenger`

## Repo-specific context

| Topic              | Details                                                                                    |
|--------------------|--------------------------------------------------------------------------------------------|
| Role               | React and Vite SPA served through an Express BFF for employer-facing inntektsmelding flows |
| Main areas         | `app/` for the SPA, `server/` for the BFF and reverse proxy                                |
| Package manager    | `pnpm` (use exact versions for installs)                                                   |
| Frontend stack     | React, Vite, TanStack Query and Router, Aksel, Tailwind                                    |
| Server stack       | Express 5 and `@navikt/oasis` for Entra token exchange                                     |
| Special constraint | Browser traffic goes through the BFF; do not add direct backend calls from the SPA         |
| Integrations       | `fp-inntektsmelding` for inntektsmelding data and submission                               |
| API validation     | Validate API objects at the boundary with `zod` before using them in app code             |

## Verification

- Unit and e2e tests live under `app/`.
- Local frontend development is Vite-based and uses the existing vite-mode flow rather than running the production server shape.
