'use client'

import { useState, useCallback } from 'react'
import type { ScanResult, FilterType, ExtractedAsset } from '@/types/assets'
import UrlScanForm from '@/components/UrlScanForm'
import ScanSummary from '@/components/ScanSummary'
import AssetFilters from '@/components/AssetFilters'
import AssetGrid from '@/components/AssetGrid'
import LegalNotice from '@/components/LegalNotice'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleScan = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setSelected(new Set())
    setFilter('all')

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'analyse.')
      } else {
        setResult(data as ScanResult)
      }
    } catch {
      setError('Impossible de joindre le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredAssets: ExtractedAsset[] = result
    ? filter === 'all'
      ? result.assets
      : result.assets.filter((a) => a.type === filter)
    : []

  function toggleAsset(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filteredAssets.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredAssets.map((a) => a.id)))
    }
  }

  function selectAllVisible() {
    setSelected(new Set(result?.assets.map((a) => a.id) ?? []))
  }

  async function downloadSelected() {
    if (!result || selected.size === 0) return
    setDownloading(true)
    try {
      const assets = result.assets.filter((a) => selected.has(a.id))
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Erreur lors du téléchargement.')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'assetgobbler-export.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement.')
    } finally {
      setDownloading(false)
    }
  }

  function copyAllUrls() {
    if (!result) return
    const urls = filteredAssets
      .map((a) => a.url)
      .join('\n')
    navigator.clipboard.writeText(urls).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  const allFilteredSelected =
    filteredAssets.length > 0 && filteredAssets.every((a) => selected.has(a.id))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gray-900">
              <svg className="size-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 2a5 5 0 1 0 0 10A5 5 0 0 0 8 3Zm-1 3h2a1 1 0 0 1 1 1v4H7V7a1 1 0 0 1 0 0Zm-1 0v5H5V7h1Zm5 0h1v5h-1V7ZM7 5h2a.5.5 0 0 0 0-1H7a.5.5 0 0 0 0 1Z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">AssetGobbler</span>
          </div>
          <span className="hidden text-xs text-gray-400 sm:block">
            Scannez, filtrez, exportez
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        {/* Hero */}
        {!result && (
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Scannez les assets<br className="hidden sm:block" /> d&apos;une page web
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              Collez une URL — AssetGobbler extrait tous les assets : SVG, images, CSS, JS,
              polices, médias. Filtrez, sélectionnez et exportez en ZIP.
            </p>
          </div>
        )}

        {/* Scan form */}
        <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${result ? 'mb-6' : 'mx-auto max-w-2xl mb-6'}`}>
          {result && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Analyser une page
            </p>
          )}
          <UrlScanForm onScan={handleScan} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4.25a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 11.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">
            <LegalNotice />
            <ScanSummary result={result} selectedCount={selected.size} />

            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <AssetFilters active={filter} onChange={setFilter} result={result} />

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  onClick={selectAll}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <button
                  onClick={copyAllUrls}
                  disabled={filteredAssets.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  {copiedAll ? (
                    <>
                      <svg className="size-3.5 text-green-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2 6 3 3 5-5" />
                      </svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg className="size-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="4" width="7" height="7" rx="1" />
                        <path d="M8 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1" />
                      </svg>
                      Copier les URLs
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Grid */}
            <AssetGrid
              assets={filteredAssets}
              selected={selected}
              onToggle={toggleAsset}
            />
          </div>
        )}
      </main>

      {/* Floating download bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {selected.size}
              </span>
              <span className="text-sm font-medium text-gray-700">
                asset{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
              </span>
              {selected.size >= 50 && (
                <span className="text-xs text-amber-600">(max 50)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Vider
              </button>
              <button
                onClick={selectAllVisible}
                className="hidden rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:block"
              >
                Tout sélectionner ({result?.totalAssets})
              </button>
              <button
                onClick={downloadSelected}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Préparation…
                  </>
                ) : (
                  <>
                    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v8m-3-3 3 3 3-3M3 13h10" />
                    </svg>
                    Télécharger le ZIP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
