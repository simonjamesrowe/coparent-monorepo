# CoParent API

Backend API for CoParent - a secure co-parenting platform with Auth0 authentication, multi-tenant family management, and shared expense tracking.

## Features

- **Auth0 OIDC Integration:** Email/password and Google social login
- **Multi-Tenant Architecture:** Query-time isolation with family_id partition key
- **Family Management:** Create families, manage children, invite co-parents
- **Role-Based Access Control:** ADMIN_PARENT and CO_PARENT roles
- **Email Invitations:** 7-day expiring invitation tokens with SendGrid
- **Financial Privacy:** Granular expense sharing controls (PRIVATE, AMOUNT_ONLY, FULL_SHARED)
- **Soft Delete:** User accounts retained for audit trails and compliance
- **Admin Transfer:** Move admin privileges between co-parents
- **Security:** JWT validation, rate limiting, cross-family access logging

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Auth0 account (free tier available)
- SendGrid account (free tier available)

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env` with Auth0 and SendGrid credentials

4. Run database migrations:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register/sync user after Auth0 login
- `GET /api/v1/users/me` - Get current user and family context

### Family Management
- `POST /api/v1/families` - Create family unit
- `PUT /api/v1/families/{id}/transfer-admin` - Transfer admin privileges

### Invitations
- `POST /api/v1/invitations` - Create and send invitation
- `GET /api/v1/invitations/{token}/preview` - Preview invitation (public)
- `POST /api/v1/invitations/{token}/accept` - Accept invitation
- `POST /api/v1/invitations/{id}/resend` - Resend expired invitation

## Development

### Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run migrate      # Run database migrations
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

### Project Structure

```
src/
├── db/               # Database migrations and connection
├── middleware/       # Auth, rate limiting, tenant isolation
├── models/           # Data models with business logic
├── routes/           # API route handlers
├── services/         # Auth0, email, token generation
├── types/            # TypeScript type definitions
├── utils/            # Logging and utilities
└── index.ts          # Express app entry point
```

## Security

- **JWT Validation:** Auth0 public keys cached with 30-minute TTL
- **Rate Limiting:** Configured per endpoint (register 10/hr, invitations 20/day, etc.)
- **Soft Delete:** Deleted users marked inactive, data retained for compliance
- **Multi-Tenant Isolation:** Query-time filtering by family_id on all family-scoped data
- **Financial Privacy:** Expense visibility controlled by privacy_mode

## Implementation Status

**Backend Phases Completed:**
- Phase 1: Database Schema & Migrations (7/7 tasks)
- Phase 2: Auth0 Integration (6/6 tasks)
- Phase 3: User & Auth Service Layer (6/6 tasks)
- Phase 4: Family Management API (6/6 tasks)
- Phase 5: Invitation System API (7/8 tasks - background job deferred)
- Phase 6: Admin Transfer & Role Management (3/3 tasks)
- Phase 10: Security & Isolation (6/8 tasks - CSP and monitoring deferred)

**Remaining Phases:**
- Phase 7: Frontend Authentication UI
- Phase 8: Frontend Family/Invitation UI
- Phase 9: Frontend Middleware & State
- Phase 11: Integration Testing
- Phase 12: Deployment & Configuration
- Phase 13: Documentation

See `IMPLEMENTATION_SUMMARY.md` for detailed progress.

## License

Proprietary - CoParent Inc.
