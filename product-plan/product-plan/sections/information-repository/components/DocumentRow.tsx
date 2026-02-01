import type { Document } from '../types'

interface DocumentRowProps {
  document: Document
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const documentTypeConfig: Record<string, { label: string; color: string }> = {
  'medical-record': { label: 'Medical Record', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  immunization: { label: 'Immunization', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'school-plan': { label: 'School Plan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  'school-report': { label: 'School Report', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'emergency-plan': { label: 'Emergency Plan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`
  }
  return `${kb} KB`
}

function getFileIcon(fileType: string): React.ReactNode {
  if (fileType.includes('pdf')) {
    return (
      <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        <path d="M8 12h8v2H8zm0 4h5v2H8z" />
      </svg>
    )
  }
  if (fileType.includes('image')) {
    return (
      <svg className="h-6 w-6 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
      </svg>
    )
  }
  return (
    <svg className="h-6 w-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    </svg>
  )
}

export function DocumentRow({ document, onView, onEdit, onDelete }: DocumentRowProps) {
  const typeConfig = documentTypeConfig[document.documentType] || {
    label: document.documentType,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  }
  const hasAttachments = document.attachments.length > 0

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white
                 transition-all duration-200 hover:border-teal-200 hover:shadow-md hover:shadow-teal-100/50
                 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-teal-800 dark:hover:shadow-teal-900/30"
    >
      <div className="flex items-start gap-4 p-4">
        {/* File icon */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700/50">
          {getFileIcon(document.file.fileType)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <button
                onClick={onView}
                className="block truncate text-left text-base font-semibold text-slate-900 hover:text-teal-600
                           dark:text-white dark:hover:text-teal-400"
              >
                {document.title}
              </button>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{document.provider}</p>
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

          {/* Description preview */}
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{document.description}</p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.label}
            </span>

            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(document.dateOfService)}
            </span>

            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(document.file.fileSizeKb)}
            </span>

            {hasAttachments && (
              <>
                <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  {document.attachments.length} attachment{document.attachments.length > 1 ? 's' : ''}
                </span>
              </>
            )}

            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="ml-auto flex gap-1">
                {document.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600
                               dark:bg-slate-700 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 2 && (
                  <span className="text-xs text-slate-400">+{document.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
