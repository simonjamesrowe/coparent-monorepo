# CoParent API

NestJS + TypeScript backend scaffold aligned to `docs/standards/backend`.

## Stack
- NestJS + Express (platform-express)
- Auth0 OIDC via Passport + JWT
- Swagger/OpenAPI via @nestjs/swagger
- Logging with Pino (nestjs-pino)
- Observability via OpenTelemetry
- Testing with Vitest

## Getting Started

```bash
npm install
npm run start:dev
```

### Environment
Copy `.env.example` to `.env` and fill in values.

### API Docs
Swagger UI is available at `/api/docs` when the server is running.

### Health Check
`GET /health`
