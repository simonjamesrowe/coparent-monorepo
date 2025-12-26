# CoParent Monorepo

A unified monorepo for the CoParent application, containing backend API, frontend UI, and documentation.

## Structure

- **apps/api** - Express.js backend API
- **apps/ui** - React frontend application
- **packages/shared-types** - Shared TypeScript types
- **packages/eslint-config** - Shared ESLint configuration
- **docs/** - Product documentation and specifications

## Prerequisites

- Node.js 18+
- pnpm 8.12.0+
- Docker & Docker Compose (optional, for containerized development)

## Quick Start

### Initial Setup

```bash
# Run setup script
./scripts/setup.sh

# Or manually
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/ui/.env.example apps/ui/.env
```

### Development

#### Using Docker (Recommended)

```bash
pnpm docker:dev
```

Access the services:
- UI: http://localhost:3000
- API: http://localhost:5000
- Database: localhost:5432

#### Without Docker

```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - UI
pnpm dev:ui
```

## Available Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:api` - Start API in development mode
- `pnpm dev:ui` - Start UI in development mode
- `pnpm build` - Build all apps
- `pnpm build:api` - Build API only
- `pnpm build:ui` - Build UI only
- `pnpm test` - Run tests for all apps
- `pnpm lint` - Lint all apps
- `pnpm format` - Format all code
- `pnpm clean` - Clean build artifacts and node_modules
- `pnpm docker:dev` - Start Docker development environment
- `pnpm docker:build:api` - Build API Docker image
- `pnpm docker:build:ui` - Build UI Docker image

## Project Documentation

See the `docs/` directory for:
- **product/** - Mission, tech-stack, and roadmap
- **standards/** - Coding standards for frontend, backend, testing
- **specs/** - Feature specifications
- **designs/** - Design mockups
- **implementation-reports/** - Implementation and progress reports

## Development Workflow

### API Development

```bash
# Start API in development mode
pnpm dev:api

# Run API tests
pnpm --filter api test

# Lint API code
pnpm --filter api lint

# Type check API
pnpm --filter api type-check
```

### UI Development

```bash
# Start UI in development mode
pnpm dev:ui

# Run UI tests
pnpm --filter ui test

# Lint UI code
pnpm --filter ui lint
```

### Shared Packages

```bash
# Build shared-types package
pnpm --filter @coparent/shared-types build

# Clean shared packages
pnpm --filter @coparent/shared-types clean
```

## Git Workflow

This monorepo consolidates three repositories using git subtree:

- **apps/api** - migrated from coparent-api with full git history
- **apps/ui** - migrated from coparent-ui with full git history
- **docs/** - content from coparent-specs

To update API or UI from original repositories (if maintaining git subtree links):

```bash
# Update API from original
git subtree pull --prefix apps/api api-origin main --squash

# Update UI from original
git subtree pull --prefix apps/ui ui-origin main --squash
```

## Deployment

### Docker Build

```bash
# Build API image
pnpm docker:build:api

# Build UI image
pnpm docker:build:ui

# Or build both
docker-compose -f docker/docker-compose.yml build
```

### Production Deployment

For Docker Compose production deployment, use:

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Environment Configuration

### API (.env.example)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/coparent
NODE_ENV=development
PORT=5000
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### UI (.env.example)

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Clean installation

```bash
# Remove all build artifacts and dependencies
pnpm clean

# Reinstall
pnpm install

# Rebuild shared packages
pnpm --filter @coparent/shared-types build
```

### Docker issues

```bash
# Remove all containers and volumes
docker-compose -f docker/docker-compose.yml down -v

# Rebuild from scratch
docker-compose -f docker/docker-compose.yml up --build
```

### Port conflicts

If ports 3000, 5000, or 5432 are already in use, update docker/docker-compose.yml:

```yaml
services:
  api:
    ports:
      - "5001:5000"  # Change external port

  ui:
    ports:
      - "3001:3000"  # Change external port

  postgres:
    ports:
      - "5433:5432"  # Change external port
```

## Contributors

Team using Claude Code for AI-assisted development.

## License

Proprietary - CoParent Application
