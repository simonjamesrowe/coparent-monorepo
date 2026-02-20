# Agent Notes

For data model standards, see:

- @.claude/commands/design-os/data-model.md

## Local Docker Dev (Preferred)

Use the scripts in `scripts/` (these wrap `docker compose -f docker/docker-compose.yml ...`):

- `./scripts/docker-dev-up.sh`
- `./scripts/docker-dev-restart.sh`
- `./scripts/docker-dev-logs.sh [service]`
- `./scripts/docker-dev-down.sh`

## E2E Test Mode

For local and CI automation, the app supports an auth-bypass test mode:

- API: `E2E_TEST_MODE=true` switches auth from Auth0 JWKS to a local HS256 JWT strategy.
- UI: `VITE_E2E_TEST_MODE=true` swaps `Auth0Provider` for a local `TestAuthProvider`.
- Shared secret: `e2e-test-secret` (override with `E2E_TEST_JWT_SECRET` when needed).

This keeps all existing guarded routes/endpoints (`AuthGuard('jwt')`) unchanged while removing external Auth0 dependency in tests.

## Running E2E Tests

- `pnpm test:e2e` starts MongoDB (Docker) and runs Playwright.
- `pnpm test:e2e:ui` opens Playwright UI mode.

## E2E Data Seeding

Playwright fixtures seed data through API helpers and direct Mongo helpers:

- API seeding creates families/children/onboarding/invitations.
- Direct DB seeding is used where needed for multi-parent scenarios (for example messaging/permission flows).
- Database cleanup runs between tests for isolation.

## Testing Pyramid

Prefer this test distribution:

- Unit/component tests for local behavior and fast feedback.
- API e2e tests for endpoint/validation/auth contracts.
- Browser e2e tests for critical user flows and cross-cutting integration.

## E2E Docker Requirements

`pnpm test:e2e` expects Docker + Compose to be available locally. The script uses `docker/docker-compose.e2e.yml` and tears services down automatically after the run.
