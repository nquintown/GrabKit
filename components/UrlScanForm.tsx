'use client'

import { useState } from 'react'
import { validateUrl } from '@/lib/validateUrl'

interface Props {
  onScan: (url: string) => void
  loading: boolean
}

export default function UrlScanForm({ onScan, loading }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = value.trim()
    // Auto-prepend https:// if missing protocol
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`

    const check = validateUrl(url)
    if (!check.valid) {
      setError(check.error ?? 'URL invalide.')
      return
    }
    onScan(url)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg className="size-4 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
              <path strokeLinecap="round" d="m10.5 10.5 3 3" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null) }}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            autoFocus
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || value.trim() === ''}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Analyse en cours…
            </>
          ) : (
            'Scanner la page'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}
