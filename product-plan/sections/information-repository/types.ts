// =============================================================================
// Data Types
// =============================================================================

export interface Family {
  id: string
  name: string
  primaryParentId: string
  secondaryParentId: string
}

export interface ChildCategoryStats {
  medicalCount: number
  schoolCount: number
  contactCount: number
  lastUpdatedAt: string
}

export interface Child {
  id: string
  familyId: string
  name: string
  birthdate: string
  avatarUrl: string
  categoryStats: ChildCategoryStats
  recentDocumentIds: string[]
}

export type DocumentCategory = 'medical' | 'school'

export type DocumentType =
  | 'medical-record'
  | 'immunization'
  | 'school-plan'
  | 'school-report'
  | 'emergency-plan'

export interface DocumentFile {
  fileName: string
  fileType: string
  fileSizeKb: number
  fileUrl: string
}

export interface Attachment {
  id: string
  label: string
  fileName: string
  fileType: string
  fileSizeKb: number
  fileUrl: string
}

export interface Document {
  id: string
  familyId: string
  childId: string
  category: DocumentCategory
  title: string
  documentType: DocumentType
  description: string
  provider: string
  dateOfService: string
  uploadedAt: string
  updatedAt: string
  file: DocumentFile
  tags: string[]
  attachments: Attachment[]
}

export interface EmergencyContact {
  id: string
  familyId: string
  childId: string
  name: string
  relationship: string
  phone: string
  email: string
  address: string
  notes: string
  isPrimary: boolean
  updatedAt: string
}

export type RepositoryCategory = 'medical' | 'school' | 'contacts'

export interface CategorySummary {
  childId: string
  category: RepositoryCategory
  itemCount: number
  lastUpdatedAt: string
  recentItemIds: string[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface InformationRepositoryProps {
  /** Family context for this repository */
  family: Family
  /** Children shown in the repository dashboard */
  children: Child[]
  /** All stored documents across children */
  documents: Document[]
  /** Emergency contacts across children */
  emergencyContacts: EmergencyContact[]
  /** Category rollups per child */
  categorySummaries: CategorySummary[]
  /** Called when a child is selected from the dashboard */
  onSelectChild?: (childId: string) => void
  /** Called when a category is selected for a child */
  onSelectCategory?: (childId: string, category: RepositoryCategory) => void
  /** Called when a document is opened for viewing */
  onViewDocument?: (documentId: string) => void
  /** Called when a new document is created */
  onCreateDocument?: (childId: string, category: DocumentCategory) => void
  /** Called when a document is edited */
  onEditDocument?: (documentId: string) => void
  /** Called when a document is deleted */
  onDeleteDocument?: (documentId: string) => void
  /** Called when a user uploads or replaces a document file */
  onUploadDocumentFile?: (documentId: string) => void
  /** Called when a new emergency contact is added */
  onCreateContact?: (childId: string) => void
  /** Called when an emergency contact is edited */
  onEditContact?: (contactId: string) => void
  /** Called when an emergency contact is deleted */
  onDeleteContact?: (contactId: string) => void
}
