# User Signup & Family Management

## Overview

This section covers initial account creation and family setup, guiding a parent through creating a family, adding a child profile, and inviting a co-parent. After onboarding, a family setup hub summarizes key entities and invitation status so users can complete or revise setup details.

## User Flows

1. **Complete onboarding wizard:** create account → create family → add child profile → invite co-parent → review & finish
2. **View family setup hub** with cards for Family, Children, Invitations, and Roles
3. **Manage invites:** send, resend, or cancel a co-parent invitation and see status badges
4. **Add or edit child profile details** from the setup hub
5. **Assign roles** (Primary Parent, Co-parent) during invite or setup

## Design Decisions

**Wizard Pattern:** The onboarding wizard uses a stepped progress indicator to show users where they are in the setup process. Each step is focused on a single task to avoid overwhelming new users.

**Hub for Post-Onboarding:** After completing the wizard, users can return to the Family Setup Hub to make changes, add more children, manage invitations, etc. This separates the linear first-time flow from the flexible management interface.

**Invitation Status:** Clear status badges (Pending, Accepted, Expired, Canceled) help users track invitation state. Expired invitations show a "Resend" action, making it easy to re-invite.

**Roles:** Limited to two roles (Primary Parent, Co-parent) to keep things simple. Roles can be assigned during invitation or edited later.

**Empty States:** The hub shows helpful empty states when no children or invitations exist yet, with prominent CTAs to add them.

## Data Used

**Entities:**
- Family (name, timezone, parent/child IDs)
- Parent (user with role and status)
- Child (profile with name, DOB, school, medical notes)
- Invitation (email, role, status, timestamps)
- OnboardingState (tracks wizard progress)

**From global model:** Family, Parent, Child (from data-model)

## Visual Reference

No screenshots were captured for this section yet — the components provide the visual reference.

## Components Provided

- `OnboardingWizard` — Multi-step wizard for new user onboarding
- `FamilySetupHub` — Dashboard for managing family setup after onboarding

## Callback Props

| Callback | Description |
|----------|-------------|
| `onCreateAccount` | Called when user creates account (may trigger auth flow) |
| `onCreateFamily` | Called when user creates family during onboarding |
| `onUpdateFamily` | Called when user edits family details in hub |
| `onSelectFamily` | Called when user switches active family |
| `onAddChild` | Called when user adds new child profile |
| `onUpdateChild` | Called when user edits child profile |
| `onInviteCoParent` | Called when user sends co-parent invitation |
| `onResendInvite` | Called when user resends invitation email |
| `onCancelInvite` | Called when user cancels pending invitation |
| `onAssignRole` | Called when user assigns or changes parent role |
| `onCompleteOnboarding` | Called when onboarding wizard is completed |
