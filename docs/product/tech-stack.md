# Technical Stack - CoParent

## Overview

CoParent is a modern, full-stack web application built with a separation of concerns between frontend (Progressive Web App) and backend (REST API). The architecture prioritizes security, scalability, offline-first capabilities, and legal-grade documentation.

---

## Frontend Stack (CoParent UI)

### Core Framework & Build Tools

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ | UI component library and view layer |
| **Language** | TypeScript | Static typing for type safety and developer experience |
| **Build Tool** | Vite | Fast, modern build tool with hot module replacement |
| **Runtime** | Node.js 18+ | Development and deployment runtime |

### State Management & Data Fetching

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Global State** | Zustand | Lightweight state management for app-wide state (auth, UI state) |
| **Server State** | TanStack Query (React Query) | Caching, synchronization, and server state management |
| **Forms** | React Hook Form | Efficient, flexible form handling with minimal re-renders |
| **Validation** | Zod | TypeScript-first schema validation and parsing |

### UI & Styling

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Component Library** | shadcn/ui | High-quality, accessible React components built on Radix UI |
| **CSS Framework** | Tailwind CSS | Utility-first CSS for consistent, responsive styling |
| **Icons** | Heroicons | Clean, modern icon set (Outline, 24px) |
| **Responsive Design** | react-responsive | Media query hooks for responsive design patterns |
| **Animations** | Framer Motion | Smooth, declarative animations and transitions |

### Authentication & Authorization

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Authentication** | Auth0 | Secure OAuth2/OIDC authentication provider |
| **SDK** | @auth0/auth0-react | React-specific Auth0 integration |
| **Token Storage** | Browser SessionStorage | Secure token management for authenticated requests |
| **Authorization** | Role-based access control (RBAC) | In-app permission checks based on user roles |

### Networking & API Communication

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **HTTP Client** | Axios (via TanStack Query) | HTTP requests to backend API |
| **API Communication** | REST with JSON | Standard HTTP methods and JSON payloads |
| **Real-time Sync** | WebSockets (optional future enhancement) | Real-time message and calendar updates |
| **Base URL Management** | Environment variables | API endpoint configuration per environment |

### Progressive Web App (PWA)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **PWA Setup** | vite-plugin-pwa | Vite plugin for PWA features and manifest generation |
| **Service Worker** | Workbox | Google's library for managing service workers and caching strategies |
| **Offline Storage** | IndexedDB | Client-side database for offline data persistence |
| **Cache Strategy** | Stale-while-revalidate | Serve cached content while refreshing in background |
| **App Manifest** | Web App Manifest | Metadata for installation on home screen |

### Testing & Quality Assurance

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Test Runner** | Vitest | Fast, Vite-native unit test framework |
| **Testing Library** | React Testing Library | Testing React components with user-centric approach |
| **E2E Testing** | Playwright/Cypress (future) | End-to-end testing of user workflows |
| **Code Coverage** | Coverage reports | Maintain test coverage standards |

### Development Tools

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Package Manager** | npm | Dependency management and scripts |
| **Version Control** | Git | Source code management |
| **Linting** | ESLint | Code quality and consistency checks |
| **Code Formatting** | Prettier | Automatic code formatting |
| **Pre-commit Hooks** | Husky + lint-staged | Automate quality checks before commits |

### Performance & Monitoring

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Bundle Analysis** | Vite built-in | Monitor bundle size and identify optimization opportunities |
| **Performance Monitoring** | Web Vitals API | Track Core Web Vitals metrics |
| **Error Tracking** | Sentry (optional) | Client-side error reporting and monitoring |
| **Analytics** | Segment or similar (optional) | User engagement and feature usage tracking |

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## Backend Stack (CoParent API)

### Core Framework & Runtime

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | NestJS | TypeScript-first, modular backend framework |
| **Language** | TypeScript | Static typing for type safety and consistency |
| **Runtime** | Node.js 18+ | JavaScript runtime for server-side execution |
| **Package Manager** | npm | Dependency management |

### API & Documentation

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Protocol** | REST with JSON | Standard HTTP-based API design |
| **API Documentation** | Swagger/OpenAPI | Auto-generated, interactive API documentation |
| **Swagger UI** | @nestjs/swagger | Integrated Swagger documentation in development |
| **Versioning** | URL-based versioning (v1, v2) | API version management for backward compatibility |

### Authentication & Security

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Authentication Strategy** | JWT (JSON Web Tokens) | Stateless token-based authentication |
| **Auth Provider** | Auth0 | Outsourced authentication and identity management |
| **Passport Integration** | @nestjs/passport | NestJS authentication middleware |
| **JWT Verification** | Auth0 JWT Validator | Verification of Auth0-issued JWTs |
| **Authorization** | Role-based access control (RBAC) | Permission checks in guards and resolvers |
| **HTTPS** | TLS 1.2+ | Encrypted transport layer security |
| **CORS** | Configurable CORS policy | Cross-origin request handling |

### Database Layer

#### Primary Database Options (Choose One)

**Option A: MongoDB + Mongoose (Document Database)**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MongoDB 6.0+ | NoSQL document database |
| **ODM** | Mongoose | Object Document Mapper for MongoDB |
| **Connection** | Mongoose Connection Pool | Managed database connection pooling |
| **Migrations** | migrate-mongo | Database migration tool for MongoDB |
| **Indexing** | MongoDB Indexes | Optimize query performance |
| **Data Validation** | Mongoose Schema Validation | Schema-based validation at the database level |

**Option B: MariaDB + Prisma (Relational Database)**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MariaDB 10.6+ | Open-source relational database |
| **ORM** | Prisma | Next-generation ORM with type safety |
| **Connection** | Prisma Connection Pool | Managed connection pooling |
| **Migrations** | Prisma Migrate | Declarative schema migrations |
| **Indexing** | Database Indexes | Optimize query performance |
| **Data Validation** | Prisma Schema Validation | Schema-based validation |

#### Database Design Principles

- **Multi-tenancy:** Isolated data per family unit using family_id partition key
- **Immutability:** Timestamps (created_at, updated_at) on all entities; soft deletes for sensitive data
- **Audit Trail:** Dedicated audit log collection/table for all mutations
- **Encryption:** Sensitive fields (medical info, financial data) encrypted at rest
- **Backup Strategy:** Daily automated backups with point-in-time recovery

### Search & Full-Text Indexing

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Search Engine** | Elasticsearch 8.0+ | Full-text search for messages, documents, calendar events |
| **Connection** | @elastic/elasticsearch | Official Elasticsearch client for Node.js |
| **Indexing** | Automatic sync | Real-time index updates on document changes |
| **Query Syntax** | Elasticsearch Query DSL | Advanced search capabilities |

### File Storage

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Cloud Storage** | AWS S3 (or compatible) | Scalable object storage for receipts, documents, photos |
| **SDK** | AWS SDK v3 | Official AWS SDK for Node.js |
| **Signed URLs** | Pre-signed S3 URLs | Secure, time-limited file access links |
| **CDN** | CloudFront or similar | Content delivery for faster file downloads |
| **Encryption** | AES-256 at rest | Encryption for sensitive files |

### Caching Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Cache Store** | Redis 7.0+ | In-memory data store for caching and real-time features |
| **Cache Client** | ioredis | Redis client for Node.js with cluster support |
| **TTL Management** | Configurable expiration | Set time-to-live for cached data |
| **Session Storage** | Redis sessions | Store session data for performance |

### AI & LLM Integration

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI SDK** | Vercel AI SDK | Unified SDK for multiple LLM providers |
| **LLM Providers** | Groq, Google Gemini | Fast inference for real-time features |
| **Use Cases** | Message tone analysis, budget insights, duplicate detection | Intelligent features powered by language models |

### Logging & Observability

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Logger** | Pino | High-performance JSON logger |
| **Log Format** | Structured JSON | Machine-readable, searchable logs |
| **Log Levels** | ERROR, WARN, INFO, DEBUG, TRACE | Standard severity levels |
| **Log Aggregation** | ELK Stack or Datadog | Centralized log collection and analysis |
| **Tracing** | OpenTelemetry | Distributed tracing for request tracking |
| **Metrics** | Prometheus | Metrics collection and time-series data |

### Testing & Quality Assurance

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Test Framework** | Vitest | Fast unit test runner |
| **Testing Library** | Supertest | HTTP assertion library for API testing |
| **Test Containers** | Testcontainers | Containerized databases for integration tests |
| **Database Testing** | Test MongoDB/MariaDB containers | Isolated test databases per test run |
| **Code Coverage** | Coverage reports | Maintain test coverage standards (target: 80%+) |

### Deployment & Container Management

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container Runtime** | Docker | Containerization for consistent environments |
| **Build Pack** | Paketo Buildpacks or Nixpacks | Cloud-native buildpacks for container creation |
| **Orchestration** | Kubernetes (optional) | Container orchestration for scaling |
| **Deployment Platform** | Cloud Run, App Engine, or self-hosted | Deploy containerized application |
| **Environment Management** | dotenv, environment variables | Configuration per deployment environment |

### Development Tools

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Version Control** | Git | Source code management |
| **CLI** | NestJS CLI | Command-line interface for scaffolding |
| **Linting** | ESLint | Code quality and style checking |
| **Code Formatting** | Prettier | Automatic code formatting |
| **Pre-commit Hooks** | Husky + lint-staged | Automate checks before commits |

### API Rate Limiting & Security

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Rate Limiting** | @nestjs/throttler | Prevent abuse and ensure fair usage |
| **Request Validation** | class-validator, Zod | Input validation and sanitization |
| **CORS** | @nestjs/common CORS | Configure allowed origins |
| **Helmet** | @nestjs/helmet | Security headers and protection |

---

## Infrastructure & DevOps

### Development Environment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Local Database** | Docker Compose | Local MongoDB/MariaDB for development |
| **Development Server** | Vite dev server (frontend), `npm run start:dev` (backend) | Hot module replacement and live reloading |
| **Environment Setup** | .env files | Local environment configuration |

### Staging Environment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MongoDB Atlas or managed MariaDB | Production-like database |
| **API Hosting** | Cloud Run, App Engine, or Docker | Containerized API deployment |
| **Frontend Hosting** | Vercel, Netlify, or static hosting | PWA distribution |
| **File Storage** | AWS S3 or equivalent | Cloud storage for files |
| **Caching** | Redis (managed service) | Cache layer |

### Production Environment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | MongoDB Atlas (sharded cluster) or managed MariaDB (replicated) | Highly available, scalable database |
| **API Hosting** | Kubernetes or managed container service | Auto-scaling, load-balanced API |
| **CDN** | CloudFront, Cloudflare, or similar | Global content delivery network |
| **Frontend Hosting** | Vercel, Netlify, or S3 + CloudFront | Optimized PWA distribution |
| **File Storage** | AWS S3 with versioning and replication | Geo-redundant file storage |
| **Caching** | Redis Cluster | High-availability cache layer |
| **Search** | Elasticsearch managed service | Scalable full-text search |
| **Monitoring** | Datadog, New Relic, or similar | Production monitoring and alerting |
| **Backup** | Automated daily backups | Point-in-time recovery capability |

### Security Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **SSL/TLS** | Let's Encrypt (automated) or commercial certs | HTTPS encryption |
| **Secrets Management** | AWS Secrets Manager, HashiCorp Vault | Secure credential storage |
| **API Keys** | Rotating, environment-specific keys | Service-to-service authentication |
| **Firewall** | Cloud provider firewall rules | Network access control |
| **DDoS Protection** | Cloudflare, AWS Shield | DDoS mitigation |

---

## Integration Points

### External Services

| Service | Purpose | Authentication |
|---------|---------|-----------------|
| **Auth0** | User authentication and identity management | OAuth2 with configured applications |
| **AWS S3** | File and document storage | IAM roles or access keys |
| **Stripe** (future) | Payment processing for premium features | API keys |
| **Sendgrid/AWS SES** | Email delivery | API keys |
| **Plaid** (future) | Bank integration for expense tracking | OAuth2 flow |
| **Google Calendar** (future) | Calendar integration | OAuth2 flow |

### Data Privacy & Compliance

| Requirement | Implementation |
|-------------|-----------------|
| **GDPR Compliance** | Data deletion API, privacy controls, data processing agreements |
| **CCPA Compliance** | User data access, deletion rights, opt-out mechanisms |
| **Encryption at Rest** | AES-256 for sensitive data in databases and storage |
| **Encryption in Transit** | TLS 1.2+ for all communication |
| **Data Residency** | Regional database options for compliance |
| **Audit Logging** | Complete audit trail of all data access and modifications |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| **Frontend Bundle Size** | < 300KB gzipped (initial load) |
| **API Response Time** | < 200ms (p95) |
| **Database Query Time** | < 100ms (p95) |
| **Core Web Vitals - LCP** | < 2.5s |
| **Core Web Vitals - FID** | < 100ms |
| **Core Web Vitals - CLS** | < 0.1 |
| **Uptime SLA** | 99.95% |
| **Time to Interactive** | < 3s on 4G |

---

## Scalability & Growth Plan

### Phase 1-2 (MVP - 10K users)
- Single-region deployment
- Managed databases (Atlas, Cloud SQL)
- CDN for static assets
- Redis single instance

### Phase 3-4 (Growth - 100K users)
- Multi-region deployment with failover
- Database replication across regions
- Elasticsearch cluster for search
- Redis Cluster for caching
- API auto-scaling with load balancing

### Phase 5+ (Scale - 1M+ users)
- Global edge computing (Cloudflare Workers, Lambda@Edge)
- Database sharding by family_id
- Dedicated Elasticsearch clusters per region
- Advanced caching layers
- Event streaming for real-time features (Kafka)

---

## Development Workflow & Standards

### Code Organization

```
../coparent-api/ # seperate github repo
├── src/
│   ├── modules/          # Feature modules (calendar, expenses, etc.)
│   ├── common/           # Shared utilities, guards, decorators
│   ├── database/         # ORM configuration and migrations
│   ├── config/           # Environment and app configuration
│   └── main.ts           # Application entry point
└── test/                 # Test files

../coparent-ui/ # seperate github repo.
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   ├── api/             # API client and queries
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── App.tsx          # Root component
└── test/                # Test files
```

### Git Workflow
- Feature branches from `main`
- Pull request reviews required
- Automated checks (lint, test, build) before merge
- Semantic versioning for releases

### Deployment Pipeline
1. Commit to feature branch
2. Automated tests run
3. Pull request review
4. Merge to `main`
5. Deploy to staging
6. Manual testing
7. Deploy to production with blue-green strategy

