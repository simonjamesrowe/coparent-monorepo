## Tech stack

This defines the technical stack for the CoParent application. All team members should follow these technology choices to maintain consistency.

### Framework & Runtime

#### Backend
- **Application Framework:** NestJS
- **Language/Runtime:** Node.js with TypeScript
- **Web Framework:** Express (via NestJS)
- **Package Manager:** npm

#### Frontend
- **JavaScript Framework:** React with Vite
- **Routing:** React Router v6+
- **CSS Framework:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** TanStack Query + Zustand

### Database & Storage
- **Primary Database:** MongoDB with Mongoose (@nestjs/mongoose)
- **Migrations:** migrate-mongo (MongoDB)

### Search
- **Search Engine:** Elasticsearch with @elastic/elasticsearch

### Authentication
- **Auth Provider:** Auth0 (OIDC/OAuth2)
- **Backend Auth:** Passport + JWT (passport-jwt + jwks-rsa)
- **Frontend Auth:** @auth0/auth0-react

### AI / LLM Integration
- **SDK:** Vercel AI SDK
- **Providers:** Groq, Google Gemini, OpenAI/Anthropic (as needed)

### Logging & Observability
- **Logging:** Pino (nestjs-pino)
- **Tracing/Metrics:** OpenTelemetry
- **Health Checks:** @nestjs/terminus

### Testing & Quality
- **Test Framework:** Vitest (Jest allowed for legacy)
- **E2E Testing:** Playwright or Cypress
- **API Testing:** Supertest + Testcontainers
- **Linting/Formatting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged + commitlint

### Deployment & Infrastructure
- **Container Build:** Paketo Buildpacks or Nixpacks (Dockerfile optional)
- **CI/CD:** GitHub Actions
