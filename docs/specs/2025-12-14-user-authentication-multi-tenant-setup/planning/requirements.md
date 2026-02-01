# Spec Requirements: User Authentication & Multi-Tenant Setup

## Initial Description
User Authentication & Multi-Tenant Setup is the foundational feature for CoParent, implementing Auth0 OIDC integration for secure parent authentication, family unit management, multi-tenant architecture where each family is isolated as a separate tenant, a parent invitation system for co-parents, and secure role-based access control ensuring parents can only access their family's data.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming the initial authentication flow should include signup (new account creation), login, and password reset functionality. Should we also include email verification, two-factor authentication (2FA), or social login options in MVP, or defer these to a later phase?

**Answer:** No 2FA needed in MVP. Use Auth0 with Google integration for authentication (social login via Google is included). Email verification can be handled by Auth0's defaults.

**Q2:** I'm thinking we should isolate each family as a separate tenant at the data level, with family_id as the partition key across all queries and database operations. Is this the intended approach, or would you prefer a different isolation strategy (schema-per-tenant, instance-per-tenant, etc.)?

**Answer:** Yes, use query-time isolation with family_id as the partition key. Every query should filter by family_id.

**Q3:** I'm assuming we need at least two initial roles—"Admin Parent" (full access) and "Co-Parent" (collaborative access with similar permissions). Are there additional roles we should support in MVP (like read-only parents, step-parents, or restricted access), or should we keep it simple with just these two?

**Answer:** Keep it simple with Admin Parent and Co-Parent roles in MVP. Additional roles can be added in future phases.

**Q4:** Should the first parent to sign up automatically create a family unit and become the admin, or should there be an explicit "Create Family" step? Also, should parents be able to manage multiple families, or is a 1:1 relationship (one parent, one family) sufficient for MVP?

**Answer:** First parent to sign up should be prompted to create a family unit (not automatic, requires explicit action). One parent = one family in MVP (1:1 relationship). This can expand in future phases if needed.

**Q5:** I'm assuming the inviting parent sends an email invitation containing an acceptance link. When the co-parent clicks the link, they either log in (if they have an account) or are directed to create an account before joining the family. Is this the expected flow, or should we support different invitation mechanisms?

**Answer:** Yes, that is the expected flow. Email invitation with acceptance link. Co-parent can either create a new account or log in with existing account.

**Q6:** Should we implement tenant isolation checks at the API route level (middleware guards) and at the database query level (partition keys), ensuring a parent can only access their family's data? Are there specific compliance considerations (GDPR, CCPA) we should design into the system from day one?

**Answer:** Yes, implement isolation checks at both API route level and database query level. Financial records need granular privacy control—some records stay private to the uploader and they choose what to share (amount received or shared expense only). GDPR data deletion is Phase 5, not MVP.

**Q7:** I'm assuming we'll use Auth0's OIDC flow with a custom application configured in Auth0. Should we store Auth0 user IDs in our database to link them to family records, or use a different identifier? Also, should we handle Auth0 user deletion/rules for compliance?

**Answer:** Store Auth0 user IDs in the database to link to family records. Use Auth0's built-in roles feature for Admin Parent and Co-Parent roles.

### Follow-up Questions

**Follow-up 1:** Given that CoParent handles sensitive family information and legal documentation, should email verification be required during signup in MVP to prevent account takeovers?

**Answer:** Email verification can be handled by Auth0's default email verification process. It's built-in and sufficient for MVP.

**Follow-up 2:** For password reset flows, should we implement security questions as an additional verification step, or is email-based verification sufficient for MVP?

**Answer:** Email-based verification is sufficient for MVP. Security questions can be added in future enhancements.

**Follow-up 3:** In the database layer, should we implement tenant isolation at query time (every query filters by family_id) or at connection time (separate connections per tenant)?

**Answer:** Query-time isolation. Every query should filter by family_id. This is more flexible for future features.

**Follow-up 4:** Are there specific scenarios or data types where accidental cross-family access would be especially problematic?

**Answer:** Yes—financial records need granular privacy control. Some expense records stay private to the uploader, and they choose what to share with the co-parent (either the amount received or shared expense details only, not both).

**Follow-up 5:** When a parent deletes their account, should their data be soft-deleted, permanently deleted, or kept for a recovery period?

**Answer:** Parents should ALWAYS be soft-deleted. Their data is retained for audit trails and legal documentation purposes, but marked as inactive.

**Follow-up 6:** Can the "Admin Parent" transfer admin privileges to the co-parent, or is there always one designated admin? What happens if the admin parent leaves?

**Answer:** Admin Parent CAN transfer admin privileges to the co-parent. This ensures the family unit remains intact if the original admin parent leaves.

**Follow-up 7:** Should invitation links expire (e.g., after 7 days) to prevent old links from being exploited? If a link expires, can the inviting parent resend it?

**Answer:** Yes—invitation links should expire after 7 days. Yes—the inviting parent can resend the invitation to generate a fresh link.

**Follow-up 8:** When the inviting parent creates the invitation, should they be able to pre-fill family information (children's names, custody schedule) that the co-parent confirms?

**Answer:** Yes—the inviting parent should pre-fill family information. The co-parent confirms/reviews during onboarding, avoiding duplicate data entry.

**Follow-up 9:** Should we use Auth0's built-in roles feature to manage CoParent roles, or implement our own role system in the database?

**Answer:** Use Auth0's built-in roles feature for Admin Parent and Co-Parent roles. This ensures consistency and simplifies role management.

**Follow-up 10:** Should GDPR data deletion be designed into MVP, or is it a Phase 5 feature?

**Answer:** GDPR data deletion is a Phase 5 feature, not MVP. Soft deletes are sufficient for MVP compliance.

### Existing Code to Reference

No similar existing features identified for reference. This is a foundational, built-from-scratch feature.

## Visual Assets

### Files Provided:
No visual assets provided for this specific feature. User referenced existing Calm Harbor design system and sample designs for other features as style reference.

### Visual Insights:
- UI should follow the Calm Harbor design system (soothing, professional, structured design)
- Design patterns should be consistent with existing CoParent feature designs
- Should prioritize clarity and ease of use for both signup and family setup flows

## Requirements Summary

### Functional Requirements

#### Authentication & User Management
- Implement Auth0 OIDC integration with Google social login enabled
- Support user signup with account creation (email/password or Google authentication)
- Support user login with existing credentials or Google authentication
- Implement password reset via email verification (Auth0 handles this)
- Store Auth0 user IDs in database for identity linking
- Soft-delete users on account deletion (retain data for audit/legal purposes, mark as inactive)

#### Family Unit Management
- Allow first parent to create a family unit (explicit action, not automatic)
- Require family name and initial child information (names, birthdates) during family creation
- Support one family per parent in MVP (1:1 relationship; can expand in future phases)
- Allow admin parent to invite co-parent via email invitation
- Allow admin parent to transfer admin privileges to co-parent if needed

#### Parent Invitation System
- Send email invitation with acceptance link to co-parent email address
- Invitation links expire after 7 days (prevent old link exploitation)
- Support invitation resend by inviting parent (generates new link)
- Allow co-parent to accept by creating new account or logging in with existing account
- Pre-populate family information from inviting parent; co-parent confirms/reviews during onboarding
- Track invitation status (pending, accepted, expired) in database

#### Role-Based Access Control
- Implement two roles in MVP: Admin Parent and Co-Parent using Auth0's built-in roles feature
- Admin Parent: Full access to all family data, can manage co-parent, can invite additional parents
- Co-Parent: Collaborative access to calendar, messages, expenses, and documents (limited admin functions)
- Use Auth0 roles for identity-level role management
- Implement API-level authorization checks for all endpoints

#### Multi-Tenant Data Isolation
- Implement query-time tenant isolation: every database query must filter by family_id
- Implement API route-level guards to ensure parents only access their family's data
- Never expose data from multiple families in a single API response
- Log all cross-family access attempts (security monitoring)

#### Financial Privacy & Granular Controls
- Expense records are created by one parent but may be shared with co-parent
- Creator has granular control over what information is shared:
  - Option 1: Share amount received only (hides expense details)
  - Option 2: Share full shared expense details (both parents contributed)
  - Option 3: Keep private (co-parent cannot see expense)
- Implement privacy flags at the expense record level
- API endpoints must respect privacy flags when returning expense data

### Security & Compliance Requirements

#### Tenant Isolation
- All database queries must include family_id in WHERE clause
- All API endpoints must verify parent belongs to requested family before returning data
- Implement tenant guard middleware at route level
- Implement tenant verification at query/repository level
- Log all authorization failures for security monitoring

#### Data Protection
- Store Auth0 user IDs alongside internal user records
- Use Auth0's security features (OAuth2, JWT tokens)
- Implement HTTPS for all communication
- Sessions stored securely (Auth0 JWT in SessionStorage on frontend)
- Sensitive fields (medical info, financial data) encrypted at rest (Phase 2+)

#### Compliance Notes
- GDPR right-to-be-forgotten: Phase 5 feature (not MVP)
- CCPA compliance: Phase 5 feature (not MVP)
- Soft deletes in MVP enable future compliance features
- Audit logging of role changes and admin transfers built-in for legal records

### Data Model

#### User Entity
```
User {
  id: UUID (internal identifier)
  auth0_id: String (Auth0 user ID, unique)
  email: String (unique)
  name: String
  phone: String (optional)
  avatar_url: String (optional)
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime (null if active, timestamp if soft-deleted)
  is_active: Boolean (default: true, false when soft-deleted)
}
```

#### Family Entity
```
Family {
  id: UUID (internal identifier)
  name: String (e.g., "Chen Family")
  created_at: DateTime
  updated_at: DateTime
  created_by_user_id: UUID (foreign key to User, the parent who created it)
}
```

#### Parent Entity (Join table: User + Family relationship)
```
Parent {
  id: UUID (internal identifier)
  user_id: UUID (foreign key to User)
  family_id: UUID (foreign key to Family)
  role: Enum (ADMIN_PARENT | CO_PARENT) - stored locally, synced from Auth0
  joined_at: DateTime (when parent accepted invitation)
  invited_at: DateTime (when invitation was sent)
  invited_by_user_id: UUID (which parent invited this parent)
  created_at: DateTime
  updated_at: DateTime
  unique_constraint: (user_id, family_id) - one user per family
}
```

#### Invitation Entity
```
Invitation {
  id: UUID (internal identifier)
  family_id: UUID (foreign key to Family)
  inviting_parent_id: UUID (foreign key to Parent, who sent the invitation)
  email: String (email address being invited)
  token: String (unique, URL-safe invitation token)
  status: Enum (PENDING | ACCEPTED | EXPIRED | REVOKED)
  expires_at: DateTime (7 days from creation)
  accepted_at: DateTime (null until accepted)
  accepted_by_user_id: UUID (null until accepted)
  created_at: DateTime
  updated_at: DateTime
  resent_at: DateTime (track invitation resends)
}
```

#### Child Entity (for pre-filled family info)
```
Child {
  id: UUID (internal identifier)
  family_id: UUID (foreign key to Family)
  name: String
  date_of_birth: Date
  created_at: DateTime
  updated_at: DateTime
}
```

#### Expense Entity (with privacy controls)
```
Expense {
  id: UUID (internal identifier)
  family_id: UUID (foreign key to Family)
  created_by_user_id: UUID (foreign key to User, the parent who logged it)
  amount: Decimal
  category: String
  date: Date
  description: String
  receipt_url: String (optional, S3 URL)
  privacy_mode: Enum (PRIVATE | AMOUNT_ONLY | FULL_SHARED)
  created_at: DateTime
  updated_at: DateTime
}
```

### Authentication Flow

#### Step 1: Initial Signup
1. User navigates to login/signup page
2. User clicks "Sign Up" or "Sign Up with Google"
3. Redirected to Auth0 Universal Login
4. User creates account (email/password) or logs in with Google
5. Auth0 issues JWT token (stored in SessionStorage)
6. Frontend receives Auth0 profile (email, name)
7. Frontend calls POST /api/v1/users/register with Auth0 data
8. Backend checks if user exists; if not, creates User record with auth0_id
9. User redirected to Family Creation screen

#### Step 2: Family Creation
1. Parent enters family name and children information (names, birthdates)
2. Submits family creation form
3. Backend creates Family record and initial Child records
4. Backend creates Parent record with role = ADMIN_PARENT
5. Parent redirected to dashboard or invitation screen

#### Step 3: Subsequent Logins
1. User navigates to login page
2. User clicks "Log In" or "Log In with Google"
3. Redirected to Auth0 Universal Login
4. Auth0 authenticates and returns JWT
5. Frontend stores JWT in SessionStorage
6. Frontend calls GET /api/v1/users/me to fetch current user and family
7. Backend verifies JWT with Auth0, returns User and Family data
8. User dashboard loads with family context

#### Step 4: Password Reset
1. User clicks "Forgot Password" on login page
2. Auth0 handles password reset flow (email verification)
3. User receives password reset email from Auth0
4. User clicks link, sets new password in Auth0
5. User can then log in with new password

### Parent Invitation Flow

#### Step 1: Initiate Invitation
1. Admin Parent navigates to "Invite Co-Parent" screen
2. Admin Parent reviews pre-filled family information (children, names, birthdates)
3. Admin Parent enters co-parent email address
4. Admin Parent optionally customizes message/note
5. Submits invitation
6. Backend creates Invitation record with:
   - token: unique, URL-safe (e.g., URL-safe base64 encoded UUID)
   - status: PENDING
   - expires_at: 7 days from now
   - inviting_parent_id: current admin parent
7. Backend sends email to co-parent with invitation link: `{FRONTEND_URL}/invite/{token}`
8. Admin Parent sees confirmation: "Invitation sent to [email]"

#### Step 2: Co-Parent Receives Invitation
1. Co-parent receives email with invitation link
2. Co-parent clicks link in email
3. Frontend extracts token from URL, calls GET /api/v1/invitations/{token}/preview
4. Backend validates token (exists, not expired, status=PENDING)
5. Backend returns invitation data + pre-filled family information
6. Frontend displays: "You're invited to join [Family Name] family"
7. Shows: children names, birthdates, invitation message
8. Shows two options: "Create Account" or "Log In"

#### Step 3a: Co-Parent Creates New Account
1. Co-parent clicks "Create Account"
2. Redirected to Auth0 signup flow with email pre-filled
3. Co-parent creates account or signs in with Google
4. Auth0 issues JWT token
5. Frontend receives Auth0 profile
6. Frontend calls POST /api/v1/users/register (similar to initial signup)
7. Backend creates User record with auth0_id
8. Frontend calls POST /api/v1/invitations/{token}/accept
9. Proceed to Step 4 (below)

#### Step 3b: Co-Parent Logs In with Existing Account
1. Co-parent clicks "Log In"
2. Redirected to Auth0 login flow
3. Co-parent logs in with email/password or Google
4. Auth0 issues JWT token
5. Frontend receives JWT, stores in SessionStorage
6. Frontend calls POST /api/v1/invitations/{token}/accept
7. Proceed to Step 4 (below)

#### Step 4: Accept Invitation
1. Backend receives POST /api/v1/invitations/{token}/accept request
2. Backend validates:
   - Token exists and is valid
   - Not expired (expires_at > now)
   - Status = PENDING
   - Requesting user's email matches invitation email
3. Backend updates Invitation record:
   - status: ACCEPTED
   - accepted_at: current timestamp
   - accepted_by_user_id: current user
4. Backend creates Parent record:
   - user_id: current user
   - family_id: from invitation
   - role: CO_PARENT
   - joined_at: current timestamp
   - invited_by_user_id: inviting parent ID
5. Backend syncs role to Auth0 (adds CO_PARENT role to user in Auth0)
6. Frontend redirects to onboarding: co-parent reviews/confirms family info
7. After confirmation, both parents are active in family

#### Step 5: Invitation Resend (if link expires)
1. Admin Parent views pending invitations
2. Sees expired invitations with "Resend" button
3. Clicks "Resend"
4. Backend creates new Invitation record (same email, new token, new expiration)
5. Backend sends new email with updated invitation link
6. Previous Invitation record status updated to EXPIRED or REVOKED
7. Admin Parent sees confirmation: "Resent invitation to [email]"

### MVP Scope vs Future Phases

#### MVP Scope (Phase 1)
- Auth0 OIDC integration with Google social login
- Email/password signup and login
- Email-based password reset
- Family unit creation (one per parent)
- Two roles: Admin Parent, Co-Parent
- Parent invitation system with 7-day expiring links
- Query-time tenant isolation with family_id partition key
- API route-level authorization guards
- Financial privacy controls (granular sharing options)
- Auth0 built-in roles feature
- Soft delete for parent accounts
- Invitation resend functionality
- Admin parent can transfer admin privileges

#### Phase 2+ Future Enhancements
- Optional 2FA (TOTP authenticator apps)
- Security questions for password reset
- Encryption at rest for sensitive fields
- Multiple families per parent (1:N relationship)
- Additional roles (step-parents, grandparents, read-only access)
- Advanced permission granularity
- Bank integration with Auth0
- Session management and device tracking
- Login history and activity logs

#### Phase 5+ Future Enhancements
- GDPR data deletion (right-to-be-forgotten)
- CCPA compliance features
- Advanced data residency options
- Comprehensive audit logging with export
- Compliance certification (SOC 2, HIPAA-ready)

### Technical Constraints & Considerations

#### Auth0 Configuration
- Create Auth0 application for CoParent
- Configure callback URLs: `{FRONTEND_URL}/callback`, `{FRONTEND_URL}/login`
- Configure logout URL: `{FRONTEND_URL}/logout`
- Enable Google authentication in Auth0 (social connection)
- Define Auth0 roles: ADMIN_PARENT, CO_PARENT
- Configure custom claims if needed (family_id in JWT)
- Store Auth0 domain, client ID, client secret in environment variables

#### Database Constraints
- Add composite index on (family_id, user_id) for Parent lookups
- Add index on Invitation.token for fast token lookups
- Add index on Invitation.expires_at for expiration checks
- Add index on Invitation.status for pending invitation queries
- Add index on User.auth0_id for Auth0 ID lookups
- Add composite unique constraint on (user_id, family_id) for Parent table

#### API Design
- All endpoints require JWT authentication (Bearer token)
- All endpoints must validate family_id context (from JWT or request)
- All responses must be filtered by family_id at repository level
- POST /api/v1/users/register: Create user from Auth0 data
- GET /api/v1/users/me: Get current user and family context
- POST /api/v1/families: Create family unit
- POST /api/v1/invitations: Create and send invitation
- GET /api/v1/invitations/{token}/preview: Preview invitation (no auth required)
- POST /api/v1/invitations/{token}/accept: Accept invitation
- POST /api/v1/invitations/{id}/resend: Resend expired invitation
- PUT /api/v1/families/{id}/transfer-admin: Transfer admin role

#### Frontend Considerations
- Auth0 JWT stored in SessionStorage (not LocalStorage for security)
- Implement route guards to prevent unauthenticated access
- Implement family context provider (Zustand store) to manage current family
- All API calls must include family_id in headers or request body
- Implement invitation link parsing and preview before signup
- Handle invitation expiration with user-friendly messaging
- Implement loading states during Auth0 redirects

#### Email Requirements
- Invitation emails should include:
  - Family name
  - Children information (names)
  - Invitation link with token (expires in 7 days)
  - Message from inviting parent (optional)
  - CTA button: "Accept Invitation"
- Email template should match Calm Harbor design system
- Use backend email service (Brevo/SES) for sending

#### Error Handling & Edge Cases
- Handle expired invitation links gracefully (show "Link expired" with resend option)
- Handle invalid tokens (404 or 400)
- Handle user already in family (prevent duplicate parent records)
- Handle Auth0 failures during signup/login (show error message)
- Handle network failures during invitation acceptance (retry capability)
- Prevent user from inviting themselves
- Prevent duplicate invitations to same email

#### Logging & Monitoring
- Log all invitation creation, acceptance, and expiration
- Log all role changes and admin transfers
- Log all soft delete operations
- Log all cross-family access attempts
- Monitor Auth0 integration for authentication failures
- Monitor invitation acceptance rates (metrics)
