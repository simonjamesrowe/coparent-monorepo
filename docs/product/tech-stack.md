# Technical Stack - CoParent

## Overview

CoParent is a modern, full-stack web application with a React-based PWA frontend and a NestJS-based REST API backend. This document reflects the agreed frontend and backend technology stacks.

---

## Frontend Stack (CoParent UI)

### Core Framework & Build

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React | UI component library |
| **Language** | TypeScript | Type-safe JavaScript |
| **Build Tool** | Vite | Fast dev/build tooling |

### Routing & State Management

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Routing** | React Router (v6+) | Client-side routing |
| **Server State** | TanStack Query | Caching and server state management |
| **Client State** | Zustand | Lightweight global state |

### HTTP Client & Forms

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **HTTP Client** | Axios | API requests |
| **Forms** | React Hook Form | Form state management |
| **Validation** | Zod + @hookform/resolvers | Schema validation |

### UI & Styling

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **UI Components** | shadcn/ui + Radix UI | Accessible component primitives |
| **Styling** | Tailwind CSS | Utility-first CSS |

### Responsive & Mobile

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Responsive Utilities** | react-responsive | Media query hooks |
| **Animations** | framer-motion | Animations + gestures |
| **Mobile Drawer** | vaul | Mobile-friendly drawers |

### Progressive Web App (PWA)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **PWA Tooling** | vite-plugin-pwa | PWA setup for Vite |
| **Service Worker** | Workbox | Caching + offline support |
| **Offline Storage** | idb / localforage | IndexedDB wrappers |

### Authentication

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Auth Provider** | Auth0 | OIDC/OAuth2 authentication |
| **SDK** | @auth0/auth0-react | React Auth0 integration |

### AI / LLM Integration

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI SDK** | Vercel AI SDK | React hooks for streaming AI |

### Testing

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Test Runner** | Vitest | Unit/integration testing |
| **React Testing** | Testing Library | Component testing |
| **API Mocking** | MSW | Mock API responses |
| **E2E Testing** | Playwright or Cypress | End-to-end tests |

### Linting & Code Quality

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Linting** | ESLint + typescript-eslint | Code quality |
| **Formatting** | Prettier + prettier-plugin-tailwindcss | Consistent formatting |
| **React Linting** | eslint-plugin-react + hooks + jsx-a11y | React-specific rules |

### IDE & Tooling

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **IDE** | VS Code or Cursor | Recommended editors |
| **Extensions** | ESLint, Prettier, Tailwind CSS | Developer experience |

---

## Backend Stack (CoParent API)

### Core Framework

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | NestJS | Modular backend framework |
| **Language** | TypeScript | Type-safe backend development |
| **Web Framework** | Express (via NestJS) | HTTP server |

### Validation

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Validation** | class-validator + class-transformer | Decorator-based validation |
| **Schema Validation** | Zod | Type-safe validation |

### API Documentation

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **OpenAPI** | @nestjs/swagger | API docs + Swagger UI |
| **OpenAPI Tooling** | swagger-ui-express / redoc | API documentation UI |

### Authentication & Security

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Auth** | Auth0 + Passport + JWT | OIDC/OAuth2 authentication |
| **JWT Tools** | passport-jwt + jwks-rsa | JWT verification |

### Databases

**MongoDB (Document Database)**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MongoDB | Document store |
| **ODM** | Mongoose + @nestjs/mongoose | MongoDB modeling |
| **Migrations** | migrate-mongo | MongoDB migrations |

### Search

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Search** | Elasticsearch + @elastic/elasticsearch | Full-text search |

### Google Sheets Integration

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Sheets** | google-spreadsheet | Google Sheets API |
| **Auth** | google-auth-library | Google service auth |

### AI / LLM Integration

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI SDK** | Vercel AI SDK | Multi-provider integration |
| **Providers** | Groq, Google Gemini, OpenAI/Anthropic | LLM providers |
| **Framework** | LangChain.js | Chains/agents (optional) |

### Logging & Observability

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Logging** | Pino + nestjs-pino | Structured JSON logs |
| **Tracing/Metrics** | OpenTelemetry | Traces + metrics |
| **Health Checks** | @nestjs/terminus | Health endpoints |

### Testing

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Test Runner** | Vitest (or Jest) | Unit/integration tests |
| **HTTP Tests** | Supertest | API assertions |
| **Test Containers** | Testcontainers | Containerized DBs |

### Container Build Tools

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Buildpacks** | Paketo Buildpacks / Nixpacks | Container builds without Dockerfiles |
| **Alternatives** | pack CLI / Earthly / docker init | Build options |

### Linting & Code Quality

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Linting** | ESLint + typescript-eslint | Code quality |
| **Formatting** | Prettier | Code formatting |
| **Git Hooks** | Husky + lint-staged + commitlint | Pre-commit checks |

### IDE & Tooling

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **IDE** | VS Code / Cursor / WebStorm | Recommended editors |

---

## Quick Reference (Recommended Defaults)

| Area | Choice |
|------|--------|
| **Frontend** | React + Vite + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS |
| **State** | TanStack Query + Zustand |
| **Forms** | React Hook Form + Zod |
| **PWA** | vite-plugin-pwa + Workbox + idb |
| **Backend** | NestJS + TypeScript |
| **Auth** | Auth0 + Passport + JWT |
| **MongoDB** | Mongoose + migrate-mongo |
| **Search** | Elasticsearch |
| **Logging** | Pino |
| **Observability** | OpenTelemetry |
| **Testing** | Vitest + Testing Library / Supertest |
| **Build** | Paketo Buildpacks / Nixpacks |

