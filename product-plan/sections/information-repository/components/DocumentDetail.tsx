import type { Document, Child, Attachment } from '../types'

export interface DocumentDetailProps {
  document: Document
  child: Child
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUploadFile?: () => void
  onDownloadFile?: (fileUrl: string) => void
  onDownloadAttachment?: (attachment: Attachment) => void
  onDeleteAttachment?: (attachmentId: string) => void
}

const documentTypeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  'medical-record': {
    label: 'Medical Record',
    color: 'text-rose-700 dark:text-rose-300',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  immunization: {
    label: 'Immunization',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  'school-plan': {
    label: 'School Plan',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  'school-report': {
    label: 'School Report',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'emergency-plan': {
    label: 'Emergency Plan',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`
  }
  return `${kb} KB`
}

function getFileIcon(fileType: string, size: 'sm' | 'lg' = 'lg'): React.ReactNode {
  const className = size === 'lg' ? 'h-12 w-12' : 'h-5 w-5'

  if (fileType.includes('pdf')) {
    return (
      <svg className={`${className} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        <path d="M8 12h8v2H8zm0 4h5v2H8z" />
      </svg>
    )
  }
  if (fileType.includes('image')) {
    return (
      <svg className={`${className} text-teal-500`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
      </svg>
    )
  }
  return (
    <svg className={`${className} text-slate-400`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
    </svg>
  )
}

export function DocumentDetail({
  document,
  child,
  onBack,
  onEdit,
  onDelete,
  onUploadFile,
  onDownloadFile,
  onDownloadAttachment,
  onDeleteAttachment,
}: DocumentDetailProps) {
  const typeConfig = documentTypeConfig[document.documentType] || {
    label: document.documentType,
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <button
              onClick={onBack}
              className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200
                         text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900
                         dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Title & meta */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  for {child.name}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{document.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {document.provider}
                <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                {formatShortDate(document.dateOfService)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2
                           text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50
                           dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2
                           text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50
                           dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{document.description}</p>
            </section>

            {/* Primary File */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Document File
                </h2>
                <button
                  onClick={onUploadFile}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  Replace file
                </button>
              </div>

              <button
                onClick={() => onDownloadFile?.(document.file.fileUrl)}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50
                           p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50
                           dark:border-slate-600 dark:bg-slate-700/50 dark:hover:border-teal-700 dark:hover:bg-teal-900/20"
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                  {getFileIcon(document.file.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{document.file.fileName}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {formatFileSize(document.file.fileSizeKb)}
                    <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                    Click to download
                  </p>
                </div>
                <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </section>

            {/* Attachments */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Attachments
                  {document.attachments.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      {document.attachments.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={onUploadFile}
                  className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add attachment
                </button>
              </div>

              {document.attachments.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-600">
                  <svg
                    className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No attachments yet. Add supporting files like photos or additional documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {document.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3
                                 transition-colors hover:bg-white dark:border-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-700"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                        {getFileIcon(attachment.fileType, 'sm')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{attachment.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {attachment.fileName} • {formatFileSize(attachment.fileSizeKb)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onDownloadAttachment?.(attachment)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600
                                     dark:hover:bg-slate-600 dark:hover:text-slate-300"
                          title="Download"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteAttachment?.(attachment.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600
                                     dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Details
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Date of Service</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(document.dateOfService)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Provider</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{document.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                                  ${document.category === 'medical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : ''}
                                  ${document.category === 'school' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}`}
                    >
                      {document.category}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Uploaded</dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {formatShortDate(document.uploadedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {formatShortDate(document.updatedAt)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Tags */}
            {document.tags.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700
                                 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Child Info */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Child
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                             bg-gradient-to-br from-teal-100 to-teal-50 text-base font-semibold text-teal-700
                             dark:from-teal-800 dark:to-teal-900 dark:text-teal-200"
                >
                  {child.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{child.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(child.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
