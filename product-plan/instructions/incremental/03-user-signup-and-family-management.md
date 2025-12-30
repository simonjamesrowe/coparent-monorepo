# Milestone 3: User Signup & Family Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

## Goal

Implement the User Signup & Family Management feature — account creation and family setup, guiding a parent through creating a family, adding child profiles, and inviting a co-parent.

## Overview

This section covers initial account creation and family setup, providing a guided onboarding wizard that walks new users through the essential setup steps: creating a family, adding child profiles, and inviting their co-parent. After onboarding, a family setup hub allows users to review, manage, and edit their family configuration, invitations, and roles.

**Key Functionality:**
- Complete multi-step onboarding wizard (account → family → child → invite → review)
- View family setup hub with cards for Family, Children, Invitations, and Roles
- Manage co-parent invitations (send, resend, cancel) with status tracking
- Add, view, and edit child profile details
- Assign parent roles (Primary Parent, Co-parent)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/user-signup-and-family-management/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/user-signup-and-family-management/components/`:

- `OnboardingWizard.tsx` — Multi-step wizard for new user onboarding
- `FamilySetupHub.tsx` — Dashboard for managing family setup after onboarding

### Data Layer

The components expect these data shapes:

**Family:**
- `id`, `name`, `timeZone`
- `parentIds`, `childIds`, `invitationIds`
- `createdAt`

**Parent:**
- `id`, `familyId`, `fullName`, `email`
- `role` (primary | co-parent), `status` (active)
- `lastSignedInAt`

**Child:**
- `id`, `familyId`, `fullName`, `dateOfBirth`
- `school` (optional), `medicalNotes` (optional)

**Invitation:**
- `id`, `familyId`, `email`, `role`
- `status` (pending | accepted | expired | canceled)
- `sentAt`, `expiresAt`, `acceptedAt`, `canceledAt`

**OnboardingState:**
- `id`, `familyId`, `currentStep`, `completedSteps`
- `isComplete`, `lastUpdated`

You'll need to:
- Create MongoDB schemas/models for these entities
- Create API endpoints for family, parent, child, invitation CRUD
- Implement invitation workflow (send, accept, expire, cancel)
- Track onboarding progress per family
- Handle email delivery for invitations

### Callbacks

Wire up these user actions:

**Account & Family Actions:**
- `onCreateAccount()` — Create user account (may trigger auth flow)
- `onCreateFamily(name, timeZone)` — Create family during onboarding
- `onUpdateFamily(id, updates)` — Edit family details in hub
- `onSelectFamily(familyId)` — Switch active family (if multi-family support)

**Child Profile Actions:**
- `onAddChild(child)` — Add new child profile
- `onUpdateChild(id, updates)` — Edit child profile

**Invitation Actions:**
- `onInviteCoParent(familyId, email, role)` — Send invitation
- `onResendInvite(invitationId)` — Resend invitation email
- `onCancelInvite(invitationId)` — Cancel pending invitation

**Role Actions:**
- `onAssignRole(parentId, role)` — Assign or change parent role

**Onboarding Actions:**
- `onCompleteOnboarding(familyId)` — Mark onboarding as complete

### Props

The components use a `mode` prop to determine which view to show:
- `mode="wizard"` — Show onboarding wizard for new users
- `mode="hub"` — Show family setup hub for existing users

Route new users to the wizard, and route existing users to the hub.

### Empty States

Implement empty state UI for when no records exist yet:

- **No children yet:** Show "Add your first child" CTA in the hub
- **No invitations yet:** Show "Invite your co-parent" CTA
- **Invitation expired:** Show "Resend Invitation" option
- **First-time user:** The wizard guides them through each step with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Complete Onboarding Wizard

1. User creates an account (authentication handled separately)
2. **Step 1 - Family:** User enters family name and selects time zone
3. **Step 2 - Child:** User adds first child (name, date of birth, optional school/medical notes)
4. **Step 3 - Invite:** User enters co-parent's email and assigns role
5. **Step 4 - Review:** User reviews setup and clicks "Complete Setup"
6. **Outcome:** Family created, child profile added, invitation sent, user redirected to main app

### Flow 2: Add a Child Profile in Family Setup Hub

1. User navigates to Family Setup Hub
2. User clicks "Add Child" button in Children card
3. User fills in child's name, date of birth
4. User optionally adds school name and medical notes
5. User clicks "Save"
6. **Outcome:** New child appears in Children list in hub

### Flow 3: Send Co-parent Invitation

1. User is in Family Setup Hub
2. User clicks "Invite Co-parent" button in Invitations card
3. User enters co-parent's email address
4. User selects role (Primary Parent or Co-parent)
5. User clicks "Send Invitation"
6. **Outcome:** Invitation created with "Pending" status, email sent to co-parent

### Flow 4: Resend Expired Invitation

1. User sees invitation with "Expired" status in hub
2. User clicks "Resend" button
3. **Outcome:** New invitation sent, status changes to "Pending", expiration date updated

### Flow 5: Cancel Pending Invitation

1. User sees invitation with "Pending" status in hub
2. User clicks "Cancel" button
3. User confirms cancellation
4. **Outcome:** Invitation status changes to "Canceled", removed from active invitations list

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data from MongoDB
- [ ] Empty states display properly when no children/invitations exist
- [ ] Onboarding wizard completes all steps successfully
- [ ] New users are directed to wizard, existing users to hub
- [ ] Family can be created and edited
- [ ] Child profiles can be added and edited
- [ ] Invitations can be sent, resent, and canceled
- [ ] Invitation status is tracked correctly (pending, accepted, expired, canceled)
- [ ] Email invitations are sent to co-parent
- [ ] Roles can be assigned to parents
- [ ] Onboarding progress is tracked
- [ ] User is redirected to main app after completing onboarding
- [ ] Matches the visual design
- [ ] Responsive on mobile, tablet, and desktop
