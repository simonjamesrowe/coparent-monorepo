# Milestone 7: User Signup & Family Management

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the User Signup & Family Management feature — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

**Key Functionality:**

- Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.
- View family setup hub with cards for Family, Children, Invitations, and Roles.
- Manage invites: send, resend, or cancel a co-parent invitation and see status badges.
- Add or edit child profile details from the setup hub.
- Assign roles (Primary Parent, Co-parent) during invite or setup.

## Recommended Approach: Test-Driven Development

See `product-plan/sections/user-signup-and-family-management/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/user-signup-and-family-management/components/`:

- `FamilySetupHub`
- `OnboardingWizard`

### Data Layer

The components expect these data shapes:

- Family, Parent, Child, Invitation, OnboardingState

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

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/user-signup-and-family-management/README.md` — Feature overview and design intent
- `product-plan/sections/user-signup-and-family-management/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/user-signup-and-family-management/components/` — React components
- `product-plan/sections/user-signup-and-family-management/types.ts` — TypeScript interfaces
- `product-plan/sections/user-signup-and-family-management/sample-data.json` — Test data
- `product-plan/sections/user-signup-and-family-management/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: View family setup hub with cards for Family, Children, Invitations, and Roles.

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Manage invites: send, resend, or cancel a co-parent invitation and see status badges.

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
