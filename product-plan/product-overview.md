# CoParent — Product Overview

## Summary

CoParent is a unified digital platform that helps separated and divorced parents coordinate parenting responsibilities, manage shared expenses, and maintain clear communication—reducing conflict, building trust, and creating a legally sound record of their co-parenting relationship.

### Problems Solved

**Problem 1: Fragmented Communication Creates Conflict and Legal Risk**
A dedicated, professional communication channel with structured workflows (permissions, approvals, requests) that maintains a timestamped, immutable record of all discussions and decisions.

**Problem 2: Financial Opacity Prevents Trust and Fair Contribution**
A comprehensive expense tracking system with receipt uploads, budget visibility, automatic reimbursement requests, and optional bank integration—ensuring financial transparency builds trust rather than destroying it.

**Problem 3: Missing Documentation Hurts Legal Standing**
A secure, organized information repository where medical records, school documents, emergency contacts, and important life events are stored, timestamped, and easily accessible to both parents.

### Key Features

- Parent-to-Parent Messaging with threading and permanent records
- Shared Calendar Management with custody schedules
- Permission Request Workflow for formal approvals
- Expense Tracking & Reimbursement with receipt uploads
- Information Repository for medical/school records
- Evidence Timeline for documented milestones
- Photo Sharing for family connection
- Multi-Child Support

## Planned Sections

1. **Calendar & Scheduling** — Shared calendar for custody schedules, activities, appointments, and important dates with real-time sync between parents.
2. **Messaging & Permissions** — Professional parent-to-parent communication with threading, plus formal permission request workflows for approvals and decisions.
3. **Expenses & Finances** — Expense tracking with receipt uploads, reimbursement requests, approval workflows, and spending analytics.
4. **Information Repository** — Centralized storage for medical records, school documents, emergency contacts, and critical family information.
5. **Timeline & Photos** — Chronological evidence timeline documenting milestones and achievements, plus private family photo albums.
6. **User Signup & Family Management** — Account creation, child profile setup, family roles, and invite flow to bring a non-registered co-parent into the platform.

## Data Model

**Core Entities:**
- **Family** — A co-parenting unit containing two parents and their shared children
- **Parent** — A user of the system with authentication credentials and profile information
- **Child** — A child being co-parented with calendar events, expenses, documents, and timeline
- **Event** — A calendar entry for custody periods, activities, appointments, or important dates
- **Message** — Communication between parents with threading support
- **PermissionRequest** — Formal request for approval on decisions
- **Expense** — Tracked cost with category, amount, and optional receipt
- **Document** — Stored file (medical records, school documents, etc.)
- **Milestone** — Timestamped entry in the evidence timeline
- **AuditEntry** — Immutable record of changes to any entity

**Note:** This product uses MongoDB (document database), not a relational database.

See `data-model/README.md` for detailed entity descriptions and relationships.

## Design System

**Colors:**
- Primary: `teal` — Used for buttons, links, key accents
- Secondary: `rose` — Used for notifications and alerts
- Neutral: `slate` — Used for backgrounds, text, and borders

**Typography:**
- Heading: Inter
- Body: Inter
- Mono: IBM Plex Mono

**Aesthetic:** "Calm Harbor" — Professional, trustworthy, and calming design that reduces stress and conflict.

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing structure, and application shell
2. **Calendar & Scheduling** — Shared calendar with custody schedules and event management
3. **User Signup & Family Management** — Onboarding wizard and family setup hub
4. **Messaging & Permissions** — Parent communication and permission request workflows *(Not yet designed)*
5. **Expenses & Finances** — Expense tracking and reimbursement system *(Not yet designed)*
6. **Information Repository** — Document storage and organization *(Not yet designed)*
7. **Timeline & Photos** — Evidence timeline and photo sharing *(Not yet designed)*

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.

**Note:** Only milestones 1-3 have been designed and are ready for implementation. The remaining sections are planned but do not yet have screen designs or components.
