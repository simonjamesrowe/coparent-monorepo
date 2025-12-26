# Task Breakdown: User Authentication & Multi-Tenant Setup

## Overview

This task breakdown covers the complete implementation of CoParent's foundational authentication and multi-tenant feature. The feature includes Auth0 OIDC integration, family unit management, parent invitation system, role-based access control, and query-time tenant isolation with financial privacy controls.

**Total Estimated Tasks:** 48 tasks organized into 9 strategic groups
**Total Effort:** ~140-160 story points (24-28 weeks for 2 developers)
**MVP Scope:** All tasks (Phase 1, MVP complete)

---

## Task List

### Phase 1: Backend Infrastructure & Database Setup

**Effort Estimate:** 32 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** None (can start immediately)

#### Task Group 1.0: Database Schema and Migrations

**Team:** Backend Engineer | **Acceptance Criteria:** All migrations run successfully, all indexes created, schema matches spec.md

- [x] 1.1 Create migrations for User table
  - **Effort:** S (4 hours)
  - **Description:** Database migration for User entity with auth0_id (unique), email (unique), name, phone, avatar_url, is_active flag, soft-delete timestamps
  - **Key Indexes:** auth0_id (unique), email (unique), is_active
  - **Notes:** See spec.md "Entity Definitions" section for User schema. Include soft delete support.
  - **Verification:** Migration runs successfully, indexes created, constraints enforced

- [x] 1.2 Create migrations for Family table
  - **Effort:** S (3 hours)
  - **Description:** Database migration for Family entity with name, created_by_user_id (FK to User), timestamps
  - **Key Indexes:** created_by_user_id
  - **Notes:** Family serves as tenant boundary for all data. See spec.md "Entity Definitions"
  - **Verification:** Migration runs, FK constraint enforced, index created

- [x] 1.3 Create migrations for Parent table
  - **Effort:** M (5 hours)
  - **Description:** Database migration for Parent join table linking User and Family with role (enum: ADMIN_PARENT, CO_PARENT), invited_at, joined_at, invited_by_user_id
  - **Key Indexes:** (family_id, user_id), (family_id, role), family_id, user_id
  - **Constraints:** UNIQUE(user_id, family_id) - one user per family
  - **Notes:** See spec.md "Entity Definitions" for Parent schema. Critical for role management.
  - **Verification:** Indexes created, unique constraint enforced, enum type works

- [x] 1.4 Create migrations for Invitation table
  - **Effort:** M (5 hours)
  - **Description:** Database migration for Invitation entity with token (unique), email, status (enum: PENDING, ACCEPTED, EXPIRED, REVOKED), expires_at, accepted_at, accepted_by_user_id, resent_at
  - **Key Indexes:** token (unique), (family_id, email), (family_id, status), expires_at, status
  - **Notes:** Invitation tokens enable 7-day email invitation flow. See spec.md lines 473-495
  - **Verification:** All indexes created, enum values work, constraints enforced

- [x] 1.5 Create migrations for Child table
  - **Effort:** S (3 hours)
  - **Description:** Database migration for Child entity with family_id (FK), name, date_of_birth
  - **Key Indexes:** family_id, (family_id, name)
  - **Notes:** Pre-filled family information during setup. See spec.md lines 497-510
  - **Verification:** Migration runs, FK constraint enforced

- [x] 1.6 Create migrations for Expense table
  - **Effort:** M (5 hours)
  - **Description:** Database migration for Expense entity with family_id (FK, partition key), created_by_user_id (FK), amount, category, date, description, receipt_url, privacy_mode (enum: PRIVATE, AMOUNT_ONLY, FULL_SHARED)
  - **Key Indexes:** (family_id, created_by_user_id), (family_id, date), family_id, privacy_mode
  - **Notes:** Includes financial privacy controls. See spec.md lines 512-532. privacy_mode enforces granular sharing.
  - **Verification:** All indexes created, privacy_mode enum works, family_id partition key present

- [x] 1.7 Verify all migrations and database constraints
  - **Effort:** S (3 hours)
  - **Description:** Run all migrations in sequence, verify tables exist, verify indexes created, verify constraints enforced, verify foreign keys work
  - **Notes:** Test in staging database before production deployment
  - **Verification:** All migrations succeed with no errors, schema matches spec.md, no orphaned records possible

**Acceptance Criteria:**
- All 6 migrations (User, Family, Parent, Invitation, Child, Expense) run successfully
- All indexes created as specified
- All foreign key constraints enforced
- All unique constraints enforced
- Soft delete support functional (is_active, deleted_at fields)
- family_id partition key present on all family-scoped tables

---

### Phase 2: Backend Auth0 Integration (Identity Layer)

**Effort Estimate:** 24 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** Task Group 1.0 (Database migrations complete)

#### Task Group 2.0: Auth0 Configuration and JWT Validation

**Team:** Backend Engineer | **Acceptance Criteria:** Auth0 public keys cached, JWT validation working, user extraction functional

- [x] 2.1 Configure Auth0 application and management API
  - **Effort:** S (4 hours)
  - **Description:** Set up Auth0 application for CoParent, configure callback URLs, configure logout URLs, enable Google social connection, create ADMIN_PARENT and CO_PARENT roles in Auth0, configure Management API client for role syncing
  - **Auth0 Checklist:** See spec.md "Auth0 Setup Checklist" section (lines 1594-1609)
  - **Notes:**
    - Callback: {FRONTEND_URL}/auth/callback
    - Logout: {FRONTEND_URL}/logout
    - Allowed origins: {FRONTEND_URL}
    - Roles: ADMIN_PARENT, CO_PARENT
  - **Verification:** Auth0 application created, roles visible in Auth0 dashboard, callback URLs configured

- [x] 2.2 Implement JWT token validation middleware
  - **Effort:** M (6 hours)
  - **Description:** Backend middleware to validate incoming JWT tokens using Auth0 public keys, extract user ID and roles from token, attach user context to request
  - **Key Requirements:**
    - Fetch and cache Auth0 public keys (30-minute TTL)
    - Validate JWT signature
    - Check token expiration (expires_at)
    - Verify token claims (user ID, email, roles)
    - Handle validation errors gracefully
  - **Notes:** See spec.md "JWT Validation" (lines 255-259) and security section (lines 1288-1293)
  - **Verification:** Valid tokens pass validation, invalid tokens rejected, expired tokens rejected

- [x] 2.3 Implement user context extraction from JWT
  - **Effort:** S (3 hours)
  - **Description:** Extract auth0_id, email, and roles from validated JWT token, attach to request.user object for use in controllers
  - **Notes:** auth0_id is unique identifier linking to User record in database
  - **Verification:** Request.user contains auth0_id, email, roles extracted from JWT

- [x] 2.4 Implement Auth0 Management API client for role syncing
  - **Effort:** M (6 hours)
  - **Description:** Client library to call Auth0 Management API for syncing Parent roles (ADMIN_PARENT, CO_PARENT) to Auth0 user records
  - **Operations:**
    - Add role to user (POST /api/v2/users/{id}/roles)
    - Remove role from user (DELETE /api/v2/users/{id}/roles)
    - Get user roles (GET /api/v2/users/{id}/roles)
  - **Notes:** See spec.md "Role Management" (lines 261-265). Management API credentials from environment variables.
  - **Verification:** Roles successfully synced to Auth0, Management API calls successful

- [x] 2.5 Implement rate limiting for JWT validation failures
  - **Effort:** S (3 hours)
  - **Description:** Rate limit requests with invalid/expired JWTs to prevent brute force attacks
  - **Config:** Max 10 validation failures per minute per IP
  - **Notes:** See Dependencies & Risks section (lines 1955-1956)
  - **Verification:** Requests rate limited after exceeding threshold

- [x] 2.6 Implement audit logging for authentication events
  - **Effort:** S (2 hours)
  - **Description:** Log all critical authentication events: user signup, login, logout, password reset initiation, JWT validation failures, role changes
  - **Log Format:** See spec.md "Audit Logging" (lines 1372-1386)
  - **Notes:** Include timestamp, event_type, user_id, auth0_id, IP, user_agent
  - **Verification:** All auth events logged, logs contain required fields

**Acceptance Criteria:**
- Auth0 public keys cached and refreshed every 30 minutes
- JWT tokens validated on every authenticated endpoint
- User context (auth0_id, email, roles) successfully extracted from JWT
- Auth0 Management API client functional for role syncing
- Expired/invalid tokens rejected with 401 status
- All auth events logged for monitoring and compliance

---

### Phase 3: Backend User & Auth Service Layer

**Effort Estimate:** 28 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** Task Group 2.0 (Auth0 integration complete)

#### Task Group 3.0: User Registration and Profile Management

**Team:** Backend Engineer | **Acceptance Criteria:** User registration working, user lookup by auth0_id working, soft delete functional

- [x] 3.1 Implement User model with validations
  - **Effort:** M (5 hours)
  - **Description:** User model with auth0_id (unique, required), email (unique, required), name (required), phone (optional), avatar_url (optional), is_active (boolean, default true), soft delete timestamps
  - **Validations:**
    - auth0_id must be non-empty string
    - email must be valid email format
    - name must be non-empty string
    - Unique constraint on auth0_id and email
  - **Notes:** See spec.md "User Entity" (lines 420-439). Model should use standard ORM validations.
  - **Verification:** Model created, validations enforced, database constraints work

- [x] 3.2 Implement POST /api/v1/users/register endpoint
  - **Effort:** M (6 hours)
  - **Description:** Register or verify user after Auth0 authentication. Called after Auth0 signup/login to sync user to internal database.
  - **Request Body:** auth0_id, email, name, avatar_url (optional)
  - **Response:** User record + family context + needs_family_setup flag
  - **Logic:**
    - Look up User by auth0_id
    - If exists: return user with family context
    - If not exists: create new User record, return needs_family_setup = true
    - Check if user has Family already
  - **API Spec:** See spec.md "POST /api/v1/users/register" (lines 599-659)
  - **Rate Limit:** 10 requests per hour per IP
  - **Verification:** New users created, existing users found, family context returned correctly

- [x] 3.3 Implement GET /api/v1/users/me endpoint
  - **Effort:** M (6 hours)
  - **Description:** Fetch current authenticated user and family context. Called on app load to restore user and family context.
  - **Request:** JWT in Authorization header
  - **Response:** User, Family (if exists), role, joined_at
  - **Logic:**
    - Extract auth0_id from JWT
    - Look up User by auth0_id
    - Load associated Family through Parent relationship
    - Include parent role and joined_at timestamp
  - **API Spec:** See spec.md "GET /api/v1/users/me" (lines 662-704)
  - **Rate Limit:** 30 requests per minute per user
  - **Verification:** Current user fetched, family context included, role correctly determined

- [x] 3.4 Implement soft delete functionality for User records
  - **Effort:** M (6 hours)
  - **Description:** Soft delete user accounts by marking is_active = false and setting deleted_at timestamp. Data retained for audit/legal purposes.
  - **Implementation:**
    - Scope all User queries to include `is_active = true`
    - Implement soft delete method on User model
    - Log soft delete events for audit trail
    - Prevent deleted users from authenticating
  - **Notes:** See spec.md "Soft Delete" (lines 1306-1310) and requirements.md Follow-up 5
  - **Verification:** Deleted users marked inactive, soft-deleted users cannot login, data retained

- [x] 3.5 Implement password reset handling (Auth0 delegation)
  - **Effort:** S (3 hours)
  - **Description:** Integrate password reset flow delegated to Auth0. Frontend directs users to Auth0 password reset, backend validates and updates user if needed.
  - **Notes:** Auth0 handles password reset entirely. See spec.md "Password Reset" (lines 96-106). No backend password management needed.
  - **Verification:** Password reset flow works, no password stored in CoParent database

- [x] 3.6 Implement user context provider for frontend integration
  - **Effort:** M (2 hours)
  - **Description:** Service methods to fetch and manage user context, return structured responses with user + family + role
  - **Verification:** User context service methods working, responses match API spec

**Acceptance Criteria:**
- Users created successfully via POST /api/v1/users/register
- Existing users found and updated if needed
- GET /api/v1/users/me returns correct user and family context
- Soft delete working (users marked inactive, cannot login)
- Password reset delegated to Auth0 (no backend password handling)
- All user queries scoped to is_active = true

---

### Phase 4: Backend Family Management API

**Effort Estimate:** 24 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** Task Group 3.0 (User service complete)

#### Task Group 4.0: Family Creation and Management

**Team:** Backend Engineer | **Acceptance Criteria:** Family creation working, parent records created with correct roles, Auth0 role sync functional

- [x] 4.1 Implement Family model with validations
  - **Effort:** S (3 hours)
  - **Description:** Family model with name (required), created_by_user_id (FK, required), timestamps
  - **Validations:**
    - name must be non-empty string
    - created_by_user_id must reference valid User
  - **Notes:** See spec.md "Family Entity" (lines 440-452)
  - **Verification:** Model created, validations enforced

- [x] 4.2 Implement Parent model with validations and associations
  - **Effort:** M (5 hours)
  - **Description:** Parent model representing user-family relationship with role, invitation tracking, joined/invited timestamps
  - **Associations:** belongs_to User, belongs_to Family, has_many Invitations
  - **Validations:**
    - user_id and family_id required
    - role must be ADMIN_PARENT or CO_PARENT
    - Unique constraint on (user_id, family_id)
  - **Notes:** See spec.md "Parent Entity" (lines 454-471). This is the join table for users and families.
  - **Verification:** Model created, associations work, validations enforced

- [x] 4.3 Implement Child model for family information
  - **Effort:** S (3 hours)
  - **Description:** Child model for storing children information (name, date_of_birth) as family metadata
  - **Associations:** belongs_to Family
  - **Validations:**
    - name required, non-empty
    - date_of_birth required, valid date
    - family_id required
  - **Notes:** See spec.md "Child Entity" (lines 497-510). Used for pre-filled information in invitations.
  - **Verification:** Model created, validations enforced

- [x] 4.4 Implement POST /api/v1/families endpoint
  - **Effort:** M (6 hours)
  - **Description:** Create new family unit with initial children information. Only callable by authenticated users without existing family.
  - **Request:** name, children array with name and date_of_birth
  - **Response:** Family record, Child records, Parent record with ADMIN_PARENT role
  - **Logic:**
    - Verify user not already has family (1:1 relationship in MVP)
    - Create Family record with created_by_user_id
    - Create Child records from array
    - Create Parent record with role = ADMIN_PARENT
    - Sync ADMIN_PARENT role to Auth0
  - **API Spec:** See spec.md "POST /api/v1/families" (lines 708-783)
  - **Rate Limit:** 10 requests per hour per user
  - **Verification:** Family created, children created, parent record created with admin role, Auth0 role synced

- [x] 4.5 Implement family context retrieval with multi-tenant isolation
  - **Effort:** M (6 hours)
  - **Description:** Service methods to fetch family with all associated data (children, parents, invitations), always filtered by family_id
  - **Query Requirements:**
    - Filter by family_id (partition key)
    - Include children data
    - Include parent roles and user information
    - Include pending invitations
  - **Notes:** See spec.md "Query-Time Isolation" (lines 276-294). Every query must include family_id WHERE clause.
  - **Verification:** Family context retrieved correctly, family_id filtering working

- [x] 4.6 Implement family access verification middleware
  - **Effort:** S (3 hours)
  - **Description:** Middleware to verify authenticated user belongs to requested family before allowing access
  - **Logic:**
    - Extract family_id from request params/body
    - Look up Parent record matching (user_id, family_id)
    - If not found, return 403 Forbidden
    - Attach family_id and parent to request for downstream use
  - **Notes:** See spec.md "API-Level Guards" (lines 296-320). Secondary isolation strategy.
  - **Verification:** Unauthorized access blocked with 403, authorized access allowed

**Acceptance Criteria:**
- Families created successfully with name and children
- Parent record created with ADMIN_PARENT role for creator
- Children records created and stored with family
- One family per parent enforced (1:1 relationship)
- Family access verified at API middleware level
- All queries filtered by family_id (query-time isolation)
- ADMIN_PARENT role synced to Auth0

---

### Phase 5: Backend Invitation System API

**Effort Estimate:** 40 hours | **Duration:** 1.5 sprints | **Priority:** P0 (Critical)
**Dependencies:** Task Group 4.0 (Family management complete)

#### Task Group 5.0: Email Invitations and Acceptance

**Team:** Backend Engineer | **Acceptance Criteria:** Invitations created, emails sent, acceptance working, token expiration enforced

- [x] 5.1 Implement Invitation model with validations
  - **Effort:** M (5 hours)
  - **Description:** Invitation model for email-based parent invitations with token, status, and expiration
  - **Attributes:** family_id (FK), inviting_parent_id (FK), email, token (unique), status (enum), expires_at, accepted_at, accepted_by_user_id, resent_at
  - **Validations:**
    - email must be valid format
    - token must be unique
    - status must be one of: PENDING, ACCEPTED, EXPIRED, REVOKED
    - expires_at must be in future
  - **Notes:** See spec.md "Invitation Entity" (lines 473-495)
  - **Verification:** Model created, validations enforced, token uniqueness works

- [x] 5.2 Implement invitation token generation service
  - **Effort:** M (4 hours)
  - **Description:** Generate unique, URL-safe, non-guessable invitation tokens for email invitations
  - **Implementation:** Base64-encoded UUID or similar, URL-safe format
  - **Requirements:**
    - Tokens must be unique across all invitations
    - Tokens must be URL-safe (no special characters that break URLs)
    - Tokens should not be guessable (use cryptographically secure random)
    - Token valid for 7 days from creation
  - **Notes:** See spec.md "Invitation tokens" (lines 384)
  - **Verification:** Tokens generated, unique, URL-safe, non-guessable

- [x] 5.3 Implement POST /api/v1/invitations endpoint (create invitation)
  - **Effort:** M (7 hours)
  - **Description:** Create and send parent invitation email. Only callable by ADMIN_PARENT of the family.
  - **Request:** email, optional message
  - **Response:** Invitation record, invitation_url
  - **Validations:**
    - User must be ADMIN_PARENT of family
    - Email must be valid format
    - Prevent self-invitation (email != user email)
    - Prevent duplicate invitations to same email in same family
    - Prevent inviting email already a parent in family
  - **Logic:**
    - Create Invitation record with PENDING status, 7-day expiration
    - Generate unique token
    - Send invitation email with token link
    - Return invitation with URL
  - **API Spec:** See spec.md "POST /api/v1/invitations" (lines 786-837)
  - **Rate Limit:** 20 requests per day per user
  - **Email Template:** Include family name, children info, optional message, CTA button
  - **Verification:** Invitations created, emails sent, all validations enforced

- [x] 5.4 Implement GET /api/v1/invitations/{token}/preview endpoint
  - **Effort:** M (5 hours)
  - **Description:** Preview invitation before accepting. No authentication required. Shows family info and inviting parent.
  - **Request:** token (path parameter)
  - **Response:** Invitation, Family, Children, inviting_parent
  - **Validations:**
    - Token must exist in database
    - Token must not be expired (expires_at > now)
    - Status must be PENDING
    - Return 410 for expired/accepted/revoked invitations
  - **Logic:**
    - Look up Invitation by token
    - Load associated Family and Children
    - Load inviting Parent and User information
    - Return preview data
  - **API Spec:** See spec.md "GET /api/v1/invitations/{token}/preview" (lines 840-900)
  - **Rate Limit:** 30 requests per minute per IP
  - **Verification:** Valid tokens return preview, expired/invalid tokens return 410

- [x] 5.5 Implement POST /api/v1/invitations/{token}/accept endpoint
  - **Effort:** M (8 hours)
  - **Description:** Accept invitation and join family as CO_PARENT. Requires valid JWT authentication.
  - **Request:** token (path), JWT in header
  - **Response:** Invitation (updated), Family, Parent record (new)
  - **Validations:**
    - Token must exist and not expired
    - Status must be PENDING
    - User email must match invitation email
    - User must not already be parent in family
  - **Logic:**
    - Validate token and user
    - Create Parent record with role = CO_PARENT
    - Update Invitation: status = ACCEPTED, accepted_at, accepted_by_user_id
    - Sync CO_PARENT role to Auth0
    - Log acceptance event
  - **API Spec:** See spec.md "POST /api/v1/invitations/{token}/accept" (lines 903-960)
  - **Rate Limit:** 10 requests per hour per user
  - **Verification:** Invitations accepted, Parent records created, roles synced

- [x] 5.6 Implement POST /api/v1/invitations/{id}/resend endpoint
  - **Effort:** M (6 hours)
  - **Description:** Resend expired invitation with new token. Only callable by ADMIN_PARENT.
  - **Request:** invitation ID
  - **Response:** Old invitation (revoked), new invitation (fresh token, 7-day expiry)
  - **Validations:**
    - Requesting user must be ADMIN_PARENT
    - Invitation must exist
    - Invitation must be PENDING or EXPIRED (not ACCEPTED)
  - **Logic:**
    - Generate new token
    - Create new Invitation record with same email, new token, new expiration
    - Mark old invitation as REVOKED
    - Send new invitation email
  - **API Spec:** See spec.md "POST /api/v1/invitations/{id}/resend" (lines 963-1009)
  - **Rate Limit:** 10 requests per day per user
  - **Verification:** New invitations created, old marked revoked, new emails sent

- [x] 5.7 Implement email sending service for invitations
  - **Effort:** M (6 hours)
  - **Description:** Integration with email service (SendGrid/SES) for sending invitation emails
  - **Template Variables:**
    - family_name: Name of family
    - children: Array of child names and birthdates
    - inviting_parent_name: Name of admin who sent invitation
    - invitation_message: Optional custom message from admin
    - invitation_url: Link to invitation with token
    - expires_at: When invitation expires
  - **Implementation:**
    - Async email queue (fire and forget, with retry logic)
    - Retry logic: exponential backoff for failed sends
    - Error logging and monitoring
  - **Notes:** See spec.md "Email Service Setup" (lines 1723-1755)
  - **Verification:** Emails sent successfully, retry logic works, failures logged

- [x] 5.8 Implement background job for invitation expiration handling
  - **Effort:** M (4 hours)
  - **Description:** Daily background job to mark PENDING invitations as EXPIRED after 7 days
  - **Logic:**
    - Find all PENDING invitations with expires_at < now
    - Update status to EXPIRED
    - Log expiration events
  - **Schedule:** Once daily, overnight
  - **Notes:** Optional for MVP (can be deferred), but improves data accuracy
  - **Verification:** Job runs, expired invitations updated correctly

**Acceptance Criteria:**
- Invitations created with unique, URL-safe tokens
- Invitation tokens expire after 7 days
- Invitation emails sent with family info and CTA button
- Preview endpoint returns family information without authentication
- Acceptance creates Parent record with CO_PARENT role
- Auth0 roles synced on acceptance
- Resend generates new token and sends new email
- All validations enforced (email format, duplicate prevention, status checks)

---

### Phase 6: Backend Admin Transfer and Role Management

**Effort Estimate:** 16 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** Task Group 5.0 (Invitation system complete)

#### Task Group 6.0: Role Management and Admin Transfer

**Team:** Backend Engineer | **Acceptance Criteria:** Admin transfer working, roles synced to Auth0, audit logged

- [x] 6.1 Implement PUT /api/v1/families/{id}/transfer-admin endpoint
  - **Effort:** M (8 hours)
  - **Description:** Transfer admin privileges from current ADMIN_PARENT to target CO_PARENT. Only callable by ADMIN_PARENT.
  - **Request:** target_user_id
  - **Response:** Family, previous_admin (now CO_PARENT), new_admin (now ADMIN_PARENT), transfer_timestamp
  - **Validations:**
    - Requesting user must be ADMIN_PARENT
    - Target user must be CO_PARENT in same family
    - Cannot transfer to self
    - Family must exist
  - **Logic:**
    - Update requesting user Parent record: role = CO_PARENT
    - Update target user Parent record: role = ADMIN_PARENT
    - Sync roles to Auth0 (remove ADMIN_PARENT, add CO_PARENT for current; vice versa for target)
    - Log admin transfer event with audit trail
  - **API Spec:** See spec.md "PUT /api/v1/families/{id}/transfer-admin" (lines 1012-1064)
  - **Rate Limit:** 5 requests per day per user
  - **Verification:** Roles transferred correctly, Auth0 updated, audit log created

- [x] 6.2 Implement role verification in authorization checks
  - **Effort:** S (4 hours)
  - **Description:** Helper methods to verify user role for specific operations (admin-only operations)
  - **Operations:**
    - isAdminParent(user, family): Check if user is ADMIN_PARENT
    - isCoParent(user, family): Check if user is CO_PARENT
    - requireAdminParent(user, family): Throw 403 if not ADMIN_PARENT
  - **Notes:** Used in endpoints like POST /api/v1/invitations, POST /api/v1/invitations/{id}/resend, PUT /api/v1/families/{id}/transfer-admin
  - **Verification:** Role checks working correctly, unauthorized access denied

- [x] 6.3 Implement role sync consistency checks
  - **Effort:** M (4 hours)
  - **Description:** Service to verify role consistency between local Parent records and Auth0, with error handling and logging
  - **Logic:**
    - Fetch Parent record from database
    - Fetch roles from Auth0 for user
    - Compare and log discrepancies
    - Provide sync method to repair inconsistencies
  - **Notes:** See spec.md "Role Sync to Auth0" section (lines 1879-1881)
  - **Verification:** Consistency checks work, discrepancies detected and reported

**Acceptance Criteria:**
- Admin privileges transferred successfully
- Roles updated in database and synced to Auth0
- Cannot transfer to non-CO_PARENT or self
- Transfer events logged for audit trail
- Role verification working in all admin-only endpoints

---

### Phase 7: Frontend Authentication UI Components

**Effort Estimate:** 36 hours | **Duration:** 1.5 sprints | **Priority:** P0 (Critical)
**Dependencies:** Task Group 3.0 (User service complete)

#### Task Group 7.0: Auth0 Integration and Login/Signup Components

**Team:** Frontend Engineer | **Acceptance Criteria:** Login/signup working, JWT stored, user context established

- [x] 7.1 Set up Auth0 SDK integration in frontend
  - **Effort:** M (5 hours)
  - **Description:** Initialize Auth0 SDK in Next.js frontend with domain, client ID, redirect URIs
  - **Configuration:**
    - Auth0 domain and client ID from environment variables
    - Callback URL: {FRONTEND_URL}/auth/callback
    - Logout URL: {FRONTEND_URL}/logout
    - Audience: API identifier (if using access tokens)
  - **Notes:** See spec.md "Auth0 Integration Points" (lines 248-253) and requirements.md "Auth0 Configuration"
  - **Verification:** SDK initialized, Auth0 configuration loaded

- [x] 7.2 Implement Login component
  - **Effort:** M (6 hours)
  - **Description:** Login page with "Log In" and "Log In with Google" buttons, error handling, loading states
  - **Features:**
    - Login button redirects to Auth0 Universal Login
    - Google login button for social auth
    - "Forgot Password" link directs to Auth0 password reset
    - Show loading spinner during redirect
    - Display error messages for auth failures
    - Link to signup page for new users
  - **Notes:** See spec.md "Login Component" (lines 1084-1089)
  - **Verification:** Login redirects to Auth0, error messages displayed

- [x] 7.3 Implement Signup component
  - **Effort:** M (5 hours)
  - **Description:** Signup page with "Sign Up" and "Sign Up with Google" buttons, error handling, loading states
  - **Features:**
    - Signup button redirects to Auth0 signup
    - Google signup button for social registration
    - Show loading spinner during redirect
    - Display error messages for signup failures
    - Link to login page for existing users
  - **Notes:** See spec.md "Signup Component" (lines 1091-1096)
  - **Verification:** Signup redirects to Auth0, email can be pre-filled from invitation context

- [x] 7.4 Implement Auth Callback component
  - **Effort:** M (8 hours)
  - **Description:** Handle redirect from Auth0 after login/signup, exchange auth code for JWT, sync user to backend
  - **Flow:**
    1. Auth0 redirects to /auth/callback with auth code
    2. Frontend exchanges auth code for JWT token
    3. Store JWT in SessionStorage (not LocalStorage)
    4. Call POST /api/v1/users/register to sync user
    5. Redirect based on response: family setup or dashboard
  - **Error Handling:**
    - Handle Auth0 errors (invalid code, expired code)
    - Handle network errors during token exchange
    - Show user-friendly error messages
  - **Notes:** See spec.md "Auth Callback Component" (lines 1098-1103)
  - **Verification:** Callback handles redirects, JWT stored, user synced

- [x] 7.5 Implement JWT token management (storage and refresh)
  - **Effort:** M (6 hours)
  - **Description:** Manage JWT token lifecycle in SessionStorage with refresh logic
  - **Implementation:**
    - Store JWT in SessionStorage (cleared on browser close)
    - Include JWT in Authorization header for all API calls
    - Detect expired tokens (401 responses)
    - Refresh token or redirect to login on expiration
    - Handle token errors gracefully
  - **Notes:** See spec.md "Session Management" (lines 2008-2015). SessionStorage prevents XSS leakage.
  - **Verification:** JWT stored and sent correctly, expired tokens handled

- [x] 7.6 Implement protected route guards
  - **Effort:** M (6 hours)
  - **Description:** Route guards to prevent access to authenticated pages without valid JWT
  - **Protected Routes:**
    - /dashboard (require JWT + family)
    - /family/* (require JWT + family + admin role for some)
    - /invitations/sent (require JWT + family + admin role)
    - /expenses/* (require JWT + family)
  - **Public Routes:**
    - / (landing)
    - /login (login page)
    - /signup (signup page)
    - /auth/callback (Auth0 callback)
    - /invite/:token (invitation preview)
  - **Logic:**
    - Check isAuthenticated in Zustand store
    - Check family context exists
    - Check role for admin-only routes
    - Redirect to login if not authenticated
    - Redirect to family setup if no family yet
  - **Notes:** See spec.md "Route Guards and Auth Protection" (lines 1180-1227)
  - **Verification:** Unauthorized access blocked, authorized access allowed

**Acceptance Criteria:**
- Auth0 SDK initialized with correct configuration
- Login/Signup components show Auth0 Universal Login
- Callback component exchanges code for JWT
- JWT stored in SessionStorage (not LocalStorage)
- Protected routes require authentication
- Route guards prevent unauthorized access

---

### Phase 8: Frontend Family Setup and Invitation UI

**Effort Estimate:** 40 hours | **Duration:** 1.5 sprints | **Priority:** P0 (Critical)
**Dependencies:** Task Group 7.0 (Auth components complete)

#### Task Group 8.0: Family Setup, Invitations, and Family Management UI

**Team:** Frontend Engineer | **Acceptance Criteria:** Family setup working, invitation flows complete, admin transfer UI functional

- [x] 8.1 Implement Zustand store for family context
  - **Effort:** M (6 hours)
  - **Description:** Global state store for managing user, family, role, and authentication context
  - **Store Structure:**
    ```
    interface FamilyStore {
      user: User | null
      family: Family | null
      role: 'ADMIN_PARENT' | 'CO_PARENT' | null
      isAuthenticated: boolean
      isLoading: boolean
      setUser: (user) => void
      setFamily: (family) => void
      setRole: (role) => void
      setIsAuthenticated: (bool) => void
      setIsLoading: (bool) => void
      clearContext: () => void
    }
    ```
  - **Notes:** See spec.md "State Management" (lines 1142-1179). Initialize on app load via GET /api/v1/users/me
  - **Verification:** Store created, actions work, hydration on app load

- [x] 8.2 Implement FamilySetup component (form)
  - **Effort:** M (7 hours)
  - **Description:** Form to create family unit with name and children information
  - **Fields:**
    - Family name (text input)
    - Children (dynamic array):
      - Child name (text input)
      - Child date of birth (date picker)
      - Add/remove child buttons
    - Submit button (create family)
  - **Validations:**
    - Family name required, non-empty
    - At least one child required
    - Child name required
    - Date of birth required, valid date
    - Show validation errors on submit
  - **States:**
    - Loading state during submission
    - Error state with error message
    - Success redirect to dashboard
  - **API Call:** POST /api/v1/families
  - **Notes:** See spec.md "Family Setup Component" (lines 1105-1110) and Flow 2 (lines 66-79)
  - **Verification:** Form submits correctly, validations enforced, success redirect

- [x] 8.3 Implement InvitationPreview component (unauthenticated)
  - **Effort:** M (6 hours)
  - **Description:** Display invitation preview before signup/login with family info and inviting parent
  - **Features:**
    - No authentication required
    - Show family name
    - Show children information (names, birthdates)
    - Show inviting parent name and avatar
    - Show optional invitation message
    - Display "Create Account" and "Log In" buttons
    - Handle expired/invalid invitations gracefully
  - **API Call:** GET /api/v1/invitations/{token}/preview
  - **Error States:**
    - Expired: "This invitation link has expired. Ask the admin to resend."
    - Invalid: "Invitation not found."
    - Already accepted: "This invitation has already been accepted."
  - **Notes:** See spec.md "Invitation Preview Component" (lines 1112-1117)
  - **Verification:** Preview loads correctly, expired invitations handled

- [x] 8.4 Implement InvitationAccept component (confirmation flow)
  - **Effort:** M (7 hours)
  - **Description:** Handle acceptance of invitation after user signup/login
  - **Flow:**
    1. User creates account or logs in via Auth0
    2. Frontend stores JWT
    3. Frontend calls POST /api/v1/users/register
    4. Frontend calls POST /api/v1/invitations/{token}/accept
    5. Show confirmation: "You've joined [Family Name]!"
    6. Redirect to dashboard
  - **Features:**
    - Show loading state during acceptance
    - Display success message with family name
    - Handle already-accepted invitations (show message)
    - Handle email mismatch (user account email != invitation email)
  - **Notes:** See spec.md "Invitation Accept Component" (lines 1119-1125) and Flow 6 (lines 131-173)
  - **Verification:** Acceptance completes, user joins family, redirect works

- [x] 8.5 Implement InviteCoParent component (admin only)
  - **Effort:** M (8 hours)
  - **Description:** Form for admin parent to send invitations and view pending invitations
  - **Form Fields:**
    - Co-parent email (text input, email validation)
    - Message (optional textarea for custom message)
    - Submit button
  - **Features:**
    - Show list of all invitations (pending, accepted, expired)
    - Show invitation status badges
    - "Resend" button for expired invitations
    - Copy invitation link button
    - Show confirmation after sending
    - Handle validation errors
    - Handle rate limit (20/day)
  - **API Calls:**
    - POST /api/v1/invitations (create)
    - POST /api/v1/invitations/{id}/resend (resend)
  - **States:**
    - Loading state during send
    - Error state with error messages
    - Success state with confirmation
  - **Notes:** See spec.md "Invite Co-Parent Component" (lines 1127-1133) and Flow 5 (lines 108-129)
  - **Verification:** Invitations sent, email validation works, resend functionality

- [x] 8.6 Implement TransferAdmin component (admin only)
  - **Effort:** M (6 hours)
  - **Description:** UI for admin to transfer admin privileges to co-parent
  - **Features:**
    - Display list of co-parents in family
    - "Transfer Admin" button for each co-parent
    - Confirmation dialog before transfer
    - Loading state during transfer
    - Success message: "Admin transferred to [name]"
    - Error handling if transfer fails
  - **API Call:** PUT /api/v1/families/{id}/transfer-admin
  - **Notes:** See spec.md "Admin Transfer Component" (lines 1135-1140) and Flow 9 (lines 210-232)
  - **Verification:** Transfer dialog shows, transfer completes, roles updated in UI

- [x] 8.7 Implement Family Settings page (admin functions)
  - **Effort:** M (4 hours)
  - **Description:** Page for admin parent to manage family (view members, transfer admin, manage invitations)
  - **Sections:**
    - Family Information (name, created date, members count)
    - Members List (parents with roles)
    - Manage Invitations (pending, accepted, expired)
    - Transfer Admin (to another co-parent)
  - **Role Enforcement:** Only ADMIN_PARENT can view/access this page
  - **Notes:** Aggregate of InviteCoParent, TransferAdmin, and family member list
  - **Verification:** Page loads, only admins can access, all functions work

**Acceptance Criteria:**
- Zustand store initialized with user, family, role context
- Family setup form submits and creates family
- Invitation preview shows without authentication
- Invitation acceptance flow completes
- Co-parent invitation form sends emails
- Admin transfer UI shows confirmation dialog
- Family settings page aggregates all admin functions
- Protected pages require authentication and role checks

---

### Phase 9: Frontend Middleware and Route Guards

**Effort Estimate:** 12 hours | **Duration:** 1 sprint | **Priority:** P0 (Critical)
**Dependencies:** Task Group 8.0 (UI components complete)

#### Task Group 9.0: API Client, Error Handling, and State Synchronization

**Team:** Frontend Engineer | **Acceptance Criteria:** API client working, errors handled, state stays in sync

- [x] 9.1 Implement API client with JWT authorization
  - **Effort:** M (5 hours)
  - **Description:** HTTP client with automatic JWT injection, error handling, token refresh
  - **Features:**
    - Automatically include JWT in Authorization header
    - Handle 401 responses (expired tokens)
    - Retry logic for transient errors
    - Timeout handling
    - Request/response interceptors
    - Centralized error handling
  - **Notes:** All authenticated endpoints require JWT in Authorization: Bearer {token}
  - **Verification:** JWT injected correctly, 401s handled, retries work

- [x] 9.2 Implement app initialization with user context restoration
  - **Effort:** M (4 hours)
  - **Description:** On app load, fetch current user context and restore Zustand store
  - **Logic:**
    1. Check if JWT exists in SessionStorage
    2. If yes: Call GET /api/v1/users/me to restore context
    3. Load user, family, role into Zustand store
    4. If no JWT: Set isAuthenticated = false
    5. Show loading spinner until context loaded
  - **Notes:** Critical for session persistence across page refreshes
  - **Verification:** Context restored on page load, loading spinner shown

- [x] 9.3 Implement error handling and user feedback
  - **Effort:** M (3 hours)
  - **Description:** Centralized error handling with user-friendly messages
  - **Error Types:**
    - Auth errors (401): Redirect to login
    - Permission errors (403): Show "Unauthorized" message
    - Validation errors (400): Show field-specific errors
    - Server errors (500): Show generic error, log to Sentry
    - Network errors: Show "Network error, please try again"
  - **Notes:** See requirements.md "Error Handling & Edge Cases" (lines 456-463)
  - **Verification:** Errors handled gracefully, users see helpful messages

- [x] 9.4 Implement logout functionality
  - **Effort:** S (2 hours)
  - **Description:** Clear JWT from SessionStorage, clear Zustand store, redirect to login
  - **Steps:**
    1. Remove JWT from SessionStorage
    2. Clear Zustand family store (clearContext())
    3. Redirect to /login
    4. Optional: Call Auth0 logout endpoint
  - **Verification:** Logout clears context and redirects

- [x] 9.5 Implement loading states and skeletons
  - **Effort:** S (3 hours)
  - **Description:** Show loading indicators while fetching data
  - **Components:**
    - Full-page loader during initial app load
    - Component-level loaders for async operations
    - Skeleton screens for family setup, invitation preview
  - **Notes:** Improves perceived performance and UX
  - **Verification:** Loading states display correctly

**Acceptance Criteria:**
- API client automatically includes JWT in requests
- 401 responses trigger login redirect
- User context restored on app load
- Errors displayed with helpful messages
- Logout clears session and redirects
- Loading states shown during async operations

---

### Phase 10: Security & Isolation Implementation

**Effort Estimate:** 28 hours | **Duration:** 1.5 sprints | **Priority:** P0 (Critical)
**Dependencies:** Task Groups 4.0, 5.0 (API endpoints complete)

#### Task Group 10.0: Multi-Tenant Isolation, Authorization Guards, and Security Monitoring

**Team:** Backend Engineer | **Acceptance Criteria:** All queries filtered by family_id, cross-family access blocked, security events logged

- [x] 10.1 Implement tenant isolation at repository/query layer
  - **Effort:** M (6 hours)
  - **Description:** Ensure all queries filter by family_id as partition key
  - **Implementation:**
    - Create base repository methods that always include family_id
    - Never query without family_id in WHERE clause
    - Use parameterized queries to prevent SQL injection
    - Document partition key requirement in code
  - **Examples:**
    ```sql
    -- CORRECT: Filter by family_id
    SELECT * FROM expenses WHERE family_id = $1 AND created_by_user_id = $2

    -- WRONG: Missing family_id filter
    SELECT * FROM expenses WHERE created_by_user_id = $1
    ```
  - **Notes:** See spec.md "Query-Time Isolation" (lines 276-294)
  - **Verification:** All queries reviewed, family_id filtering enforced in code

- [x] 10.2 Implement tenant isolation verification middleware
  - **Effort:** M (5 hours)
  - **Description:** API middleware to verify user belongs to requested family before processing
  - **Logic:**
    1. Extract family_id from request (params/body)
    2. Get user_id from JWT
    3. Query Parent record for (user_id, family_id)
    4. If not found: Return 403 Forbidden
    5. Attach family_id and parent to request
  - **Applied to:** All family-scoped endpoints
  - **Notes:** See spec.md "API-Level Guards" (lines 296-320)
  - **Verification:** Unauthorized access returns 403, authorized access allowed

- [x] 10.3 Implement cross-family access attempt logging
  - **Effort:** S (3 hours)
  - **Description:** Log all failed authorization attempts (cross-family access attempts) for security monitoring
  - **Log Format:**
    ```json
    {
      "event": "cross_family_access_attempt",
      "user_id": "...",
      "auth0_id": "...",
      "attempted_family_id": "...",
      "endpoint": "/api/v1/families/...",
      "method": "GET",
      "ip": "192.168.1.1",
      "timestamp": "2025-12-14T11:00:00Z"
    }
    ```
  - **Notes:** See spec.md "Logging Cross-Family Access Attempts" (lines 1271-1284) and Monitoring & Alerts (lines 1757-1801)
  - **Verification:** Failed auth attempts logged with required fields

- [x] 10.4 Implement financial privacy mode enforcement
  - **Effort:** M (6 hours)
  - **Description:** Filter expense data based on privacy_mode (PRIVATE, AMOUNT_ONLY, FULL_SHARED)
  - **Logic:**
    - If creator: always show full expense
    - If PRIVATE: hide from co-parent (null or filtered out)
    - If AMOUNT_ONLY: show only amount field to co-parent
    - If FULL_SHARED: show all fields to co-parent
  - **Implementation:**
    - Add filter function to Expense model
    - Apply in API response for GET /expenses
    - Document privacy rules in expense endpoints
  - **Notes:** See spec.md "Financial Privacy Controls" (lines 1312-1352)
  - **Verification:** Privacy modes enforced, co-parent sees correct data

- [x] 10.5 Implement rate limiting for sensitive endpoints
  - **Effort:** M (5 hours)
  - **Description:** Rate limit critical endpoints to prevent abuse
  - **Limits:**
    - POST /api/v1/users/register: 10/hour per IP
    - POST /api/v1/families: 10/hour per user
    - POST /api/v1/invitations: 20/day per user
    - POST /api/v1/invitations/{id}/resend: 10/day per user
    - PUT /api/v1/families/{id}/transfer-admin: 5/day per user
  - **Notes:** See spec.md "Endpoint Specification" (lines 1067-1079) for all rate limits
  - **Verification:** Rate limits enforced, exceeding returns 429

- [x] 10.6 Implement HTTPS enforcement
  - **Effort:** S (2 hours)
  - **Description:** Ensure all communication uses HTTPS (no HTTP fallback)
  - **Implementation:**
    - Production environment enforces HTTPS
    - Redirect HTTP to HTTPS
    - HSTS headers configured
  - **Notes:** See spec.md "HTTPS" (line 1292)
  - **Verification:** HTTP redirects to HTTPS, HSTS headers present

- [ ] 10.7 Implement Content Security Policy (CSP)
  - **Effort:** M (4 hours)
  - **Description:** Configure CSP headers to prevent XSS attacks
  - **Policy:**
    - Restrict script sources to self + trusted CDNs
    - Prevent inline scripts
    - Prevent object/embed/iframe from untrusted sources
  - **Notes:** See spec.md "Session Management" (lines 2008-2015). Helps prevent token theft via XSS.
  - **Verification:** CSP headers configured, inline scripts blocked

- [ ] 10.8 Implement security monitoring and alerting
  - **Effort:** M (3 hours)
  - **Description:** Set up monitoring for security-critical events
  - **Alerts:**
    - Cross-family access attempt (immediate alert)
    - JWT validation failures > 10/minute (potential attack)
    - Rate limit exceeded > 5x per user (potential brute force)
    - Invitation acceptance rate anomaly (baseline + 2 std dev)
  - **Implementation:**
    - Log events to centralized logging (Sentry, DataDog)
    - Configure alert rules in monitoring platform
    - Dashboard to track security metrics
  - **Notes:** See spec.md "Monitoring & Alerts" (lines 1788-1801)
  - **Verification:** Monitoring dashboard created, alerts configured

**Acceptance Criteria:**
- All database queries filter by family_id
- Cross-family access blocked at middleware level
- Cross-family access attempts logged
- Financial privacy modes enforced
- Rate limits configured and enforced
- HTTPS enforced, CSP headers configured
- Security monitoring and alerting working
- Zero cross-family data leakage

---

### Phase 11: Integration Testing

**Effort Estimate:** 32 hours | **Duration:** 1.5 sprints | **Priority:** P1 (MVP)
**Dependencies:** All previous task groups complete

#### Task Group 11.0: Integration and End-to-End Testing

**Team:** QA/Testing Engineer | **Acceptance Criteria:** All user flows tested, critical workflows verified

- [x] 11.1 Write integration tests for signup flow
  - **Effort:** M (5 hours)
  - **Description:** Test complete signup flow from Auth0 to user creation
  - **Test Cases:**
    - User signs up with email/password, JWT created, User record created
    - User signs up with Google, JWT created, User record created
    - Duplicate email prevented, error returned
    - Missing required fields rejected
  - **Notes:** See spec.md "Signup Flow" (lines 1487-1494). Test only critical paths, not all edge cases.
  - **Verification:** Tests pass, signup flow works end-to-end

- [x] 11.2 Write integration tests for family creation flow
  - **Effort:** M (5 hours)
  - **Description:** Test complete family creation flow
  - **Test Cases:**
    - User creates family with name and children, Family and Child records created
    - Parent record created with ADMIN_PARENT role
    - Auth0 role synced (ADMIN_PARENT added to user)
    - Duplicate family prevention (1:1 relationship enforced)
    - Invalid data rejected (missing name, invalid birthdates)
  - **Notes:** See spec.md "Family Creation Flow" (lines 1496-1504)
  - **Verification:** Tests pass, family creation works

- [x] 11.3 Write integration tests for invitation and acceptance flow
  - **Effort:** M (8 hours)
  - **Description:** Test complete invitation flow from creation to acceptance
  - **Test Cases:**
    - Admin creates invitation, email sent, Invitation record created with token
    - Co-parent previews invitation without auth, returns family info
    - Co-parent accepts invitation (new account), Parent record created with CO_PARENT role
    - Co-parent accepts invitation (existing account), Parent record created with CO_PARENT role
    - Expired invitations rejected (410 status)
    - Invalid tokens rejected (404 status)
    - Self-invitation prevented
    - Duplicate invitations prevented
  - **Notes:** See spec.md "Invitation Acceptance Flow" (lines 1506-1521)
  - **Verification:** Tests pass, invitation flow works end-to-end

- [x] 11.4 Write integration tests for admin transfer flow
  - **Effort:** M (4 hours)
  - **Description:** Test admin privilege transfer
  - **Test Cases:**
    - Admin transfers to co-parent, roles updated in database
    - Auth0 roles synced (ADMIN_PARENT removed from old admin, added to new admin)
    - Former admin cannot invite after transfer
    - Cannot transfer to self
    - Cannot transfer to non-CO_PARENT
  - **Notes:** See spec.md "Admin Transfer Flow" (lines 1523-1532)
  - **Verification:** Tests pass, transfer works correctly

- [x] 11.5 Write integration tests for multi-tenant isolation
  - **Effort:** M (6 hours)
  - **Description:** Test that families are properly isolated
  - **Test Cases:**
    - Parent A cannot query Family B data
    - Parent A cannot create invitations for Family B
    - Parent A cannot transfer admin in Family B
    - Cross-family access attempts blocked with 403
    - Cross-family access attempts logged
  - **Notes:** See spec.md "Multi-Tenant Isolation" (lines 1472-1477)
  - **Verification:** Tests pass, isolation verified

- [x] 11.6 Write integration tests for financial privacy modes
  - **Effort:** M (4 hours)
  - **Description:** Test expense visibility based on privacy_mode
  - **Test Cases:**
    - PRIVATE: Creator sees full, co-parent cannot see
    - AMOUNT_ONLY: Creator sees full, co-parent sees amount only
    - FULL_SHARED: Both see full details
    - Creator always sees full expense
  - **Notes:** See spec.md "Financial Privacy Controls" (lines 1312-1352)
  - **Verification:** Tests pass, privacy modes enforced

**Acceptance Criteria:**
- Signup flow tested end-to-end (auth + user creation)
- Family creation tested (family + children + parent roles)
- Invitation flow tested (create + preview + accept)
- Admin transfer tested (roles updated, Auth0 synced)
- Multi-tenant isolation verified (cross-family access blocked)
- Financial privacy modes verified
- All critical user workflows covered by tests

---

### Phase 12: Deployment, Configuration, and Monitoring

**Effort Estimate:** 20 hours | **Duration:** 1 sprint | **Priority:** P1 (MVP)
**Dependencies:** All previous task groups complete

#### Task Group 12.0: Environment Configuration, Deployment, and Monitoring Setup

**Team:** DevOps/Backend Engineer | **Acceptance Criteria:** All environments configured, monitoring active, deployment smooth

- [ ] 12.1 Configure Auth0 for production and staging
  - **Effort:** M (4 hours)
  - **Description:** Set up Auth0 applications for production and staging environments
  - **Staging:**
    - Create staging Auth0 application
    - Configure callback URLs: https://staging.coparent.app/auth/callback
    - Create two custom roles: ADMIN_PARENT, CO_PARENT
    - Create Management API client for role syncing
    - Test signup/login flow in staging
  - **Production:**
    - Create production Auth0 application
    - Configure callback URLs: https://coparent.app/auth/callback
    - Create two custom roles: ADMIN_PARENT, CO_PARENT
    - Create Management API client
    - Enable password reset email template
    - Enable email verification
  - **Notes:** See spec.md "Auth0 Setup Checklist" (lines 1594-1609)
  - **Verification:** Both applications created, roles configured, tested

- [ ] 12.2 Configure database for production
  - **Effort:** M (4 hours)
  - **Description:** Set up PostgreSQL database for production with backups and monitoring
  - **Configuration:**
    - Create production database
    - Run all migrations
    - Configure connection pooling (PgBouncer)
    - Set up automated daily backups
    - Configure WAL archiving for recovery
    - Set up query monitoring and slow query logging
  - **Notes:** See spec.md "Database Migrations" (lines 1610-1721)
  - **Verification:** Database created, migrations run, backups working

- [ ] 12.3 Configure email service (SendGrid/SES)
  - **Effort:** S (3 hours)
  - **Description:** Set up email service for sending invitation emails
  - **Configuration:**
    - Create SendGrid/SES account
    - Generate API key
    - Configure sender email: noreply@coparent.app
    - Create email template for invitations
    - Test email sending
  - **Template Variables:** family_name, children, inviting_parent_name, invitation_url, expires_at, message
  - **Notes:** See spec.md "Email Service Setup" (lines 1723-1755)
  - **Verification:** Email service configured, test emails sent successfully

- [ ] 12.4 Configure environment variables for all environments
  - **Effort:** S (2 hours)
  - **Description:** Set up .env files for development, staging, and production
  - **Variables:**
    - Auth0: domain, client_id, client_secret, management API credentials
    - Database: connection string, pool size
    - Email: SendGrid API key, sender email
    - Frontend: Auth0 domain, client ID, redirect URI
    - API: JWT expiration, logging level
    - Sentry: DSN for error tracking
  - **Notes:** See spec.md "Environment Variables" (lines 1545-1592)
  - **Verification:** All required variables configured, no secrets in code

- [ ] 12.5 Set up centralized logging and monitoring
  - **Effort:** M (4 hours)
  - **Description:** Configure Sentry or similar for error tracking and monitoring
  - **Configuration:**
    - Create Sentry project for CoParent
    - Configure backend integration
    - Configure frontend integration
    - Set up performance monitoring
    - Create alerting rules for critical errors
  - **Key Metrics to Monitor:**
    - Auth0 authentication success rate (target >95%)
    - Invitation acceptance rate (target >70%)
    - Cross-family access attempts (target 0)
    - API response times (target <100ms for family_id queries)
    - Email delivery rate (target >95%)
    - JWT validation failure rate (target <2%)
  - **Notes:** See spec.md "Monitoring & Alerting" (lines 1759-1801)
  - **Verification:** Logging configured, errors tracked, alerts firing

- [ ] 12.6 Set up CI/CD pipeline for automated testing and deployment
  - **Effort:** M (3 hours)
  - **Description:** Configure GitHub Actions or similar for automated testing and deployment
  - **Pipeline:**
    - On PR: Run linting, unit tests, integration tests
    - On merge to main: Run all tests + deploy to staging
    - Manual approval for production deployment
  - **Deployment Steps:**
    - Run database migrations
    - Build and push Docker image
    - Deploy to production servers
    - Run smoke tests
  - **Verification:** Pipeline created, tests run, deployments automated

**Acceptance Criteria:**
- Auth0 configured for staging and production
- PostgreSQL database set up with backups
- Email service configured and tested
- All environment variables configured
- Centralized logging and monitoring active
- CI/CD pipeline automated testing and deployment
- Key metrics monitored with alerting

---

### Phase 13: Documentation and Knowledge Transfer

**Effort Estimate:** 16 hours | **Duration:** 1 sprint | **Priority:** P2 (Nice-to-have MVP)
**Dependencies:** All implementation complete

#### Task Group 13.0: API Documentation, Developer Guides, and Operations Runbooks

**Team:** Technical Writer / Backend Engineer | **Acceptance Criteria:** Documentation complete, team trained

- [ ] 13.1 Write API endpoint documentation
  - **Effort:** M (4 hours)
  - **Description:** Document all 8 API endpoints with request/response examples
  - **For Each Endpoint:**
    - Purpose and use case
    - HTTP method and path
    - Authentication requirements
    - Request body/params with examples
    - Response body with examples
    - Error responses and meanings
    - Rate limits
    - Implementation notes
  - **Endpoints:** POST /users/register, GET /users/me, POST /families, POST /invitations, GET /invitations/{token}/preview, POST /invitations/{token}/accept, POST /invitations/{id}/resend, PUT /families/{id}/transfer-admin
  - **Format:** Markdown or OpenAPI/Swagger spec
  - **Verification:** All endpoints documented with examples

- [ ] 13.2 Write deployment and operations runbook
  - **Effort:** M (4 hours)
  - **Description:** Step-by-step guide for deploying to staging and production
  - **Sections:**
    - Prerequisites and environment setup
    - Database migration steps
    - Rollback procedures
    - Monitoring and alerting setup
    - Troubleshooting common issues
    - Incident response procedures
  - **Verification:** Runbook complete, deployment team trained

- [ ] 13.3 Write tenant isolation and security architecture document
  - **Effort:** S (3 hours)
  - **Description:** Document multi-tenant isolation strategy and security controls
  - **Sections:**
    - Query-time isolation (family_id partition key)
    - API-level authorization checks
    - Financial privacy controls
    - Auth0 integration and role management
    - Cross-family access logging and monitoring
    - Incident response for security events
  - **Verification:** Architecture documented, team understands isolation

- [ ] 13.4 Write developer onboarding guide
  - **Effort:** S (3 hours)
  - **Description:** Guide for new developers to understand architecture and contribute
  - **Sections:**
    - Architecture overview
    - Database schema and relationships
    - API structure and conventions
    - Frontend state management (Zustand store)
    - Auth0 integration details
    - Testing strategy
    - Common development tasks (add endpoint, add role check, etc.)
  - **Verification:** New developer can understand codebase and contribute

- [ ] 13.5 Write troubleshooting guide for common issues
  - **Effort:** S (3 hours)
  - **Description:** Common issues and resolutions for operations team
  - **Issues:**
    - Invitation email not sent: Check SendGrid configuration, API key, sender email
    - Auth0 role sync failing: Check Management API credentials, check user exists
    - Cross-family access attempt: Check JWT, check Parent record, check family_id
    - JWT validation failing: Check Auth0 public key cache, check token expiration
  - **Verification:** Troubleshooting guide covers common scenarios

**Acceptance Criteria:**
- All API endpoints documented with examples
- Deployment runbook complete with rollback procedures
- Security architecture document explains isolation strategy
- Developer onboarding guide enables new developers
- Troubleshooting guide covers common issues

---

## Task Summary by Category

### Database & Backend Infrastructure (Tasks 1.1-1.7, 2.1-2.6, 3.1-3.6, 4.1-4.6, 5.1-5.8, 6.1-6.3, 10.1-10.8)
**Total Effort:** ~160 hours | **Lead:** Backend Engineer

### Frontend (Tasks 7.1-7.6, 8.1-8.7, 9.1-9.5)
**Total Effort:** ~88 hours | **Lead:** Frontend Engineer

### Testing (Task Group 11.0)
**Total Effort:** ~32 hours | **Lead:** QA/Testing Engineer

### DevOps & Operations (Task Group 12.0)
**Total Effort:** ~20 hours | **Lead:** DevOps Engineer

### Documentation (Task Group 13.0)
**Total Effort:** ~16 hours | **Lead:** Technical Writer

---

## Execution Timeline

### Sprint 1 (Week 1-2)
- Task Group 1.0: Database migrations (7 tasks, 18 hours)
- Task Group 2.0: Auth0 integration (6 tasks, 24 hours)
- **Total:** 13 tasks, 42 hours, 2 developers

### Sprint 2 (Week 3-4)
- Task Group 3.0: User service (6 tasks, 28 hours)
- Task Group 4.0: Family management (6 tasks, 24 hours)
- **Total:** 12 tasks, 52 hours, 2 developers

### Sprint 3 (Week 5-7)
- Task Group 5.0: Invitation system (8 tasks, 40 hours)
- Task Group 6.0: Admin transfer (3 tasks, 16 hours)
- **Total:** 11 tasks, 56 hours, 2 developers

### Sprint 4 (Week 8-9)
- Task Group 7.0: Auth frontend (6 tasks, 36 hours)
- Task Group 8.0: Family/invitation UI (7 tasks, 40 hours)
- **Total:** 13 tasks, 76 hours, 2 developers

### Sprint 5 (Week 10-11)
- Task Group 9.0: Middleware & state (5 tasks, 12 hours)
- Task Group 10.0: Security & isolation (8 tasks, 28 hours)
- **Total:** 13 tasks, 40 hours, 2 developers

### Sprint 6 (Week 12-13)
- Task Group 11.0: Integration testing (6 tasks, 32 hours)
- Task Group 12.0: Deployment config (6 tasks, 20 hours)
- **Total:** 12 tasks, 52 hours, 2 developers

### Sprint 7 (Week 14)
- Task Group 13.0: Documentation (5 tasks, 16 hours)
- **Total:** 5 tasks, 16 hours, 1 developer

---

## Priority Matrix

### P0 (Critical MVP) - Must Complete
- Task Groups 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
- **Total:** 48 tasks, 176 hours
- All authentication, family management, invitation, isolation, and core UI components

### P1 (MVP) - Important
- Task Group 11.0: Integration testing (6 tasks, 32 hours)
- Task Group 12.0: Deployment (6 tasks, 20 hours)
- **Total:** 12 tasks, 52 hours
- Quality assurance and production readiness

### P2 (Nice-to-have MVP)
- Task Group 13.0: Documentation (5 tasks, 16 hours)
- **Total:** 5 tasks, 16 hours
- Developer guides and operational runbooks

---

## Risk Mitigation

### Critical Risks & Mitigations

1. **Multi-Tenant Isolation Failures**
   - Risk: Bug in family_id filtering allows cross-family data leakage
   - Mitigation: Extensive testing (Task 11.5), code review on all queries, security audit
   - Severity: CRITICAL

2. **Auth0 Integration Failures**
   - Risk: Auth0 outage prevents signups/logins
   - Mitigation: Cache public keys, monitor Auth0 status, graceful error messaging
   - Severity: HIGH

3. **Email Delivery Failures**
   - Risk: Invitations not delivered to co-parents
   - Mitigation: Retry logic, fallback email provider, resend mechanism
   - Severity: HIGH

4. **JWT Validation Bypasses**
   - Risk: Invalid tokens accepted, allowing unauthorized access
   - Mitigation: Rigorous JWT validation testing, rate limiting, logging all failures
   - Severity: CRITICAL

5. **Database Performance Degradation**
   - Risk: family_id queries become slow as data grows
   - Mitigation: Index optimization (Task 1.7), query monitoring, load testing
   - Severity: MEDIUM

6. **Soft Delete Edge Cases**
   - Risk: Soft-deleted users appear in queries
   - Mitigation: Scope all User queries to is_active = true (Task 3.4), testing
   - Severity: MEDIUM

---

## Success Metrics

### Signup & Onboarding
- Signup completion rate: >80% within 7 days
- Family setup completion rate: >85% within 24 hours
- Time to first family setup: <5 minutes (median)

### Invitation & Collaboration
- Invitation acceptance rate: >70% within 7 days
- Email delivery rate: >95%
- Invitation resend rate: <10%

### Authentication & Security
- Auth0 authentication success rate: >95%
- Cross-tenant data leakage attempts: 0 (zero tolerance)
- JWT validation failure rate: <2%

### System Performance
- API response time (family_id queries): <100ms (95th percentile)
- Database index hit rate: >95%
- Uptime: >99.5%

---

## Dependencies and Assumptions

### External Dependencies
- Auth0 service availability
- Email service (SendGrid/SES) availability
- PostgreSQL database availability

### Assumptions
- Team has experience with Node.js/Express and React/Next.js
- Team familiar with Auth0 OIDC flows
- Database migrations can be run without downtime (Phase 1)
- Team has access to Auth0 management console for setup

### Technology Stack (from standards)
- Backend: Node.js/Express
- Frontend: Next.js/React with Zustand
- Database: PostgreSQL
- Testing: Jest, React Testing Library
- Deployment: GitHub Actions, AWS/Vercel
- Auth: Auth0 OIDC
- Email: SendGrid/SES
- Monitoring: Sentry

---

## Next Steps After MVP

### Phase 2 Enhancements
- Two-factor authentication (2FA)
- Multiple families per parent (1:N relationship)
- Advanced permission granularity (read-only roles)
- Encryption at rest for sensitive fields
- Session management & device tracking

### Phase 3+ Enhancements
- Family hierarchy & extended family members
- Bank integration for expense tracking
- Audit logging & compliance frameworks
- Advanced data residency options

### Phase 5+ Enhancements
- GDPR data deletion (right-to-be-forgotten)
- CCPA compliance features
- End-to-end encryption options
- Machine learning features (expense categorization, anomaly detection)

---

## Appendix: Referenced Sections

**Spec.md Key Sections:**
- Executive Summary: Lines 1-9
- Feature Overview: Lines 11-49
- User Flows: Lines 51-232
- Technical Architecture: Lines 234-400
- API Specification: Lines 563-1079
- Frontend Implementation: Lines 1080-1227
- Security & Compliance: Lines 1228-1407
- Testing Strategy: Lines 1408-1539
- Deployment & Configuration: Lines 1541-1801
- Success Criteria: Lines 1803-1901
- Dependencies & Risks: Lines 1900-2015

**Requirements.md Key Sections:**
- Functional Requirements: Lines 96-141
- Security Requirements: Lines 143-163
- Data Model: Lines 165-254
- Authentication Flow: Lines 257-292
- Invitation Flow: Lines 294-369

---

## Final Notes

This task breakdown is comprehensive and follows a logical dependency chain: database → auth → user service → family management → invitations → frontend → security → testing → deployment. The effort estimates are conservative (with padding for unknowns), and tasks are sized for 2-4 hour sprints for parallel work.

The 48 primary tasks can be executed in ~7 sprints (14 weeks) with 2 dedicated developers working full-time. Additional team members (QA, DevOps, Technical Writer) can work in parallel on testing, deployment, and documentation starting in Sprint 4-5.

All tasks align with the spec.md requirements and adhere to user standards and best practices outlined in the standards directory.
