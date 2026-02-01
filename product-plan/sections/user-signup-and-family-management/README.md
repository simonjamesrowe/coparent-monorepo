# User Signup & Family Management

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

## User Flows

- Complete onboarding wizard: create account → create family → add child profile → invite co-parent → review & finish.
- View family setup hub with cards for Family, Children, Invitations, and Roles.
- Manage invites: send, resend, or cancel a co-parent invitation and see status badges.
- Add or edit child profile details from the setup hub.
- Assign roles (Primary Parent, Co-parent) during invite or setup.

## Design Decisions

- Multi-step onboarding wizard with stepper progress.
- Card-based family setup hub with clear CTAs and empty states.
- Child profile form with required name + DOB, optional school and medical notes.
- Invitation form supports email only; show pending/accepted/expired status.
- Role selector limited to Primary Parent and Co-parent.

## Data Used

**Entities:** Family, Parent, Child, Invitation, OnboardingState

**From global model:** Family, Parent, Child

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `FamilySetupHub` — Supporting UI component
- `OnboardingWizard` — Multi-step onboarding flow

## Callback Props

| Callback | Description |
|----------|-------------|
| `onCreateAccount` | Called when user begins account creation |
| `onCreateFamily` | Called when user creates a family during onboarding |
| `onUpdateFamily` | Called when user edits family details |
| `onAddChild` | Called when user adds a child profile |
| `onUpdateChild` | Called when user edits a child profile |
| `onInviteCoParent` | Called when user sends an invitation to a co-parent |
| `onResendInvite` | Called when user resends an invitation |
| `onCancelInvite` | Called when user cancels an invitation |
| `onAssignRole` | Called when user assigns or changes a parent role |
| `onCompleteOnboarding` | Called when onboarding is completed |
| `onSelectFamily` | Called when user switches the active family |
