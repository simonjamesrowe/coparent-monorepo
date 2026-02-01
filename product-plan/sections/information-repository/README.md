# Information Repository

## Overview

A centralized repository for storing critical family information organized by child. Parents can manage medical records, school documents, and emergency contacts with full file attachment support. Both parents have equal access to view, add, and edit all stored information.

## User Flows

- View dashboard showing all children with quick stats (document counts, recent updates)
- Select a child to see their categories (Medical, School, Emergency Contacts)
- Browse items within a category and view details
- Add new records with text fields and file attachments
- Edit or delete existing records
- Add/edit emergency contacts with name, phone, relationship, address, email, and notes

## Design Decisions

- Dashboard view with child cards showing quick stats per category
- Child detail view with category navigation (Medical, School, Contacts)
- List view for items within each category
- Detail/edit modal or page for individual records
- File upload component supporting common document types (PDF, images)
- Emergency contact cards with key info displayed at a glance

## Data Used

**Entities:** Family, ChildCategoryStats, Child, DocumentFile, Attachment, Document, EmergencyContact, CategorySummary

**From global model:** Family, Child, Document

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `ChildCard` — Supporting UI component
- `ChildDetail` — Supporting UI component
- `DocumentDetail` — Supporting UI component
- `DocumentRow` — Supporting UI component
- `EmergencyContactCard` — Supporting UI component
- `RepositoryDashboard` — Primary dashboard view

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSelectChild` | Called when a child is selected from the dashboard |
| `onSelectCategory` | Called when a category is selected for a child |
| `onViewDocument` | Called when a document is opened for viewing |
| `onCreateDocument` | Called when a new document is created |
| `onEditDocument` | Called when a document is edited |
| `onDeleteDocument` | Called when a document is deleted |
| `onUploadDocumentFile` | Called when a user uploads or replaces a document file |
| `onCreateContact` | Called when a new emergency contact is added |
| `onEditContact` | Called when an emergency contact is edited |
| `onDeleteContact` | Called when an emergency contact is deleted |
