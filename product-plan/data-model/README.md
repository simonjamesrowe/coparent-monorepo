# CoParent Data Model

> **Note:** This product uses MongoDB (document database), not a relational database.

## Core Entities

### Family
A co-parenting unit containing two parents and their shared children. The top-level container for all family data.

**Key Fields:**
- `id`, `name`, `timeZone`
- `parentIds` (array of parent IDs)
- `childIds` (array of child IDs)
- `invitationIds` (array of invitation IDs)
- `createdAt`

### Parent
A user of the system, either the primary or secondary caregiver. Has authentication credentials, profile information, and notification preferences.

**Key Fields:**
- `id`, `familyId`, `fullName`, `email`
- `role` (primary | co-parent)
- `status` (active)
- `color` (for calendar color-coding)
- `avatarUrl`
- `lastSignedInAt`

### Child
A child being co-parented, with their own calendar events, expenses, documents, and timeline. Contains basic info like name and birthdate.

**Key Fields:**
- `id`, `familyId`, `fullName`, `dateOfBirth`
- `school` (optional)
- `medicalNotes` (optional)
- `avatarUrl`

### Event
A calendar entry representing a custody period, activity, appointment, or important date. Can be one-time or recurring.

**Key Fields:**
- `id`, `type` (custody | activity | medical | school | holiday)
- `title`, `startDate`, `endDate`, `startTime`, `endTime`, `allDay`
- `parentId` (which parent "owns" this event)
- `childIds` (array of child IDs this event applies to)
- `categoryId`, `location`, `notes`
- `recurring` (optional pattern: frequency, days)

### EventCategory
System or custom category for events (e.g., "Soccer Practice", "Therapy").

**Key Fields:**
- `id`, `name`, `icon`, `color`
- `isDefault` (system-provided category)
- `isSystem` (cannot be deleted)

### Message
A communication between parents with threading support. All messages are timestamped and logged for record-keeping.

**Key Fields:**
- `id`, `familyId`, `senderId`, `recipientId`
- `threadId` (for threading)
- `subject`, `body`
- `sentAt`, `readAt`

### PermissionRequest
A formal request for approval on decisions like activities, schedule exceptions, or special purchases. Has a status (pending, approved, denied) and resolution history.

**Key Fields:**
- `id`, `familyId`, `requestedBy`, `requestType`
- `status` (pending | approved | declined)
- `requestDetails`, `reason`
- `resolvedBy`, `resolvedAt`, `responseNote`

### ScheduleChangeRequest
A specific type of request for changing existing custody schedules.

**Key Fields:**
- `id`, `familyId`, `originalEventId`
- `status` (pending | approved | declined)
- `requestedBy`, `requestedAt`
- `proposedChange` (type, original dates, new dates)
- `reason`, `responseNote`
- `resolvedBy`, `resolvedAt`

### Expense
A tracked cost with category, amount, date, description, and optional receipt. Supports reimbursement workflow with approval status.

**Key Fields:**
- `id`, `familyId`, `childIds`, `amount`, `category`
- `description`, `date`, `receiptUrl`
- `paidBy`, `splitWith`
- `reimbursementStatus` (pending | approved | paid)

### Document
A stored file such as a medical record, school document, vaccination record, or emergency contact information. Includes metadata like upload date and document type.

**Key Fields:**
- `id`, `familyId`, `childIds`, `documentType`
- `title`, `fileUrl`, `uploadedBy`, `uploadedAt`
- `tags`

### Milestone
A timestamped entry in the evidence timeline documenting achievements, behavioral observations, health developments, or photos. Entries are immutable for legal integrity.

**Key Fields:**
- `id`, `familyId`, `childId`
- `type` (achievement | behavior | health | photo)
- `title`, `description`, `date`
- `createdBy`, `createdAt`
- `attachments` (photos, documents)

### Invitation
Invitation sent to a co-parent to join the platform.

**Key Fields:**
- `id`, `familyId`, `email`, `role`
- `status` (pending | accepted | expired | canceled)
- `sentAt`, `expiresAt`, `acceptedAt`, `canceledAt`

### OnboardingState
Tracks onboarding progress for each family.

**Key Fields:**
- `id`, `familyId`, `currentStep`, `completedSteps`
- `isComplete`, `lastUpdated`

### AuditEntry
An immutable record of changes to any entity. Stores the entity type, entity ID, action (create/update/delete), timestamp, acting parent, and before/after diffs as JSON.

**Key Fields:**
- `id`, `entityType`, `entityId`, `action`
- `actorId`, `timestamp`
- `before` (JSON), `after` (JSON)

## Relationships

- **Family** has many **Parents** (exactly two)
- **Family** has many **Children**
- **Family** has many **Invitations**
- **Child** belongs to **Family**
- **Event** belongs to **Family** (optionally linked to specific Children)
- **Message** belongs to **Family**, sent by one Parent
- **PermissionRequest** belongs to **Family**, created by one Parent, resolved by the other
- **ScheduleChangeRequest** belongs to **Family**, references an Event
- **Expense** belongs to **Family** (optionally linked to specific Children), created by one Parent
- **Document** belongs to **Family** (optionally linked to specific Children)
- **Milestone** belongs to **Child**, created by one Parent
- **AuditEntry** references any entity by type and ID

## Implementation Notes

- Use MongoDB schemas/models for all entities
- Implement proper indexes for frequently queried fields (familyId, parentId, childId, status, dates)
- Timestamps should use ISO 8601 format
- IDs should be MongoDB ObjectIds or UUIDs
- Soft deletes recommended for most entities (use `deletedAt` field)
- AuditEntry provides immutable change log for legal compliance
