/**
 * Component to prompt PWA installation
 */

import { useState } from 'react'
import { usePWAInstall } from '../../lib/pwa/usePWAInstall'

export function InstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || isInstalled || dismissed) {
    return null
  }

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (!installed) {
      setDismissed(true)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install CoParent</h3>
            <p className="text-sm text-white/90 mb-3">
              Install our app for quick access and offline functionality. Works
              just like a native app!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-white text-teal-600 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
