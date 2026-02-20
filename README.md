# CoParent Monorepo

A unified monorepo for the CoParent application, containing backend API, frontend UI, and documentation.

## Structure

- **apps/api** - NestJS backend API
- **apps/ui** - React + Vite frontend
- **packages/shared-types** - Shared TypeScript types
- **packages/eslint-config** - Shared ESLint configuration
- **docs/** - Product documentation and standards

## Prerequisites

- Node.js 18+
- pnpm 8.12.0+
- Docker & Docker Compose (optional, database services only)

## Quick Start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/ui/.env.example apps/ui/.env
```

### Development

```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - UI
pnpm dev:ui
```

Access the services:

- UI: http://localhost:5173
- API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

### Database (Optional)

```bash
pnpm docker:dev
# or
docker-compose -f docker/docker-compose.yml up
```

This starts MongoDB.

## Available Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:api` - Start API in development mode
- `pnpm dev:ui` - Start UI in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run tests for all apps
- `pnpm lint` - Lint all apps
- `pnpm format` - Format all code
- `pnpm docker:dev` - Start database services via Docker

## Testing

CoParent uses a test pyramid:

- Unit/component tests for fast feedback (`apps/ui` and local module logic).
- API e2e tests for backend contracts, validation, and auth guards.
- Browser e2e tests (Playwright) for real user flows across UI + API.

### Commands

```bash
pnpm test                                # all workspace tests
pnpm --filter coparent-api test:e2e      # API e2e suite
pnpm --filter coparent-ui test -- --run  # UI unit/component tests
pnpm test:e2e                            # Playwright e2e suite
pnpm test:e2e -- e2e/tests/auth.spec.ts  # Playwright single spec
pnpm test:e2e -- --grep "onboarding"     # Playwright by test name
pnpm test:e2e -- --project=chromium      # Playwright project filter
pnpm --filter coparent-api exec vitest --config vitest.e2e.config.ts --run test/families.e2e-spec.ts
pnpm --filter coparent-ui test -- src/pages/LoginPage.test.tsx --run
```

`pnpm test:e2e` forwards extra CLI args to Playwright via `scripts/e2e-test.sh`, so local filtering/debug flags work as expected.

### E2E Prerequisites

- Docker + Docker Compose are required for `pnpm test:e2e`.
- The command uses `docker/docker-compose.e2e.yml` to run MongoDB.

### CI Artifacts

- Playwright CI uploads:
  - `playwright-report` (HTML report)
  - `playwright-test-results` (videos for all tests, plus failure screenshots/traces)
- UI CI (Vitest) uploads `ui-test-log`.
  - UI unit/component tests are jsdom-based and do not produce browser screenshots/videos.

### E2E Test Mode

E2E mode removes external Auth0 dependency while keeping guarded routes unchanged:

- API: `E2E_TEST_MODE=true` switches to local HS256 token verification.
- UI: `VITE_E2E_TEST_MODE=true` swaps to the local test auth provider.

### Writing New Tests

- Prefer unit/component tests first for isolated behavior.
- Add API e2e tests for endpoint-level behavior changes.
- Add Playwright tests for end-to-end, user-visible journeys.
- Keep test data isolated and seeded through shared helpers/fixtures.

## Environment Configuration

### API (`apps/api/.env.example`)

```env
PORT=3000
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.example.com
AUTH0_ISSUER=https://your-tenant.auth0.com/
MONGODB_URI=mongodb://localhost:27017/coparent
```

### UI (`apps/ui/.env.example`)

```env
VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_IDLE_TIMEOUT_MINUTES=3
VITE_IDLE_TIMEOUT_SHOW_COUNTDOWN=true
```

## Standards

See `docs/standards/` for the authoritative tech stack and coding practices.

## License

Proprietary - CoParent Application
