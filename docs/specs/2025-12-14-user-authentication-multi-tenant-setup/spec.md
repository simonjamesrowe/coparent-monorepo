# Specification: User Authentication & Multi-Tenant Setup

## Executive Summary

User Authentication & Multi-Tenant Setup is the foundational feature for CoParent, establishing secure parent authentication, family unit management, and multi-tenant isolation. This feature implements Auth0 OIDC integration with Google social login, enabling parents to sign up, create family units, invite co-parents via email, and maintain role-based access control (RBAC) where each family is isolated as a separate tenant with query-time data isolation. This ensures financial and personal data remains secure and accessible only to authorized family members.

The authentication system uses Auth0's built-in roles feature (ADMIN_PARENT and CO_PARENT) for identity-level role management, while API-level authorization checks enforce data access boundaries. Every database query includes family_id as a partition key, preventing cross-family data leakage. Financial privacy controls allow expense creators to granularly choose what information is shared with co-parents (amount only, full details, or private).

Key deliverables include user registration and login endpoints, family creation workflows, parent invitation system with 7-day expiring tokens, admin privilege transfer capability, multi-tenant data isolation at query and API levels, soft-delete support for audit trails, and comprehensive security monitoring for cross-family access attempts.

## Feature Overview

### Purpose and Goals

Enable CoParent to serve as a secure, collaborative platform for separated/co-parenting parents. Parents sign up, create family units, invite co-parents, and manage shared expenses and schedules while maintaining complete data isolation between families. No family should ever access another family's data due to authentication or authorization failures.

### Core Components

**Auth0 Integration**
- OIDC provider for parent authentication (email/password and Google social login)
- JWT token issuance and validation for all API requests
- Built-in roles feature for ADMIN_PARENT and CO_PARENT role management
- Email verification handled by Auth0 defaults
- Password reset via Auth0email flows

**Family Management**
- First parent creates family unit (explicit action) with family name and initial child information
- One family per parent in MVP (1:1 relationship, expandable in future phases)
- Family serves as tenant boundary for all data isolation
- Admin parent can invite co-parents and transfer admin privileges

**Parent Invitation System**
- Admin parent sends email invitations with 7-day expiring tokens
- Co-parent can accept with new account creation or existing login
- Family information pre-filled for co-parent confirmation during acceptance
- Invitation resend generates new token if previous link expires
- Tracks invitation status: PENDING, ACCEPTED, EXPIRED, REVOKED

**Role-Based Access Control (RBAC)**
- ADMIN_PARENT: Full family access, manages co-parent invitations, can transfer admin privileges
- CO_PARENT: Collaborative access to calendar, messages, expenses, documents (limited admin functions)
- Roles stored in Auth0 with local sync to Parent records
- API authorization checks prevent unauthorized data access

**Multi-Tenant Architecture**
- Query-time isolation: Every database query filters by family_id (partition key)
- API route-level guards: Middleware verifies parent belongs to requested family
- Data never exposed across family boundaries in single response
- Cross-family access attempts logged for security monitoring

## User Flows

### Flow 1: Signup (New Parent)

1. Parent navigates to login/signup page
2. Parent selects "Sign Up" or "Sign Up with Google"
3. Redirected to Auth0 Universal Login
4. Creates account (email/password or Google authentication)
5. Auth0 issues JWT token (stored in SessionStorage)
6. Frontend receives Auth0 profile (email, name)
7. Frontend calls POST /api/v1/users/register with Auth0 ID and profile data
8. Backend checks if user exists by auth0_id; if not, creates User record
9. Backend returns User record with flag: user needs family setup
10. Frontend redirects to Family Creation screen

### Flow 2: Family Creation

1. Parent (now authenticated) navigates to Family Creation screen
2. Reviews pre-filled information from Auth0 profile (name, email)
3. Enters family name (e.g., "Chen Family")
4. Enters initial child information (names, birthdates)
5. Submits family creation form
6. Frontend calls POST /api/v1/families with family name and children array
7. Backend creates Family record with created_by_user_id = current parent
8. Backend creates Child records linked to family
9. Backend creates Parent record with role = ADMIN_PARENT (role also set in Auth0)
10. Backend returns Family record with family_id
11. Frontend stores family_id in Zustand store (family context)
12. Parent redirected to dashboard

### Flow 3: Subsequent Login

1. Parent navigates to login page
2. Selects "Log In" or "Log In with Google"
3. Redirected to Auth0 Universal Login
4. Auth0 authenticates with existing credentials
5. Auth0 issues JWT token containing user ID and roles
6. Frontend stores JWT in SessionStorage
7. Frontend calls GET /api/v1/users/me to fetch current user and family context
8. Backend verifies JWT signature with Auth0, extracts user ID
9. Backend queries User by auth0_id, loads associated Family and Parent role
10. Backend returns User, Family, and Parent role data
11. Frontend populates Zustand store with user context and family context
12. Dashboard loads with family-scoped data

### Flow 4: Password Reset

1. Parent on login page clicks "Forgot Password"
2. Directed to Auth0 password reset flow
3. Parent enters email address
4. Auth0 sends password reset email with verification link
5. Parent clicks link in email
6. Auth0 prompts parent to set new password
7. Parent sets new password in Auth0
8. Parent can now log in with new password
9. Note: No backend involvement required; Auth0 handles entire flow

### Flow 5: Parent Invitation (Admin Initiates)

1. Admin parent navigates to "Invite Co-Parent" section
2. Reviews pre-filled family information (family name, children names, birthdates)
3. Enters co-parent email address
4. Optionally enters invitation message/note
5. Submits invitation request
6. Frontend calls POST /api/v1/invitations with email and optional message
7. Backend validates:
   - Email not already a parent in this family (prevents duplicates)
   - Email not self-invited
   - Family exists and requesting user is ADMIN_PARENT
8. Backend creates Invitation record:
   - token: URL-safe unique token (base64-encoded UUID or similar)
   - email: co-parent email address
   - status: PENDING
   - expires_at: current time + 7 days
   - inviting_parent_id: current admin parent
9. Backend sends email to co-parent with invitation link: `{FRONTEND_URL}/invite/{token}`
10. Email includes family name, children information, invitation message, and CTA button
11. Frontend shows confirmation: "Invitation sent to [email address]"
12. Admin can view invitation in pending invitations list

### Flow 6: Co-Parent Accepts Invitation (New Account)

1. Co-parent receives invitation email, clicks invitation link
2. Frontend extracts token from URL
3. Frontend calls GET /api/v1/invitations/{token}/preview (no auth required)
4. Backend validates token:
   - Token exists in database
   - Not expired (expires_at > now)
   - Status = PENDING
5. Backend returns invitation preview:
   - Family name
   - Children information (names, birthdates)
   - Invitation message from admin
   - Invitation creation date
6. Frontend displays: "You're invited to join [Family Name]"
7. Shows family details and invitation message
8. Presents two options: "Create Account" or "Log In"
9. Co-parent clicks "Create Account"
10. Redirected to Auth0 signup flow with email pre-filled
11. Co-parent creates account (email/password or Google)
12. Auth0 issues JWT token
13. Frontend stores JWT in SessionStorage
14. Frontend calls POST /api/v1/users/register (same as initial signup)
15. Backend creates User record with auth0_id if not exists
16. Frontend calls POST /api/v1/invitations/{token}/accept with JWT token
17. Backend validates:
    - Token exists and not expired
    - Status = PENDING
    - Requesting user email matches invitation email
18. Backend updates Invitation record:
    - status: ACCEPTED
    - accepted_at: current timestamp
    - accepted_by_user_id: current user
19. Backend creates Parent record:
    - user_id: current user
    - family_id: from invitation
    - role: CO_PARENT
    - joined_at: current timestamp
    - invited_by_user_id: inviting parent ID
20. Backend syncs role to Auth0 (adds CO_PARENT role in Auth0)
21. Backend returns success response
22. Frontend redirects to onboarding: co-parent reviews and confirms family information
23. After confirmation, both parents are active in family, and dashboard shows shared data

### Flow 7: Co-Parent Accepts Invitation (Existing Account)

1. Co-parent receives invitation email, clicks invitation link
2. Same as Flow 6 steps 2-8 (preview invitation)
3. Co-parent clicks "Log In" instead of "Create Account"
4. Redirected to Auth0 login flow
5. Co-parent logs in with email/password or Google
6. Auth0 issues JWT token
7. Frontend stores JWT in SessionStorage
8. Frontend calls POST /api/v1/invitations/{token}/accept
9. Proceed to Flow 6 steps 17-23 (accept invitation, create Parent record, sync roles)

### Flow 8: Resend Invitation

1. Admin parent navigates to pending invitations list
2. Sees list of pending, accepted, and expired invitations
3. Finds expired invitation with "Resend" button
4. Clicks "Resend"
5. Frontend calls POST /api/v1/invitations/{id}/resend with invitation ID
6. Backend validates:
   - Invitation exists
   - Requesting user is ADMIN_PARENT of the family
   - Invitation status is PENDING or EXPIRED
7. Backend creates new Invitation record:
   - Same email as original
   - New token (unique, URL-safe)
   - New expires_at: current time + 7 days
   - Same family_id
   - Same inviting_parent_id
   - Status: PENDING
8. Backend marks original Invitation as REVOKED (or leaves as is if replacing)
9. Backend sends new invitation email to co-parent
10. Frontend shows confirmation: "Resent invitation to [email]"
11. Co-parent receives new email with updated invitation link

### Flow 9: Transfer Admin Privileges

1. Admin parent navigates to family settings or co-parent management section
2. Sees co-parent listed with option to "Transfer Admin"
3. Clicks "Transfer Admin"
4. Frontend shows confirmation dialog: "Transfer admin privileges to [co-parent name]? You will become a Co-Parent."
5. Admin confirms action
6. Frontend calls PUT /api/v1/families/{id}/transfer-admin with target_user_id (co-parent)
7. Backend validates:
   - Requesting user is ADMIN_PARENT of the family
   - Target user exists and is CO_PARENT in the family
8. Backend updates Parent records:
   - Current admin parent: role = CO_PARENT
   - Target co-parent: role = ADMIN_PARENT
9. Backend syncs roles to Auth0:
   - Removes ADMIN_PARENT role from current user
   - Adds CO_PARENT role to current user
   - Removes CO_PARENT role from target user
   - Adds ADMIN_PARENT role to target user
10. Backend logs admin transfer for audit trail
11. Frontend shows confirmation: "Admin privileges transferred to [name]"
12. Both parents' dashboards reflect new roles
13. New admin can now invite or transfer privileges; former admin cannot

## Technical Architecture

### System Overview

### Tech Stack Alignment (Authoritative)

This spec follows the technology choices defined in `docs/standards/`. When in doubt, the standards directory is the source of truth.

**Backend (per standards)**
- NestJS + TypeScript with Express under the hood
- Auth0 (OIDC/OAuth2) with Passport + JWT validation
- MongoDB (Mongoose)
- OpenAPI via @nestjs/swagger
- Logging: Pino (nestjs-pino)
- Observability: OpenTelemetry
- Testing: Vitest + Supertest + Testcontainers

**Frontend (per standards)**
- React + Vite + TypeScript
- Routing: React Router v6+
- UI: shadcn/ui + Radix UI + Tailwind CSS
- State: TanStack Query + Zustand
- PWA: vite-plugin-pwa + Workbox + IndexedDB (idb/localforage)
- Auth: @auth0/auth0-react
- Testing: Vitest + Testing Library + MSW

CoParent's authentication and multi-tenant system consists of:

1. **Auth0 Cloud** (External): OIDC provider, JWT issuance, role management, email verification, password reset
2. **Frontend Application** (React + Vite): Handles Auth0 redirects, JWT storage, route guards, family context management
3. **Backend API** (NestJS (Node.js/TypeScript)): Validates JWTs, enforces RBAC, applies tenant isolation
4. **Database** (MongoDB): Stores Users, Families, Parents, Invitations, Children, Expenses with family_id partitioning
5. **Email Service** (SendGrid/SES): Sends invitation emails and password reset emails (Auth0 integration)

### Auth0 Integration Points

**Signup/Login (Frontend → Auth0)**
- Frontend redirects parent to Auth0 Universal Login
- Parent authenticates (email/password or Google)
- Auth0 redirects back to frontend with auth code or JWT token
- Frontend exchanges auth code for ID token + access token (OIDC flow)
- Frontend stores JWT in SessionStorage

**JWT Validation (Frontend → Backend)**
- Frontend includes JWT in Authorization header: `Authorization: Bearer {jwt}`
- Backend validates JWT signature against Auth0 public keys (cached)
- Backend extracts user ID, email, roles from JWT claims
- Backend queries internal User record using auth0_id from JWT

**Role Management (Backend ↔ Auth0)**
- Auth0 configured with two custom roles: ADMIN_PARENT, CO_PARENT
- When Parent record is created/updated, backend calls Auth0 Management API to sync roles
- JWT includes role claims (via Auth0 rules or custom claims)
- Backend reads roles from JWT and local Parent records for authorization checks

**Password Reset (User → Auth0)**
- Auth0 handles password reset flow independently
- No backend involvement required
- Parent resets password via Auth0 Universal Login forgot password page

### Multi-Tenancy Implementation

**Query-Time Isolation (Primary Strategy)**

Every database query includes family_id in the WHERE clause:

```sql
-- Example: Get all expenses for a parent in a specific family
SELECT * FROM expenses
WHERE family_id = $1 AND created_by_user_id = $2

-- Example: Get all children in family
SELECT * FROM children
WHERE family_id = $1

-- Example: Get parent record (verify parent belongs to family)
SELECT * FROM parents
WHERE family_id = $1 AND user_id = $2

-- Never query without family_id:
-- WRONG: SELECT * FROM expenses WHERE created_by_user_id = $1
-- RIGHT: SELECT * FROM expenses WHERE family_id = $1 AND created_by_user_id = $2
```

**API Route-Level Guards (Secondary Strategy)**

Middleware verifies parent belongs to family before data access:

```pseudocode
// Middleware: verifyFamilyAccess
app.get('/api/v1/families/:family_id/expenses', (req, res) => {
  const family_id = req.params.family_id
  const auth0_id = req.user.auth0_id  // From JWT

  // Verify parent belongs to this family
  const parent = await Parent.findOne({
    family_id,
    user: { auth0_id }
  })

  if (!parent) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Query expenses with family_id partition
  const expenses = await Expense.find({ family_id })
  res.json(expenses)
})
```

**Data Isolation Strategy**

- Each family is logically isolated; no shared databases or schemas
- family_id is mandatory foreign key on all family-scoped tables
- Composite indexes on (family_id, other_key) for query performance
- Tenant verification at both repository (query) and API (route) levels
- No response should ever contain data from multiple families

### Data Flow Diagram

```
Parent
  |
  +---> Auth0 (OIDC Login/Signup)
  |       |
  |       +---> Issues JWT (user_id, roles, email)
  |
  +---> Frontend (SessionStorage JWT)
  |       |
  |       +---> Validates redirect (callback URL)
  |       |
  |       +---> GET /api/v1/users/me (with JWT)
  |
  +---> Backend API (NestJS)
  |       |
  |       +---> Validates JWT signature
  |       |
  |       +---> Verifies family_id access (middleware)
  |       |
  |       +---> Queries DB with family_id partition
  |       |
  |       +---> Logs all cross-family access attempts
  |
  +---> Database (MongoDB via Mongoose)
        |
        +---> User records (auth0_id, email, name)
        +---> Family records (name, created_by_user_id)
        +---> Parent records (user_id, family_id, role)
        +---> Invitation records (token, status, expires_at)
        +---> Child records (family_id, name, dob)
        +---> Expense records (family_id, created_by_user_id, privacy_mode)
```

### Security Architecture

**Authentication Security**
- Auth0 handles password hashing, storage, validation (OAuth2/OIDC standard)
- JWT tokens stored in SessionStorage (not LocalStorage) to prevent XSS leakage
- JWT tokens have expiration (Auth0 configurable, typically 24 hours)
- JWT tokens validated on every backend request
- Refresh tokens (if used) stored securely

**Authorization Security**
- RBAC enforced at API route level and Auth0 role level
- Every endpoint checks parent belongs to family before data access
- Database queries filtered by family_id at repository level
- Cross-family access attempts logged and monitored

**Data Protection**
- HTTPS enforced for all communication (backend, frontend, Auth0)
- Sensitive fields (medical, financial) encrypted at rest (Phase 2+)
- Soft delete for parent accounts (data retained for audit trails)
- Invitation tokens are unique, URL-safe, non-guessable (base64-encoded UUIDs)

**Tenant Isolation**
- family_id partition key prevents cross-family leakage
- No shared data tables across families
- API middleware guards prevent unauthorized family access
- Query-level filtering ensures database-level isolation
- Composite indexes prevent performance bypass of isolation

**Audit & Monitoring**
- All invitation creation, acceptance, expiration logged
- All role changes and admin transfers logged
- All soft delete operations logged
- All cross-family access attempts (failed authorization) logged
- Metrics tracked: signup completion rate, invitation acceptance rate, auth failure rates

## Data Model

### Entity Relationship Diagram

```
User (internal users)
  |
  +--< Parent >--+
                 |
              Family
                 |
                 +--< Child
                 |
                 +--< Expense
                 |
                 +--< Invitation
```

### Entity Definitions

**User** (internal user records, linked to Auth0)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| auth0_id | String | UNIQUE, NOT NULL | Auth0 user ID for identity linking |
| email | String | UNIQUE, NOT NULL | Parent email address |
| name | String | NOT NULL | Parent full name |
| phone | String | NULLABLE | Optional phone number |
| avatar_url | String | NULLABLE | Optional profile photo URL (Auth0 profile picture) |
| is_active | Boolean | NOT NULL, DEFAULT true | False when soft-deleted |
| created_at | DateTime | NOT NULL | Account creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |
| deleted_at | DateTime | NULLABLE | Soft delete timestamp (null if active) |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE on auth0_id (fast Auth0 lookup)
- UNIQUE on email (prevent duplicate accounts)

**Family** (tenant boundary)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| name | String | NOT NULL | Family unit name (e.g., "Chen Family") |
| created_by_user_id | UUID | NOT NULL, FK User | Parent who created family |
| created_at | DateTime | NOT NULL | Family creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on id
- FOREIGN KEY on created_by_user_id

**Parent** (user-family relationship, tracks roles and invitations)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| user_id | UUID | NOT NULL, FK User | Reference to User |
| family_id | UUID | NOT NULL, FK Family | Reference to Family (partition key) |
| role | Enum | NOT NULL | ADMIN_PARENT or CO_PARENT |
| joined_at | DateTime | NULLABLE | When invitation was accepted |
| invited_at | DateTime | NULLABLE | When invitation was sent |
| invited_by_user_id | UUID | NULLABLE, FK User | Which parent invited this one |
| created_at | DateTime | NOT NULL | Record creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Constraints:**
- UNIQUE constraint on (user_id, family_id): one user per family
- COMPOSITE INDEX on (family_id, user_id) for fast lookups
- COMPOSITE INDEX on (family_id, role) for finding parents by role

**Invitation** (email invitations for co-parents)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| family_id | UUID | NOT NULL, FK Family | Family being invited to (partition key) |
| inviting_parent_id | UUID | NOT NULL, FK Parent | Parent who sent invitation |
| email | String | NOT NULL | Email address being invited |
| token | String | UNIQUE, NOT NULL | URL-safe unique token for acceptance |
| status | Enum | NOT NULL | PENDING, ACCEPTED, EXPIRED, REVOKED |
| expires_at | DateTime | NOT NULL | Token expiration (7 days from creation) |
| accepted_at | DateTime | NULLABLE | When invitation was accepted |
| accepted_by_user_id | UUID | NULLABLE, FK User | User who accepted invitation |
| resent_at | DateTime | NULLABLE | Last resend timestamp |
| created_at | DateTime | NOT NULL | Invitation creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Constraints:**
- UNIQUE constraint on token (fast token lookup)
- INDEX on expires_at (for expiration checks)
- INDEX on status (for pending invitation queries)
- COMPOSITE INDEX on (family_id, email) to prevent duplicate invitations
- COMPOSITE INDEX on (family_id, status) for active invitation queries

**Child** (children in family, pre-filled during family setup and invitation confirmation)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| family_id | UUID | NOT NULL, FK Family | Family this child belongs to (partition key) |
| name | String | NOT NULL | Child full name |
| date_of_birth | Date | NOT NULL | Child's birthdate |
| created_at | DateTime | NOT NULL | Record creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on id
- COMPOSITE INDEX on (family_id, name) for searching children in family

**Expense** (expenses with privacy controls)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Internal identifier |
| family_id | UUID | NOT NULL, FK Family | Family this expense belongs to (partition key) |
| created_by_user_id | UUID | NOT NULL, FK User | Parent who logged the expense |
| amount | Decimal(10,2) | NOT NULL | Expense amount in dollars |
| category | String | NOT NULL | Expense category (e.g., "education", "medical") |
| date | Date | NOT NULL | Expense date |
| description | String | NULLABLE | Expense details or notes |
| receipt_url | String | NULLABLE | S3 URL to receipt document |
| privacy_mode | Enum | NOT NULL | PRIVATE, AMOUNT_ONLY, or FULL_SHARED |
| created_at | DateTime | NOT NULL | Record creation timestamp |
| updated_at | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on id
- COMPOSITE INDEX on (family_id, created_by_user_id) for user's expenses
- COMPOSITE INDEX on (family_id, date) for timeline queries
- INDEX on privacy_mode (for privacy-aware queries)

### Data Relationships

- **User ↔ Parent**: One-to-many (a user can have multiple parents, but MVP is 1:1)
- **Family ↔ Parent**: One-to-many (a family has multiple parents)
- **User ↔ Family**: Implicit through Parent (one user belongs to one family in MVP)
- **Family ↔ Child**: One-to-many (family has multiple children)
- **Family ↔ Invitation**: One-to-many (family has multiple invitations)
- **Family ↔ Expense**: One-to-many (family has multiple expenses)
- **User ↔ Expense**: One-to-many (user creates multiple expenses)

### Data Isolation Enforcement

**At Database Level**
- Every family-scoped table includes family_id foreign key
- Queries always filter by family_id in WHERE clause
- Composite indexes on (family_id, other_key) for performance
- No cross-family queries possible without explicitly removing partition key

**At Application Level**
- API middleware extracts family_id from request and validates access
- Repository/DAO layer enforces family_id in all queries
- Controllers validate parent belongs to family before returning data
- No family_id in response bypasses query-level filtering

**At Data Integrity Level**
- UNIQUE constraints prevent duplicate parent records in same family
- Foreign key constraints prevent orphaned records
- Soft delete preserves audit trails for legal/compliance purposes

## API Specification

### Authentication

All endpoints (except login, signup, and invitation preview) require a valid JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

JWT tokens are issued by Auth0 and validated by the backend using Auth0's public key.

### Error Responses

Standard error response format (applicable to all endpoints):

```json
{
  "error": "error_code",
  "message": "Human-readable error description",
  "details": {}
}
```

Common HTTP status codes:
- 200: OK (success)
- 201: Created (resource created)
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (insufficient permissions or family access denied)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (resource already exists)
- 500: Internal Server Error

### Endpoint Specifications

#### POST /api/v1/users/register

Register or verify a user after Auth0 authentication.

**Method:** POST
**Authentication:** Required (JWT)
**Rate Limit:** 10 requests per hour per IP

**Request Body:**
```json
{
  "auth0_id": "auth0|507f1f77bcf86cd799439011",
  "email": "parent@example.com",
  "name": "John Smith",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "auth0_id": "auth0|507f1f77bcf86cd799439011",
    "email": "parent@example.com",
    "name": "John Smith",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T10:30:00Z"
  },
  "family": null,
  "needs_family_setup": true
}
```

**Response (200 OK - existing user):**
```json
{
  "user": { ... },
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "needs_family_setup": false,
  "role": "ADMIN_PARENT"
}
```

**Error Responses:**
- 400: Invalid auth0_id or email format
- 401: Invalid or expired JWT
- 500: Database or Auth0 integration error

**Notes:**
- Called after Auth0 signup/login to sync user to internal database
- Creates User record if auth0_id not found; updates if exists
- Returns family context if user already has a family
- Frontend uses needs_family_setup flag to determine next step

---

#### GET /api/v1/users/me

Fetch current authenticated user and family context.

**Method:** GET
**Authentication:** Required (JWT)
**Rate Limit:** 30 requests per minute per user

**Request Parameters:** None

**Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "auth0_id": "auth0|507f1f77bcf86cd799439011",
    "email": "parent@example.com",
    "name": "John Smith",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z"
  },
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family",
    "created_by_user_id": "550e8400-e29b-41d4-a716-446655440002",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "role": "ADMIN_PARENT",
  "joined_at": "2025-12-14T10:30:00Z"
}
```

**Error Responses:**
- 401: Invalid or expired JWT
- 404: User not found (deleted or JWT invalid)
- 500: Database error

**Notes:**
- Called on app load to restore user and family context
- Returns current parent's role in family
- Family null if user hasn't set up family yet
- Frontend stores response in Zustand family context store

---

#### POST /api/v1/families

Create a new family unit.

**Method:** POST
**Authentication:** Required (JWT)
**Rate Limit:** 10 requests per hour per user

**Request Body:**
```json
{
  "name": "Chen Family",
  "children": [
    {
      "name": "Emma Chen",
      "date_of_birth": "2015-03-20"
    },
    {
      "name": "Lucas Chen",
      "date_of_birth": "2017-07-15"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family",
    "created_by_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2025-12-14T10:30:00Z",
    "updated_at": "2025-12-14T10:30:00Z"
  },
  "children": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "family_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Emma Chen",
      "date_of_birth": "2015-03-20",
      "created_at": "2025-12-14T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "family_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Lucas Chen",
      "date_of_birth": "2017-07-15",
      "created_at": "2025-12-14T10:30:00Z"
    }
  ],
  "parent": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "family_id": "550e8400-e29b-41d4-a716-446655440001",
    "role": "ADMIN_PARENT",
    "joined_at": "2025-12-14T10:30:00Z",
    "created_at": "2025-12-14T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid family name or children data (missing names/birthdates)
- 401: Invalid or expired JWT
- 409: User already has a family (1:1 relationship in MVP)
- 500: Database error

**Notes:**
- Only callable by authenticated users who haven't created a family yet
- Creates Family record with created_by_user_id
- Creates Child records for each child in array
- Creates Parent record with role = ADMIN_PARENT
- Also syncs ADMIN_PARENT role to Auth0
- Family becomes the tenant for all subsequent operations

---

#### POST /api/v1/invitations

Create and send a parent invitation.

**Method:** POST
**Authentication:** Required (JWT, ADMIN_PARENT role)
**Rate Limit:** 20 requests per day per user

**Request Body:**
```json
{
  "email": "coparent@example.com",
  "message": "Looking forward to co-parenting together!"
}
```

**Response (201 Created):**
```json
{
  "invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "family_id": "550e8400-e29b-41d4-a716-446655440001",
    "inviting_parent_id": "550e8400-e29b-41d4-a716-446655440005",
    "email": "coparent@example.com",
    "token": "aW52aXRlXzU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMQ==",
    "status": "PENDING",
    "expires_at": "2025-12-21T10:30:00Z",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "invitation_url": "https://coparent.app/invite/aW52aXRlXzU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMQ=="
}
```

**Error Responses:**
- 400: Invalid email format
- 401: Invalid or expired JWT
- 403: User is not ADMIN_PARENT of family
- 409: Email already invited to this family (duplicate invitation)
- 409: Email already a parent in this family
- 409: Cannot invite own email address
- 500: Email service failure (invitation not sent)

**Notes:**
- Only ADMIN_PARENT can create invitations
- Email must be valid format
- Prevents duplicate invitations to same email in same family
- Prevents self-invitation
- Invitation token valid for 7 days (expires_at = now + 7 days)
- Email sent to invitee with invitation link
- Email includes family name, children information, message from inviting parent
- Sends via email service (SendGrid/SES)

---

#### GET /api/v1/invitations/{token}/preview

Preview an invitation before accepting (no authentication required).

**Method:** GET
**Authentication:** NOT Required
**Rate Limit:** 30 requests per minute per IP

**Request Parameters:**
- token (path): Invitation token from email link

**Response (200 OK):**
```json
{
  "invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "family_id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "coparent@example.com",
    "status": "PENDING",
    "expires_at": "2025-12-21T10:30:00Z",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "children": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Emma Chen",
      "date_of_birth": "2015-03-20"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "name": "Lucas Chen",
      "date_of_birth": "2017-07-15"
    }
  ],
  "inviting_parent": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "name": "John Smith",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Error Responses:**
- 400: Invalid or malformed token
- 404: Invitation not found
- 410: Invitation expired (expires_at < now)
- 410: Invitation already accepted
- 410: Invitation revoked or expired

**Notes:**
- Allows unauthenticated users to preview invitation before signup/login
- Shows family information and inviting parent details
- Checks expiration status and returns 410 if expired
- Used by frontend to decide whether to show signup/login options
- Response used to pre-populate family setup confirmation during acceptance

---

#### POST /api/v1/invitations/{token}/accept

Accept an invitation and join family.

**Method:** POST
**Authentication:** Required (JWT)
**Rate Limit:** 10 requests per hour per user

**Request Body:**
```json
{
  "token": "aW52aXRlXzU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMQ=="
}
```

**Response (200 OK):**
```json
{
  "invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "ACCEPTED",
    "accepted_at": "2025-12-14T11:00:00Z",
    "accepted_by_user_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family",
    "created_at": "2025-12-14T10:30:00Z"
  },
  "parent": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "user_id": "550e8400-e29b-41d4-a716-446655440006",
    "family_id": "550e8400-e29b-41d4-a716-446655440001",
    "role": "CO_PARENT",
    "joined_at": "2025-12-14T11:00:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid token format
- 401: Invalid or expired JWT
- 404: Invitation not found
- 410: Invitation expired
- 410: Invitation already accepted
- 409: User already a parent in this family
- 409: Email mismatch (JWT email != invitation email)
- 500: Auth0 role sync failed

**Notes:**
- Requires valid JWT (user must be authenticated)
- Verifies JWT email matches invitation email
- Validates invitation status = PENDING and not expired
- Creates Parent record with role = CO_PARENT
- Syncs CO_PARENT role to Auth0
- Marks invitation as ACCEPTED with timestamp and user ID
- Subsequent request redirects to family dashboard

---

#### POST /api/v1/invitations/{id}/resend

Resend an expired invitation with a new token.

**Method:** POST
**Authentication:** Required (JWT, ADMIN_PARENT role)
**Rate Limit:** 10 requests per day per user

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "old_invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "REVOKED"
  },
  "new_invitation": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "email": "coparent@example.com",
    "token": "aW52aXRlXzU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMQ==",
    "status": "PENDING",
    "expires_at": "2025-12-21T11:00:00Z",
    "created_at": "2025-12-14T11:00:00Z"
  },
  "invitation_url": "https://coparent.app/invite/aW52aXRlXzU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAxMQ=="
}
```

**Error Responses:**
- 401: Invalid or expired JWT
- 403: User is not ADMIN_PARENT of family
- 404: Invitation not found
- 400: Invitation is already accepted (cannot resend)
- 500: Email service failure

**Notes:**
- Only ADMIN_PARENT can resend invitations
- Creates new Invitation record with same email but new token and expiration
- Marks old invitation as REVOKED or EXPIRED
- New token valid for 7 days
- Sends new invitation email to co-parent
- Returns both old (revoked) and new (fresh) invitation records

---

#### PUT /api/v1/families/{id}/transfer-admin

Transfer admin privileges to a co-parent.

**Method:** PUT
**Authentication:** Required (JWT, ADMIN_PARENT role)
**Rate Limit:** 5 requests per day per user

**Request Body:**
```json
{
  "target_user_id": "550e8400-e29b-41d4-a716-446655440006"
}
```

**Response (200 OK):**
```json
{
  "family": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Chen Family"
  },
  "previous_admin": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "CO_PARENT"
  },
  "new_admin": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "user_id": "550e8400-e29b-41d4-a716-446655440006",
    "role": "ADMIN_PARENT"
  },
  "transfer_timestamp": "2025-12-14T11:00:00Z"
}
```

**Error Responses:**
- 400: Invalid target_user_id format
- 401: Invalid or expired JWT
- 403: User is not ADMIN_PARENT of family
- 404: Family not found
- 404: Target user not found in family
- 409: Target user is not a CO_PARENT

**Notes:**
- Only current ADMIN_PARENT can transfer admin privileges
- Target user must be CO_PARENT in same family
- Current admin becomes CO_PARENT; target user becomes ADMIN_PARENT
- Roles synced to Auth0 (remove ADMIN_PARENT, add CO_PARENT from current; vice versa for target)
- Transfer logged for audit trail
- Both users notified of privilege transfer (future enhancement)
- Cannot transfer to self

---

### Endpoint Summary Table

| Method | Endpoint | Auth | Role | Rate Limit | Purpose |
|--------|----------|------|------|-----------|---------|
| POST | /api/v1/users/register | JWT | Any | 10/hour | Register/sync user with Auth0 |
| GET | /api/v1/users/me | JWT | Any | 30/min | Fetch current user and family context |
| POST | /api/v1/families | JWT | Any | 10/hour | Create new family unit |
| POST | /api/v1/invitations | JWT | Admin | 20/day | Create and send invitation |
| GET | /api/v1/invitations/{token}/preview | None | N/A | 30/min | Preview invitation (public) |
| POST | /api/v1/invitations/{token}/accept | JWT | Any | 10/hour | Accept invitation and join |
| POST | /api/v1/invitations/{id}/resend | JWT | Admin | 10/day | Resend expired invitation |
| PUT | /api/v1/families/{id}/transfer-admin | JWT | Admin | 5/day | Transfer admin privileges |

## Frontend Implementation

### Key Components

**Login Component** (`pages/login.tsx` or `components/auth/Login.tsx`)
- Displays "Log In" and "Log In with Google" buttons
- Handles Auth0 login redirect
- Shows "Forgot Password" link
- Error handling for login failures
- Loading state during Auth0 redirect

**Signup Component** (`components/auth/Signup.tsx`)
- Displays "Sign Up" and "Sign Up with Google" buttons
- Handles Auth0 signup redirect
- Shows "Already have an account? Log In" link
- Error handling for signup failures
- Loading state during Auth0 redirect

**Auth Callback Component** (`pages/callback.tsx` or `pages/auth/callback.tsx`)
- Handles redirect from Auth0 after login/signup
- Exchanges auth code for JWT token
- Stores JWT in SessionStorage
- Calls POST /api/v1/users/register to sync user
- Redirects to family setup or dashboard based on response

**Family Setup Component** (`components/family/FamilySetup.tsx`)
- Form to enter family name
- Form to enter children (names, birthdates)
- Submit button to create family
- Shows loading state during creation
- Error handling for duplicate family or validation errors

**Invitation Preview Component** (`components/invitation/InvitationPreview.tsx`)
- Displays family name, children information, inviting parent
- Shows "Create Account" and "Log In" buttons
- Handles expired invitation error (shows "Link Expired, Ask to Resend")
- Loading state while fetching invitation data
- No authentication required

**Invitation Accept Component** (`components/invitation/InvitationAccept.tsx`)
- Called after user creates account or logs in
- Shows family confirmation/onboarding
- Calls POST /api/v1/invitations/{token}/accept
- Handles acceptance confirmation
- Redirects to dashboard on success
- Error handling for already-accepted invitations

**Invite Co-Parent Component** (`components/family/InviteCoParent.tsx`)
- Form to enter co-parent email
- Optional message textarea
- Submit button to send invitation
- Shows confirmation: "Invitation sent to [email]"
- Displays list of pending, accepted, and expired invitations
- "Resend" button for expired invitations

**Admin Transfer Component** (`components/family/TransferAdmin.tsx`)
- Lists co-parents in family
- "Transfer Admin" button for each co-parent
- Confirmation dialog before transfer
- Shows success message and updates role display
- Error handling if transfer fails

### State Management (Zustand Store)

Create a family context store (`stores/familyStore.ts` or `context/familyContext.ts`):

```typescript
interface FamilyStore {
  // User context
  user: User | null
  setUser: (user: User) => void

  // Family context
  family: Family | null
  setFamily: (family: Family) => void

  // Parent role context
  role: 'ADMIN_PARENT' | 'CO_PARENT' | null
  setRole: (role) => void

  // Authentication state
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (value: boolean) => void

  // Clear all context (logout)
  clearContext: () => void
}
```

**Store Usage:**
- Initialize on app load by calling GET /api/v1/users/me
- Update on successful family creation (POST /api/v1/families)
- Update on successful invitation acceptance (POST /api/v1/invitations/{token}/accept)
- Update on successful admin transfer (PUT /api/v1/families/{id}/transfer-admin)
- Clear on logout (remove JWT from SessionStorage, clear store)

### Route Guards and Auth Protection

**Protected Routes** (require JWT and family context):
- `/dashboard` - main dashboard
- `/family/*` - family management pages
- `/invitations/sent` - manage sent invitations
- `/expenses/*` - expense pages
- `/calendar/*` - calendar pages
- `/messages/*` - messaging pages

**Public Routes** (no auth required):
- `/` - landing page
- `/login` - login page
- `/signup` - signup page
- `/auth/callback` - Auth0 callback
- `/invite/:token` - invitation preview

**Route Guard Middleware:**
```typescript
// Example: Protected route guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, family, isLoading } = useFamily()
  const router = useRouter()

  if (isLoading) return <LoadingSpinner />

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (!family) {
    router.push('/family/setup')
    return null
  }

  return children
}
```

**Component Responsibilities:**
- Login/Signup: Handle Auth0 redirect, no protected data access
- Callback: Exchange auth code for JWT, sync user to backend
- FamilySetup: Require JWT, not family yet
- Dashboard: Require JWT and family context
- InviteCoParent: Require JWT and ADMIN_PARENT role
- TransferAdmin: Require JWT and ADMIN_PARENT role

## Security & Compliance

### Tenant Isolation

**Query-Time Isolation (Primary)**

Every database query includes family_id in WHERE clause:

```sql
-- ALWAYS filter by family_id
SELECT * FROM expenses
WHERE family_id = $1 AND created_by_user_id = $2

-- NEVER query without family_id
-- SELECT * FROM expenses WHERE created_by_user_id = $1  ← WRONG
```

**API-Level Guards (Secondary)**

Middleware verifies parent-to-family relationship:

```typescript
// Middleware: verifyFamilyAccess
async function verifyFamilyAccess(req, res, next) {
  const auth0_id = req.user.auth0_id  // From JWT
  const family_id = req.params.family_id || req.body.family_id

  // Find parent record for this user in this family
  const parent = await Parent.findOne({
    where: { family_id, user: { auth0_id } }
  })

  if (!parent) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Attach family_id to request for downstream use
  req.family_id = family_id
  req.parent = parent
  next()
}
```

**Logging Cross-Family Access Attempts**

All failed authorization attempts logged:

```typescript
logger.warn('Cross-family access attempt', {
  auth0_id: req.user.auth0_id,
  attempted_family_id: family_id,
  actual_family_id: parent?.family_id,
  endpoint: req.path,
  ip: req.ip,
  timestamp: new Date()
})
```

### Data Protection

**Authentication & JWT**
- JWT tokens issued by Auth0, validated by backend using Auth0 public key
- JWT tokens contain user ID, email, roles, issued_at, expires_at
- Token stored in SessionStorage (not LocalStorage) to prevent XSS leakage
- HTTPS enforced for all communication to prevent token interception
- JWT validated on every API request; expired tokens rejected

**Auth0 Security**
- Password hashing: Auth0 handles securely (bcrypt or better)
- Multi-factor authentication: Deferred to Phase 2
- Account lockout: Handled by Auth0 defaults
- Password reset: Email-based verification via Auth0

**Encryption at Rest**
- Medical and financial data encrypted at rest (Phase 2+)
- Sensitive fields marked in schema for future encryption
- Audit logging tracks all access to encrypted data

**Soft Delete**
- User accounts soft-deleted (marked inactive, data retained)
- Enables GDPR compliance (Phase 5)
- Preserves audit trails for legal documentation
- Soft-deleted users cannot authenticate or appear in queries

### Financial Privacy Controls

**Expense Privacy Modes**

Each expense has a privacy_mode governing visibility:

| Privacy Mode | Visibility | Use Case |
|--------------|------------|----------|
| PRIVATE | Only creator can view | Parent keeps expense private |
| AMOUNT_ONLY | Co-parent sees amount only, no details | Share cost but not reason |
| FULL_SHARED | Co-parent sees all details | Shared expense or transparent cost |

**Implementation:**
```typescript
// API endpoint respects privacy mode
async function getExpenses(req, res) {
  const { family_id } = req.params
  const { auth0_id } = req.user

  const expenses = await Expense.find({ family_id })

  // Filter based on privacy mode and ownership
  const filtered = expenses.map(expense => {
    if (expense.created_by_user_id === req.user.id) {
      // Creator always sees full expense
      return expense
    }

    switch (expense.privacy_mode) {
      case 'PRIVATE':
        return null  // Hide from co-parent
      case 'AMOUNT_ONLY':
        return { amount: expense.amount }  // Only amount
      case 'FULL_SHARED':
        return expense  // Full details
    }
  }).filter(Boolean)

  res.json(filtered)
}
```

**Frontend Enforcement:**
- Show privacy mode selector when creating/editing expenses
- Hide expense details based on privacy mode in dashboard
- Show "Private" indicator for expenses co-parent cannot view

### Compliance & Audit

**Audit Logging**

Log all sensitive operations:
- User signup, login, logout
- Family creation
- Parent invitation (sent, accepted, expired, resent)
- Role changes and admin transfers
- Soft delete operations
- Cross-family access attempts (security monitoring)
- Expense creation/modification (Phase 2: with financial impact)

**Log Format:**
```json
{
  "timestamp": "2025-12-14T11:00:00Z",
  "event_type": "admin_transfer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "family_id": "550e8400-e29b-41d4-a716-446655440001",
  "details": {
    "previous_admin_id": "550e8400-e29b-41d4-a716-446655440000",
    "new_admin_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Monitoring & Alerts**

- Auth0 authentication failure rate (trigger alert if > 5% in 1 hour)
- Invitation acceptance rate tracking (success metric)
- Cross-family access attempt detection (immediate alert)
- Email delivery failures (track for resend mechanism)
- Database query performance (family_id partition effectiveness)

**GDPR Phase 5 (Not MVP)**
- Right to be forgotten: Permanent data deletion with 30-day grace period
- Data export: Full family data export for parent
- Data retention: Automatic deletion after inactivity period
- Privacy impact assessments

**CCPA Phase 5 (Not MVP)**
- Consumer rights: Transparent data collection disclosure
- Data sale opt-out: Parent can opt out of data sharing
- Deletion requests: Permanent deletion option
- Privacy policy updates

## Testing Strategy

### Unit Tests

**Auth Service Tests**
- Test JWT validation with Auth0 public keys
- Test user registration with valid/invalid auth0_id
- Test user lookup by auth0_id
- Test soft delete operations
- Test JWT expiration handling

**Family Service Tests**
- Test family creation with valid data
- Test family creation with missing required fields
- Test one-family-per-parent constraint
- Test child record creation with family
- Test family context retrieval for parent

**Invitation Service Tests**
- Test invitation creation with valid email
- Test invitation token generation (uniqueness)
- Test invitation expiration validation (7 days)
- Test duplicate invitation prevention
- Test self-invitation prevention
- Test invitation acceptance validation
- Test invitation status transitions (PENDING → ACCEPTED → None)
- Test invitation resend (new token generation)

**RBAC Service Tests**
- Test role assignment on family creation (ADMIN_PARENT)
- Test role assignment on invitation acceptance (CO_PARENT)
- Test role verification in authorization checks
- Test admin transfer role updates
- Test Auth0 role sync

**Tenant Isolation Tests**
- Test family_id partition key in queries
- Test cross-family access prevention
- Test query filtering by family_id
- Test index effectiveness on (family_id, key) queries

**Privacy Mode Tests**
- Test expense visibility based on privacy mode
- Test PRIVATE mode hiding from co-parent
- Test AMOUNT_ONLY mode showing amount only
- Test FULL_SHARED mode showing all details
- Test creator always sees full expense

### Integration Tests

**Auth0 Integration Flow**
- Test signup flow with Auth0 (mock Auth0 responses)
- Test login flow with Auth0
- Test JWT token validation
- Test password reset (mock Auth0 email flow)
- Test role sync to Auth0 (mock Management API)

**Invitation Acceptance Flow**
- Test complete flow: create invitation → send email → accept invitation → join family
- Test invitation with new account creation
- Test invitation with existing account login
- Test invitation expiration (7 days)
- Test invitation resend with new token

**Multi-Tenant Isolation**
- Test two families with two parents each
- Test parent in family A cannot query family B data
- Test parent in family A cannot create invitation for family B
- Test parent in family A cannot transfer admin in family B
- Test expense privacy rules across tenant boundaries

**Email Integration**
- Test invitation email sending (mock email service)
- Test email content includes family name and children
- Test email link contains valid token
- Test resend generates new email with new token

### End-to-End (E2E) Tests

**Signup Flow (New Parent)**
1. Navigate to signup page
2. Click "Sign Up with Google"
3. Complete Auth0 signup
4. Verify JWT stored in SessionStorage
5. Verify POST /api/v1/users/register called
6. Verify redirected to family setup
7. Verify family setup form displayed

**Family Creation Flow**
1. Complete signup flow
2. Enter family name "Test Family"
3. Enter two children (names, birthdates)
4. Submit family form
5. Verify POST /api/v1/families called
6. Verify family created in database
7. Verify Parent record created with ADMIN_PARENT role
8. Verify redirected to dashboard

**Invitation and Acceptance Flow**
1. Admin parent logged in
2. Navigate to "Invite Co-Parent"
3. Enter co-parent email
4. Click "Send Invitation"
5. Verify POST /api/v1/invitations called
6. Verify invitation email sent
7. Co-parent clicks link in email
8. Verify GET /api/v1/invitations/{token}/preview called
9. Verify invitation preview displayed
10. Co-parent clicks "Create Account"
11. Completes Auth0 signup
12. Verify POST /api/v1/invitations/{token}/accept called
13. Verify Parent record created with CO_PARENT role
14. Verify redirected to dashboard
15. Verify both parents see shared data

**Admin Transfer Flow**
1. Admin parent logged in
2. Navigate to family settings
3. Click "Transfer Admin" for co-parent
4. Confirm dialog
5. Verify PUT /api/v1/families/{id}/transfer-admin called
6. Verify roles updated in database
7. Verify roles synced to Auth0
8. Co-parent's next login shows ADMIN_PARENT role
9. Former admin's role is now CO_PARENT

### Test Coverage Goals

- Unit test coverage: 80%+ for auth and invitation logic
- Integration test coverage: All critical user flows
- E2E test coverage: Signup, family creation, invitation, admin transfer
- Security test coverage: Cross-tenant access prevention, privacy mode enforcement

## Deployment & Configuration

### Environment Variables

**Backend (.env file)**

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_MANAGEMENT_API_DOMAIN=your-tenant.auth0.com
AUTH0_MANAGEMENT_API_CLIENT_ID=your_management_client_id
AUTH0_MANAGEMENT_API_CLIENT_SECRET=your_management_client_secret

# Frontend Configuration
FRONTEND_URL=https://coparent.app (for Auth0 callback redirects)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/coparent
DATABASE_POOL_SIZE=20

# Email Service Configuration
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@coparent.app

# JWT Configuration
JWT_SECRET=your-jwt-secret (for additional signing if needed)
JWT_EXPIRATION=24h

# Logging & Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn

# Node Environment
NODE_ENV=production
```

**Frontend (.env file)**

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=https://coparent.app/auth/callback

# API Configuration
VITE_API_URL=https://api.coparent.app

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Auth0 Setup Checklist

- [ ] Create Auth0 application (type: Single Page Application)
- [ ] Configure callback URLs: `https://coparent.app/auth/callback`, `http://localhost:5173/auth/callback` (dev)
- [ ] Configure logout URL: `https://coparent.app/logout`, `http://localhost:5173/logout` (dev)
- [ ] Configure allowed web origins: `https://coparent.app`, `http://localhost:5173` (dev)
- [ ] Enable Google social connection
- [ ] Create two custom roles: ADMIN_PARENT, CO_PARENT
- [ ] Create custom claims (optional): Add family_id to JWT token
- [ ] Configure email verification (default: enabled)
- [ ] Configure password reset email template
- [ ] Create Management API application (for role sync)
- [ ] Grant Management API scopes: `read:roles`, `update:users_app_metadata`
- [ ] Test signup/login flow with Google
- [ ] Test password reset flow

### Database Migrations

Migrations should be authored and applied via `migrate-mongo`. Below are illustrative Mongoose schema sketches to document collection structure.

**User Schema (Mongoose)**
```ts
import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
```

**Family Schema (Mongoose)**
```ts
import { Schema, Types } from 'mongoose';

export const FamilySchema = new Schema(
  {
    name: { type: String, required: true },
    createdByUserId: { type: Types.ObjectId, required: true }
  },
  { timestamps: true }
);
```

**Parent Schema (Mongoose)**
```ts
import { Schema, Types } from 'mongoose';

export const ParentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true },
    familyId: { type: Types.ObjectId, required: true },
    role: { type: String, enum: ['ADMIN_PARENT', 'CO_PARENT'], required: true },
    joinedAt: { type: Date },
    invitedAt: { type: Date },
    invitedByUserId: { type: Types.ObjectId }
  },
  { timestamps: true }
);

ParentSchema.index({ familyId: 1, userId: 1 }, { unique: true });
ParentSchema.index({ familyId: 1, role: 1 });
```

**Invitation Schema (Mongoose)**
```ts
import { Schema, Types } from 'mongoose';

export const InvitationSchema = new Schema(
  {
    familyId: { type: Types.ObjectId, required: true },
    invitingParentId: { type: Types.ObjectId, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'], required: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    acceptedByUserId: { type: Types.ObjectId },
    resentAt: { type: Date }
  },
  { timestamps: true }
);

InvitationSchema.index({ familyId: 1, email: 1 });
InvitationSchema.index({ familyId: 1, status: 1 });
```

**Child Schema (Mongoose)**
```ts
import { Schema, Types } from 'mongoose';

export const ChildSchema = new Schema(
  {
    familyId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true }
  },
  { timestamps: true }
);

ChildSchema.index({ familyId: 1, name: 1 });
```

**Expense Schema (Mongoose)**
```ts
import { Schema, Types } from 'mongoose';

export const ExpenseSchema = new Schema(
  {
    familyId: { type: Types.ObjectId, required: true },
    createdByUserId: { type: Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    receiptUrl: { type: String },
    privacyMode: { type: String, enum: ['PRIVATE', 'AMOUNT_ONLY', 'FULL_SHARED'], required: true }
  },
  { timestamps: true }
);

ExpenseSchema.index({ familyId: 1, date: 1 });
ExpenseSchema.index({ familyId: 1, createdByUserId: 1 });
```

### Email Service Setup

**SendGrid Configuration:**
- [ ] Create SendGrid account
- [ ] Generate API key
- [ ] Add API key to backend environment variables
- [ ] Configure sender email: noreply@coparent.app
- [ ] Create email templates:
  - Invitation email template (family name, children, token link, CTA button)
  - Password reset email template (handled by Auth0)
  - Welcome email (future enhancement)

**Email Template (Invitation):**
```html
<h1>You're Invited!</h1>
<p>You're invited to join the <strong>{{ family_name }}</strong> family on CoParent.</p>

<h3>Family Information</h3>
<ul>
  {{#each children}}
  <li>{{ this.name }} (DOB: {{ this.date_of_birth }})</li>
  {{/each}}
</ul>

{{#if message}}
<h3>Message from {{ inviting_parent_name }}</h3>
<p>{{ message }}</p>
{{/if}}

<a href="{{ invitation_url }}" class="button">Accept Invitation</a>

<p>This link expires in 7 days.</p>
```

### Monitoring & Alerting

**Key Metrics to Monitor:**

1. **Authentication Metrics**
   - Signup completion rate (target: >80%)
   - Login success rate (target: >95%)
   - Auth0 error rate (target: <1%)
   - Average login time (target: <2 seconds)

2. **Invitation Metrics**
   - Invitation acceptance rate (target: >70%)
   - Average time to acceptance (target: <2 days)
   - Email delivery rate (target: >95%)
   - Invitation expiration rate (target: <10%)

3. **Family Setup Metrics**
   - Family creation success rate (target: >90%)
   - Average time to family setup (target: <5 minutes)
   - Children data completeness (target: >95%)

4. **Security Metrics**
   - Cross-family access attempts (target: 0)
   - Failed authorization attempts (alert if >100/hour)
   - Admin transfer frequency (baseline for anomaly detection)

5. **Database Performance**
   - Query response time for family_id partitioned queries (target: <100ms)
   - Index hit rate on (family_id, key) indexes (target: >95%)
   - Connection pool utilization (alert if >80%)

**Alerting Rules:**
- Auth0 error rate > 5% in 1 hour
- Cross-family access attempt detected
- Email delivery failure > 5%
- Database query timeout > 5 seconds
- JWT validation failures > 10/minute

**Logging:**
- Use centralized logging (e.g., ELK Stack, DataDog, Sentry)
- Log all auth events (signup, login, logout, password reset)
- Log all invitation events (creation, acceptance, expiration, resend)
- Log all authorization failures (cross-family access)
- Log all role changes (admin transfer)
- Retention policy: 30 days for standard logs, 1 year for audit logs

## Success Criteria & Metrics

### Signup & Onboarding

**Metric: Signup Completion Rate**
- Measure: % of users who start signup and complete account creation
- Target: >80% within 7 days
- Success: User successfully authenticates with Auth0 and User record created

**Metric: Family Setup Completion Rate**
- Measure: % of new users who complete family creation within 24 hours
- Target: >85%
- Success: Family record created with at least one child, Parent record with ADMIN_PARENT role

**Metric: Time to First Family Setup**
- Measure: Average time from signup to family creation
- Target: <5 minutes (median)
- Success: Parents don't abandon setup midway

### Invitation & Collaboration

**Metric: Invitation Acceptance Rate**
- Measure: % of sent invitations that are accepted
- Target: >70% within 7 days
- Success: Co-parents join family and can collaborate

**Metric: Invitation Acceptance Time**
- Measure: Average time from invitation sent to acceptance
- Target: <2 days (median)
- Success: Co-parents respond promptly to invitations

**Metric: Email Delivery Rate**
- Measure: % of invitation emails successfully delivered
- Target: >95%
- Success: Invitations reach co-parents without bouncing

**Metric: Invitation Resend Rate**
- Measure: % of invitations that are resent (due to expiration)
- Baseline: Establish in first month
- Target: <10% (indicates most links are used before expiry)

### Authentication & Security

**Metric: Auth0 Authentication Success Rate**
- Measure: % of login/signup attempts that successfully complete
- Target: >95%
- Success: No unnecessary friction in auth flow

**Metric: Password Reset Success Rate**
- Measure: % of password reset requests that complete successfully
- Target: >90%
- Success: Users can recover accounts when needed

**Metric: Cross-Tenant Data Leakage Attempts**
- Measure: Count of cross-family access attempts detected and blocked
- Target: 0 (zero tolerance)
- Success: No security breaches from multi-tenant isolation failures

**Metric: JWT Validation Failure Rate**
- Measure: % of API requests with invalid or expired JWT
- Target: <2%
- Success: Frontend token refresh mechanism working properly

### Family & Role Management

**Metric: Family Creation Success Rate**
- Measure: % of family creation attempts that complete successfully
- Target: >90%
- Success: No database or API errors in critical path

**Metric: Admin Transfer Completion Rate**
- Measure: % of admin transfer requests that complete successfully
- Target: >95%
- Success: Role management working correctly

**Metric: Role Sync to Auth0 Success Rate**
- Measure: % of role changes synced to Auth0 successfully
- Target: >99%
- Success: Consistent role state between backend and Auth0

### System Performance

**Metric: API Response Time (Family-Scoped Queries)**
- Measure: 95th percentile response time for family_id partitioned queries
- Target: <100ms
- Success: Query-time isolation doesn't degrade performance

**Metric: Database Query Index Hit Rate**
- Measure: % of queries using (family_id, key) composite indexes
- Target: >95%
- Success: Partition key indexes are effective

**Metric: Invitation Link Generation Success Rate**
- Measure: % of invitation creation requests that generate valid tokens
- Target: 100%
- Success: Token generation is reliable

## Dependencies & Risks

### External Dependencies

**Auth0 Service**
- **Dependency:** OIDC provider, role management, email verification
- **Risk:** Auth0 outage prevents new signups and logins
- **Mitigation:**
  - Monitor Auth0 status page
  - Implement graceful error messages (show maintenance banner)
  - Cache Auth0 public keys for JWT validation (30-minute TTL)
  - Have communication plan for outages
- **Fallback:** None (Auth0 is critical path for MVP)

**Email Service (SendGrid/SES)**
- **Dependency:** Send invitation emails
- **Risk:** Email service down, emails not delivered
- **Mitigation:**
  - Monitor email delivery rate (alert if <95%)
  - Implement retry logic for failed sends (exponential backoff)
  - Queue email sends for asynchronous processing
  - Have fallback email provider (setup SES in parallel with SendGrid)
- **Fallback:** Admin can manually resend invitations

**Database (MongoDB via Mongoose)**
- **Dependency:** Store users, families, parents, invitations, children, expenses
- **Risk:** Database outage or performance degradation
- **Mitigation:**
  - Implement connection pooling (ProxySQL (or managed connection pooling) or similar)
  - Use read replicas for non-critical queries
  - Implement query caching for frequently accessed data
  - Monitor slow query log and optimize indexes
  - Regular backups (daily, tested monthly)
- **Fallback:** Read-only mode if write operations fail (frontend shows error)

### Technical Risks

**Multi-Tenant Isolation Failures**
- **Risk:** Bug in query filtering allows parent to access another family's data
- **Mitigation:**
  - Extensive unit and integration testing of tenant isolation
  - Code review mandatory for all queries and API routes
  - Automated security tests for cross-family access
  - Monitoring and alerting for unauthorized access attempts
  - Periodic security audits by third party
- **Severity:** Critical (data privacy breach)

**JWT Token Validation Failures**
- **Risk:** Invalid or expired tokens accepted, allowing unauthorized access
- **Mitigation:**
  - Validate JWT signature against Auth0 public keys
  - Check token expiration timestamp
  - Verify token claims (user ID, email, roles)
  - Rate limit failed JWT validations
  - Log all validation failures
- **Severity:** Critical (authentication bypass)

**Auth0 Role Sync Failures**
- **Risk:** Roles not synced to Auth0, causing permission mismatches
- **Mitigation:**
  - Implement role sync in background job with retry logic
  - Monitor sync failures and alert
  - Cache local role state in Parent records as source of truth
  - API authorization checks use local Parent.role as primary
- **Severity:** High (users may have unexpected permissions)

**Email Delivery Failures**
- **Risk:** Invitations not delivered, co-parents can't join family
- **Mitigation:**
  - Implement retry logic for failed sends
  - Queue email sends for asynchronous processing
  - Monitor delivery rates and implement fallback sender
  - Provide resend mechanism for admin
  - Show error to admin if send fails initially
- **Severity:** High (blocks collaboration)

**Database Migration Failures**
- **Risk:** Migrations fail, breaking table structure
- **Mitigation:**
  - Test all migrations in staging environment
  - Have rollback plan for each migration
  - Run migrations during low-traffic windows
  - Backup database before running migrations
  - Monitor migration execution time
- **Severity:** High (service downtime)

**Performance Degradation**
- **Risk:** Family_id partition key queries become slow as data grows
- **Mitigation:**
  - Monitor query response times (alert if >100ms)
  - Implement query result caching for frequently accessed data
  - Use read replicas for read-heavy operations
  - Periodically review and optimize indexes
  - Load test with realistic family sizes
- **Severity:** Medium (UX impact)

### Operational Risks

**Invitation Link Expiration**
- **Risk:** Co-parents can't join if link expires
- **Mitigation:** Admin can resend invitations
- **Severity:** Low (recoverable)

**Soft Delete Impact on Queries**
- **Risk:** Soft-deleted users appear in results
- **Mitigation:** Include `is_active = true` in all user queries
- **Severity:** Medium (data quality issue)

**Session Management**
- **Risk:** JWT tokens stolen from SessionStorage via XSS
- **Mitigation:**
  - Implement Content Security Policy (CSP)
  - Use SessionStorage instead of LocalStorage (cleared on browser close)
  - Implement token rotation on each API call
  - HTTPS only (prevent man-in-the-middle)
- **Severity:** High (session hijacking)

## Future Considerations (Phase 2+)

### Phase 2 Enhancements

**Two-Factor Authentication (2FA)**
- Implement TOTP (Time-based One-Time Password) support
- Allow parents to enable 2FA in account settings
- Integrate with Google Authenticator, Microsoft Authenticator
- Fallback codes for account recovery

**Multiple Families Per Parent**
- Extend User → Family relationship from 1:1 to 1:N
- Add "Switch Family" dropdown in dashboard
- Separate invitations and roles per family
- Shared expenses across families (future feature)

**Advanced Permission Granularity**
- Read-only access (can view calendar/expenses, can't edit)
- Expense-specific permissions (approve expenses over $X)
- Calendar-specific permissions (view only, edit only own events)
- Document-specific permissions (legal docs view only)

**Encryption at Rest**
- Encrypt sensitive fields: medical information, financial records
- Use AWS KMS or similar for key management
- Implement field-level encryption in application layer
- Key rotation strategy

**Session Management & Device Tracking**
- Show active sessions (devices) in account settings
- Allow parent to logout from specific devices
- Implement device fingerprinting for anomaly detection
- Login notifications for new devices/locations

**Advanced Security Features**
- IP whitelisting per family (optional)
- Geographic restrictions (admin can restrict to country)
- Device trust (remember device for 30 days)
- Security questions for password reset fallback

### Phase 3+ Enhancements

**Family Hierarchy & Extended Family**
- Grandparents, step-parents, aunts/uncles as read-only viewers
- Assign roles: GRANDPARENT (view calendar only), STEP_PARENT (full access), etc.
- Permissions matrix for granular control

**Bank Integration**
- Connect bank accounts for expense tracking
- Auto-import transactions and categorize
- Reconcile manual expenses with bank data
- Budget tracking and alerts

**Audit Logging & Compliance**
- Comprehensive audit log export
- Admin can view all changes, deletions, access
- Integration with compliance frameworks (SOC 2, HIPAA)
- Data residency options (EU data center, etc.)

### Phase 5+ Enhancements

**GDPR Compliance (Right to Be Forgotten)**
- Parent can request complete data deletion
- 30-day grace period for recovery
- Automated purge of all associated data (users, families, expenses, etc.)
- Audit log of deleted data for legal compliance

**CCPA Compliance**
- Privacy policy updated to reflect data collection
- Consumer can opt out of data sales (none currently, but for future)
- Data export endpoint for consumer rights
- Deletion request fulfillment

**Advanced Data Residency & Encryption**
- Choose EU or US data center
- End-to-end encryption option (keys held by parent only)
- Zero-knowledge architecture for highly sensitive data

**Machine Learning Features**
- Expense categorization suggestions (ML model)
- Budget recommendations based on expense patterns
- Anomaly detection for fraud prevention
- Predictive custody schedule analysis

## Conclusion

This specification provides a comprehensive blueprint for implementing User Authentication & Multi-Tenant Setup for CoParent. The feature combines secure Auth0 integration, family-scoped multi-tenancy, robust invitation workflows, and granular financial privacy controls. Strict query-time isolation, API-level authorization checks, and comprehensive audit logging ensure that family data remains secure and isolated. Success metrics track signup completion, invitation acceptance, and authentication reliability, while risk mitigation strategies address critical dependencies on Auth0, email delivery, and database performance.

The implementation prioritizes security, usability, and operational reliability. Soft-delete for user accounts and comprehensive logging establish foundations for future GDPR and CCPA compliance. Phase 2 and beyond enhancements—including 2FA, multiple families per parent, and encryption at rest—can be layered on without breaking the foundational multi-tenant architecture.
