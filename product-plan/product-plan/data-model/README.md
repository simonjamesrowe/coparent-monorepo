# Data Model

## Entities

- **Family** — A co-parenting unit containing two parents and their shared children. The top-level container for all family data.
- **Parent** — A user of the system, either the primary or secondary caregiver. Has authentication credentials, profile information, and notification preferences.
- **Child** — A child being co-parented, with their own calendar events, expenses, documents, and timeline. Contains basic info like name and birthdate.
- **Event** — A calendar entry representing a custody period, activity, appointment, or important date. Can be one-time or recurring.
- **Message** — A communication between parents with threading support. All messages are timestamped and logged for record-keeping.
- **PermissionRequest** — A formal request for approval on decisions like activities, schedule exceptions, or special purchases. Has a status (pending, approved, denied) and resolution history.
- **Expense** — A tracked cost with category, amount, date, description, and optional receipt. Supports reimbursement workflow with approval status.
- **Document** — A stored file such as a medical record, school document, vaccination record, or emergency contact information. Includes metadata like upload date and document type.
- **Milestone** — A timestamped entry in the evidence timeline documenting achievements, behavioral observations, health developments, or photos. Entries are immutable for legal integrity.
- **AuditEntry** — An immutable record of changes to any entity. Stores the entity type, entity ID, action (create/update/delete), timestamp, acting parent, and before/after diffs as JSON.

## Relationships

- Family has many Parents (exactly two)
- Family has many Children
- Child belongs to Family
- Event belongs to Family (optionally linked to a specific Child)
- Message belongs to Family, sent by one Parent
- PermissionRequest belongs to Family, created by one Parent, resolved by the other
- Expense belongs to Family (optionally linked to a specific Child), created by one Parent
- Document belongs to Family (optionally linked to a specific Child)
- Milestone belongs to Child, created by one Parent
- AuditEntry references any entity by type and ID
