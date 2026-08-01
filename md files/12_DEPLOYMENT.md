# Deployment

## Required Services
- Frontend hosting.
- Backend/API hosting.
- Target LLM provider API.
- Optional database.

## Environment Variables
Example:
```text
LLM_API_KEY=
LLM_MODEL=
DATABASE_URL=
MAX_INPUT_TOKENS=
ENABLE_PERSISTENCE=false
```

## Deployment Rules
- Keep LLM keys on the server.
- Configure CORS only for required origins.
- Add request-size limits.
- Add timeouts/retries for provider calls.
- Expose a health endpoint.
- Seed demo samples so judges are not dependent on typing large contexts.

## Hackathon Submission Constraint
The source guidelines require a deployed project URL and repository review. The submission deadline in the provided document is 2 Aug 2026, 6:00 PM IST. The repository commit history may be reviewed and code changes after the deadline are prohibited by the stated guidelines.

## Pre-Submission Checklist
- Production build passes.
- Public URL opens in incognito mode.
- API calls succeed.
- No secrets in repository.
- README setup is correct.
- Benchmark results are reproducible.
- Repository collaborator/submission requirements from the official PDF are completed by the team.
