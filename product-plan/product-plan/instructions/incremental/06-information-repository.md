# Milestone 6: Information Repository

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, plus any prior section milestones

## Goal

Implement the Information Repository feature — Centralized storage for medical records, school documents, emergency contacts, and critical family information.

## Overview

A centralized repository for storing critical family information organized by child. Parents can manage medical records, school documents, and emergency contacts with full file attachment support. Both parents have equal access to view, add, and edit all stored information.

**Key Functionality:**

- View dashboard showing all children with quick stats (document counts, recent updates)
- Select a child to see their categories (Medical, School, Emergency Contacts)
- Browse items within a category and view details
- Add new records with text fields and file attachments
- Edit or delete existing records
- Add/edit emergency contacts with name, phone, relationship, address, email, and notes

## Recommended Approach: Test-Driven Development

See `product-plan/sections/information-repository/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/information-repository/components/`:

- `ChildCard`
- `ChildDetail`
- `DocumentDetail`
- `DocumentRow`
- `EmergencyContactCard`
- `RepositoryDashboard`

### Data Layer

The components expect these data shapes:

- Family, ChildCategoryStats, Child, DocumentFile, Attachment, Document, EmergencyContact, CategorySummary

### Callbacks

Wire up these user actions:

- `onSelectChild` — Called when a child is selected from the dashboard
- `onSelectCategory` — Called when a category is selected for a child
- `onViewDocument` — Called when a document is opened for viewing
- `onCreateDocument` — Called when a new document is created
- `onEditDocument` — Called when a document is edited
- `onDeleteDocument` — Called when a document is deleted
- `onUploadDocumentFile` — Called when a user uploads or replaces a document file
- `onCreateContact` — Called when a new emergency contact is added
- `onEditContact` — Called when an emergency contact is edited
- `onDeleteContact` — Called when an emergency contact is deleted

### Empty States

Implement empty state UI for when no records exist yet.

## Files to Reference

- `product-plan/sections/information-repository/README.md` — Feature overview and design intent
- `product-plan/sections/information-repository/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/information-repository/components/` — React components
- `product-plan/sections/information-repository/types.ts` — TypeScript interfaces
- `product-plan/sections/information-repository/sample-data.json` — Test data
- `product-plan/sections/information-repository/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View dashboard showing all children with quick stats (document counts, recent updates)

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 2: Select a child to see their categories (Medical, School, Emergency Contacts)

1. User initiates the flow
2. User completes the required inputs
3. User confirms the action
4. **Outcome:** UI updates and data is saved

### Flow 3: Browse items within a category and view details

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
