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
