# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing the CoParent application—a family-focused co‑parenting platform. The codebase is split into a backend API, frontend UI, and shared packages. Tooling is managed via pnpm workspaces and Turbo.

## Monorepo Structure

```
coparent-monorepo/
├── apps/
│   ├── api/              (NestJS backend)
│   └── ui/               (React + Vite frontend)
├── packages/
│   ├── shared-types/     (TypeScript type definitions)
│   └── eslint-config/    (Shared ESLint configuration)
├── design-system/        (Design system app)
├── docker/               (Database-only Docker compose)
├── docs/                 (Product docs and specs)
├── scripts/              (Utility scripts)
└── .github/workflows/    (CI pipelines)
```

## Prerequisites & Setup

- **Node.js:** 18+
- **pnpm:** 8.12.0+
- **Docker & Docker Compose:** Optional (MongoDB only)

Initial setup:
```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/ui/.env.example apps/ui/.env
```

## Common Development Commands

### Development & Running

```bash
# Start all apps
pnpm dev

# Start API only (port 3000)
pnpm dev:api

# Start UI only (port 5173)
pnpm dev:ui

# Start Design System (port 5173)
pnpm dev:design
```

### Building & Type Checking

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:api
pnpm build:ui

# Type check all apps
turbo run type-check
```

### Testing & Linting

```bash
# Run all tests
pnpm test

# Run tests in specific app
pnpm --filter api test
pnpm --filter ui test

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Docker (Database Only)

```bash
# Start MongoDB
pnpm docker:dev
# Or:
docker-compose -f docker/docker-compose.yml up
```

## Architecture Overview

### API (@coparent/api)
- **Framework:** NestJS (Express platform)
- **Language:** TypeScript (strict)
- **Port:** 3000
- **Auth:** Auth0 OIDC via Passport + JWT
- **API Docs:** @nestjs/swagger (OpenAPI)
- **Logging:** Pino (nestjs-pino)
- **Observability:** OpenTelemetry
- **Testing:** Vitest + Supertest + Testcontainers

### UI (@coparent/ui)
- **Framework:** React + Vite + TypeScript
- **Port:** 5173
- **Routing:** React Router v6
- **State:** TanStack Query + Zustand
- **Styling:** Tailwind CSS + shadcn/ui + Radix UI
- **Auth:** @auth0/auth0-react
- **PWA:** vite-plugin-pwa + Workbox + IndexedDB
- **Testing:** Vitest + Testing Library + MSW

## CI/CD Workflows

- **`.github/workflows/api-ci.yml`** - Lint → type-check → build for API
- **`.github/workflows/ui-ci.yml`** - Lint → test → build for UI

## Standards

Follow the tech stack and practices defined in `docs/standards/`. These are the source of truth for architectural decisions, tooling, and code style.
