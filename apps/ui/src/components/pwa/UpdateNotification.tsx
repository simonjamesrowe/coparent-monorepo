/**
 * Component to show update notification when new version is available
 */

import { useServiceWorker } from '../../lib/pwa/useServiceWorker'

export function UpdateNotification() {
  const { updateAvailable, skipWaiting } = useServiceWorker()

  if (!updateAvailable) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-teal-600 dark:text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Update Available
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              A new version of CoParent is available. Update now to get the
              latest features and improvements.
            </p>

            <div className="flex gap-2">
              <button
                onClick={skipWaiting}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
