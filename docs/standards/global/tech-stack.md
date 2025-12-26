## Tech stack

This defines the technical stack for the CoParent application. All team members should follow these technology choices to maintain consistency.

### Framework & Runtime

#### Backend
- **Application Framework:** NestJS
- **Language/Runtime:** Node.js with TypeScript
- **Package Manager:** pnpm

#### Frontend
- **JavaScript Framework:** React with Vite
- **Routing:** React Router v6
- **CSS Framework:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI

### Database & Storage
- **Database:** MongoDB
- **ODM:** Mongoose (@nestjs/mongoose)
- **Migrations:** migrate-mongo

### Testing & Quality
- **Test Framework:** Vitest
- **E2E Testing:** Playwright
- **API Testing:** Supertest + Testcontainers
- **Linting/Formatting:** ESLint + Prettier

### Deployment & Infrastructure
- **Container Build:** Paketo Buildpacks or Nixpacks
- **CI/CD:** GitHub Actions

### Third-Party Services
- **Authentication:** Auth0 (OIDC/OAuth2)
- **Logging:** Pino (nestjs-pino)
- **Observability:** OpenTelemetry (traces + metrics)
- **API Documentation:** @nestjs/swagger (OpenAPI)
