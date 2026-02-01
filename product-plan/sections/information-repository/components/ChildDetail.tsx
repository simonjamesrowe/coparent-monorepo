import { useState } from 'react'
import type {
  Child,
  Document,
  EmergencyContact,
  CategorySummary,
  RepositoryCategory,
  DocumentCategory,
} from '../types'
import { DocumentRow } from './DocumentRow'
import { EmergencyContactCard } from './EmergencyContactCard'

export interface ChildDetailProps {
  child: Child
  documents: Document[]
  emergencyContacts: EmergencyContact[]
  categorySummaries: CategorySummary[]
  initialCategory?: RepositoryCategory
  onBack?: () => void
  onViewDocument?: (documentId: string) => void
  onCreateDocument?: (childId: string, category: DocumentCategory) => void
  onEditDocument?: (documentId: string) => void
  onDeleteDocument?: (documentId: string) => void
  onCreateContact?: (childId: string) => void
  onEditContact?: (contactId: string) => void
  onDeleteContact?: (contactId: string) => void
}

const categoryConfig: Record<RepositoryCategory, { label: string; icon: React.ReactNode; color: string }> = {
  medical: {
    label: 'Medical',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    color: 'rose',
  },
  school: {
    label: 'School',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
        />
      </svg>
    ),
    color: 'amber',
  },
  contacts: {
    label: 'Emergency Contacts',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: 'teal',
  },
}

function getAge(birthdate: string): number {
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function ChildDetail({
  child,
  documents,
  emergencyContacts,
  categorySummaries,
  initialCategory = 'medical',
  onBack,
  onViewDocument,
  onCreateDocument,
  onEditDocument,
  onDeleteDocument,
  onCreateContact,
  onEditContact,
  onDeleteContact,
}: ChildDetailProps) {
  const [activeCategory, setActiveCategory] = useState<RepositoryCategory>(initialCategory)

  const childDocuments = documents.filter((d) => d.childId === child.id)
  const childContacts = emergencyContacts.filter((c) => c.childId === child.id)
  const childSummaries = categorySummaries.filter((s) => s.childId === child.id)

  const medicalDocs = childDocuments.filter((d) => d.category === 'medical')
  const schoolDocs = childDocuments.filter((d) => d.category === 'school')

  const age = getAge(child.birthdate)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200
                         text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900
                         dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Avatar */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full
                         bg-gradient-to-br from-teal-100 to-teal-50 text-2xl font-semibold text-teal-700
                         ring-2 ring-teal-200/50 dark:from-teal-800 dark:to-teal-900 dark:text-teal-200 dark:ring-teal-700/50"
            >
              {child.name.charAt(0)}
            </div>

            {/* Name & meta */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{child.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {age} years old
                <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                {childDocuments.length} documents
                <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                {childContacts.length} contacts
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex gap-1" aria-label="Categories">
            {(['medical', 'school', 'contacts'] as RepositoryCategory[]).map((category) => {
              const config = categoryConfig[category]
              const summary = childSummaries.find((s) => s.category === category)
              const count = summary?.itemCount ?? 0
              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'border-b-2 border-teal-500 bg-slate-50 text-teal-600 dark:bg-slate-700/50 dark:text-teal-400'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/30 dark:hover:text-slate-300'
                    }`}
                >
                  <span className={isActive ? 'text-teal-500 dark:text-teal-400' : ''}>{config.icon}</span>
                  {config.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Medical Documents */}
        {activeCategory === 'medical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Medical Records</h2>
              <button
                onClick={() => onCreateDocument?.(child.id, 'medical')}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white shadow-sm transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2
                           focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Record
              </button>
            </div>

            {medicalDocs.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                  <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No medical records yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add physicals, immunizations, and other medical documents.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalDocs.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onView={() => onViewDocument?.(doc.id)}
                    onEdit={() => onEditDocument?.(doc.id)}
                    onDelete={() => onDeleteDocument?.(doc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* School Documents */}
        {activeCategory === 'school' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">School Documents</h2>
              <button
                onClick={() => onCreateDocument?.(child.id, 'school')}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white shadow-sm transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2
                           focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
            </div>

            {schoolDocs.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No school documents yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add report cards, IEPs, 504 plans, and other school records.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {schoolDocs.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    onView={() => onViewDocument?.(doc.id)}
                    onEdit={() => onEditDocument?.(doc.id)}
                    onDelete={() => onDeleteDocument?.(doc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Contacts */}
        {activeCategory === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contacts</h2>
              <button
                onClick={() => onCreateContact?.(child.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white shadow-sm transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2
                           focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Contact
              </button>
            </div>

            {childContacts.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                  <svg className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No emergency contacts yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add grandparents, doctors, and other important contacts.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {childContacts.map((contact) => (
                  <EmergencyContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={() => onEditContact?.(contact.id)}
                    onDelete={() => onDeleteContact?.(contact.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
