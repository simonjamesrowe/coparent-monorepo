# Milestone 4: User Signup & Family Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the User Signup & Family Management feature — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform..

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

**Key Functionality:**
- Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.
- View family setup hub with cards for Family, Children, Invitations, and Roles.
- Manage invites: send, resend, or cancel a co-parent invitation and see status badges.
- Add or edit child profile details from the setup hub.
- Assign roles (Primary Parent, Co-parent) during invite or setup.

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

- `FamilySetupHub`
- `OnboardingWizard`

### Data Layer

The components expect these data shapes:

ParentRole, ParentStatus, InvitationStatus, OnboardingStep, Family, Parent, Child, Invitation, OnboardingState

You'll need to:
- Create API endpoints or data fetching logic
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onCreateAccount` — Called when user begins account creation
- `onCreateFamily` — Called when user creates a family during onboarding
- `onUpdateFamily` — Called when user edits family details
- `onAddChild` — Called when user adds a child profile
- `onUpdateChild` — Called when user edits a child profile
- `onInviteCoParent` — Called when user sends an invitation to a co-parent
- `onResendInvite` — Called when user resends an invitation
- `onCancelInvite` — Called when user cancels an invitation
- `onAssignRole` — Called when user assigns or changes a parent role
- `onCompleteOnboarding` — Called when onboarding is completed
- `onSelectFamily` — Called when user switches the active family

### Empty States

Implement empty state UI for when no records exist yet:

- **No data yet:** Show a helpful message and call-to-action when the primary list/collection is empty
- **No related records:** Handle cases where associated records don't exist (e.g., a project with no tasks)
- **First-time user experience:** Guide users to create their first item with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data
- `product-plan/sections/user-signup-and-family-management/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Complete Onboarding Wizard

1. User fills **Full Name**, **Email Address**, **Password**
2. User clicks **“Create Account”**, then **“Continue”**
3. User adds a child and clicks **“Add Child”** then **“Continue”**
4. User sends invite or chooses **“Skip for now”**
5. User clicks **“Complete Setup”**
6. **Outcome:** Onboarding completes

### Flow 2: Manage Invitations

1. User visits **Co-Parent Invitations**
2. User clicks **“Resend”** or **“Cancel”**
3. **Outcome:** Invitation status updates


## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
