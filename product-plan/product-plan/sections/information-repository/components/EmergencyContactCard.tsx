import type { EmergencyContact } from '../types'

interface EmergencyContactCardProps {
  contact: EmergencyContact
  onEdit?: () => void
  onDelete?: () => void
}

function formatPhoneNumber(phone: string): string {
  // Simple formatting - assumes 10-digit US number
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRelationshipColor(relationship: string): string {
  const lower = relationship.toLowerCase()
  if (lower.includes('grandma') || lower.includes('grandmother') || lower.includes('grandpa') || lower.includes('grandfather')) {
    return 'from-amber-400 to-orange-500'
  }
  if (lower.includes('uncle') || lower.includes('aunt')) {
    return 'from-purple-400 to-indigo-500'
  }
  if (lower.includes('doctor') || lower.includes('pediatrician') || lower.includes('dr.')) {
    return 'from-teal-400 to-cyan-500'
  }
  if (lower.includes('step')) {
    return 'from-rose-400 to-pink-500'
  }
  if (lower.includes('friend')) {
    return 'from-emerald-400 to-green-500'
  }
  return 'from-slate-400 to-slate-500'
}

export function EmergencyContactCard({ contact, onEdit, onDelete }: EmergencyContactCardProps) {
  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white
                 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50
                 dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/50"
    >
      {/* Primary badge */}
      {contact.isPrimary && (
        <div className="absolute right-3 top-3">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs
                       font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
            Primary
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full
                        bg-gradient-to-br ${getRelationshipColor(contact.relationship)}
                        text-lg font-bold text-white shadow-lg`}
          >
            {getInitials(contact.name)}
          </div>

          {/* Name & Relationship */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{contact.name}</h3>
            <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{contact.relationship}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600
                         dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600
                         dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 space-y-2.5">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <a
              href={`tel:${contact.phone}`}
              className="text-sm font-medium text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400"
            >
              {formatPhoneNumber(contact.phone)}
            </a>
          </div>

          {/* Email */}
          {contact.email && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="truncate text-sm font-medium text-slate-900 hover:text-teal-600
                           dark:text-white dark:hover:text-teal-400"
              >
                {contact.email}
              </a>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{contact.address}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <p className="text-sm text-slate-600 dark:text-slate-300">{contact.notes}</p>
          </div>
        )}
      </div>
    </article>
  )
}
