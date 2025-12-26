# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing the CoParent application—a family-focused expense and financial sharing management system. It uses pnpm workspaces with Turbo for build orchestration. The codebase is split into a backend API, frontend UI, and shared packages.

## Monorepo Structure

```
coparent-monorepo/
├── apps/
│   ├── api/              (Express.js backend)
│   └── ui/               (React + Vite frontend)
├── packages/
│   ├── shared-types/     (TypeScript type definitions)
│   └── eslint-config/    (Shared ESLint configuration)
├── design-system/        (Design OS - component library & design tool)
├── docker/               (Docker Compose configuration)
├── docs/                 (Product docs and specs)
├── scripts/              (Utility scripts)
└── .github/workflows/    (CI/CD pipelines)
```

## Prerequisites & Setup

- **Node.js:** 18+
- **pnpm:** 8.12.0+
- **Docker & Docker Compose:** Optional, for containerized development

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

# Start API only (port 5000)
pnpm dev:api

# Start UI only (port 3000)
pnpm dev:ui

# Start Design System (port 5173)
pnpm dev:design

# Start with Docker (includes PostgreSQL)
pnpm docker:dev
```

### Building & Type Checking

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:api
pnpm build:ui

# Build Design System
pnpm build:design

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

# Watch mode (API only)
pnpm --filter api test:watch

# UI test UI (with browser UI)
pnpm --filter ui test:ui

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Database Migrations (API)

```bash
# Apply migrations
pnpm --filter api migrate

# Rollback migrations
pnpm --filter api migrate:rollback
```

### Docker Operations

```bash
# Build API Docker image
pnpm docker:build:api

# Build UI Docker image
pnpm docker:build:ui

# Start full stack in Docker (PostgreSQL + API + UI)
pnpm docker:dev

# Clean Docker environment
docker-compose -f docker/docker-compose.yml down -v
```

### Cleanup

```bash
# Clean all build artifacts
pnpm clean

# Remove node_modules and rebuild
pnpm clean
pnpm install
```

## Architecture Overview

### Apps

#### API (@coparent/api)
- **Framework:** Express.js on Node.js
- **Language:** TypeScript (compiled to CommonJS)
- **Port:** 5000
- **Database:** PostgreSQL with migrations
- **Key Features:**
  - Auth0 OIDC integration (email/password & Google login)
  - Multi-tenant architecture (query-time family_id isolation)
  - Role-based access control (ADMIN_PARENT, CO_PARENT)
  - Email invitations with 7-day expiring tokens (SendGrid)
  - Financial privacy controls (PRIVATE, AMOUNT_ONLY, FULL_SHARED)
  - JWT validation, rate limiting, cross-family access logging
  - Soft delete for audit trails

- **Key Directories:**
  - `src/db/` - Database connection and migrations (PostgreSQL)
  - `src/middleware/` - JWT auth, rate limiting, tenant isolation
  - `src/models/` - Data models (User, Family, Parent, Child, Expense, Invitation)
  - `src/routes/` - API endpoints (auth, family, invitation)
  - `src/services/` - Business logic (TokenGenerator, Auth0ManagementAPI, EmailService)
  - `src/types/` - Local type definitions
  - `dist/` - Compiled JavaScript output

- **Testing:** Jest
- **Environment Variables:** DATABASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, etc.

#### UI (@coparent/ui)
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Port:** 3000
- **Key Features:**
  - Auth0 authentication integration
  - Family management UI
  - Co-parent invitation system
  - Expense tracking and financial sharing
  - Form handling with React Hook Form + Zod validation
  - State management with Zustand

- **Key Directories:**
  - `src/components/` - Reusable React components
  - `src/pages/` - Page-level components
  - `src/stores/` - Zustand store definitions
  - `src/lib/` - Utility functions
  - `src/types/` - Local type definitions
  - `src/test/` - Integration and unit tests

- **Styling:** Tailwind CSS + shadcn/ui components
- **Testing:** Vitest with Testing Library + MSW (Mock Service Worker)
- **Routing:** TanStack Router (React Router)
- **Environment Variables:** VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_REDIRECT_URI, VITE_API_URL

### Shared Packages

#### Shared Types (@coparent/shared-types)
- Central TypeScript type definitions ensuring consistency across API and UI
- **Exports:** User, Family, Parent, Child, Expense, Invitation interfaces; enums for ParentRole, InvitationStatus, ExpensePrivacy; API response types

#### ESLint Config (@coparent/eslint-config)
- Standardized linting rules across all apps

### Design System (design-system/)
- **Type:** Vite React application + component library
- **Language:** TypeScript + Tailwind CSS
- **Port:** 5173
- **Purpose:**
  - Interactive design system and component showcase
  - Design tokens documentation
  - Component library for CoParent UI
  - Design tool for creating and viewing design sections

- **Key Features:**
  - React 19 with Vite bundler
  - Radix UI primitives for accessible components
  - Tailwind CSS v4 for styling
  - Lucide React for icons
  - React Router for navigation
  - Class variance authority for component variants

- **Key Directories:**
  - `src/components/` - Reusable component library
  - `src/sections/` - Design system sections and pages
  - `src/types/` - Type definitions
  - `src/lib/` - Utility functions
  - `src/assets/` - Static assets and design tokens

- **CLI Commands:**
  - `pnpm dev:design` - Start development server
  - `pnpm build:design` - Build for production

## Dependency Flow

```
API & UI
  ↓
  └─→ @coparent/shared-types
```

Both API and UI import types from the shared-types package. Any changes to shared types will affect both applications.

## Build & Test Infrastructure

### Turbo Configuration (turbo.json)

Turbo orchestrates builds with task dependencies:
- **`build`** depends on `^build` (dependencies build first)
- **`test`** depends on `build` task completion
- **`dev`** has caching disabled, persistent mode enabled
- **`lint`** has no output caching

### TypeScript Configuration

- **Base config** (`tsconfig.base.json`): ES2020 target, strict mode
- **API** (`apps/api/tsconfig.json`): CommonJS output to `dist/`
- **UI** (`apps/ui/tsconfig.json`): ESNext module, path aliases for component imports

### Testing Frameworks

- **API:** Jest (`jest.config.js`)
- **UI:** Vitest (`vitest.config.ts`) with jsdom environment, Testing Library integration

### CI/CD Workflows

- **`.github/workflows/api-ci.yml`** - API pipeline: lint → type check → build (triggers on api/ or packages/ changes)
- **`.github/workflows/ui-ci.yml`** - UI pipeline: lint → test → build (triggers on ui/ or packages/ changes, 5-min timeout)

Both workflows include Docker build steps on main branch.

## Code Patterns & Conventions

### Multi-Tenancy

API implements query-time tenant isolation using `family_id`:
- Every query filters by family_id from JWT claims
- Middleware (`src/middleware/auth.ts`) enforces tenant context
- No tenant context available in database layer—isolation happens at query time

### Type Safety

- Import shared types from `@coparent/shared-types` in both API and UI
- Maintain type exports in shared-types/src/index.ts
- Both apps depend on workspace:* to always use the latest local version

### API Routes

API endpoints follow REST conventions under `/api` prefix:
- Auth endpoints: `/api/auth/*`
- Family endpoints: `/api/family/*`
- Invitation endpoints: `/api/invitation/*`

All routes include JWT validation middleware.

### Frontend Routing

UI uses TanStack Router with file-based route organization. Routes use Auth0 authentication guard.

## Key Integration Points

1. **Auth0 Integration:** Both apps authenticate users via Auth0 OIDC flow
2. **API Communication:** UI calls API via axios at `VITE_API_URL`
3. **Type Consistency:** Both apps import from shared-types for User, Family, Expense types
4. **Shared Configuration:** ESLint config shared across all packages

## Troubleshooting

- **Port conflicts:** Edit `docker/docker-compose.yml` to change exposed ports
- **Type errors:** Run `turbo run type-check` to catch issues across all apps
- **Stale dependencies:** Run `pnpm clean && pnpm install` to do a fresh install
- **Database issues:** Run migrations with `pnpm --filter api migrate`
