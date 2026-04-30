'use client'

import { useState } from 'react'
import type { ExtractedAsset, AssetType } from '@/types/assets'

const TYPE_BADGE: Record<AssetType, { label: string; cls: string }> = {
  svg:     { label: 'SVG',   cls: 'bg-violet-100 text-violet-700' },
  image:   { label: 'IMG',   cls: 'bg-blue-100 text-blue-700' },
  favicon: { label: 'ICO',   cls: 'bg-amber-100 text-amber-700' },
  css:     { label: 'CSS',   cls: 'bg-pink-100 text-pink-700' },
  js:      { label: 'JS',    cls: 'bg-yellow-100 text-yellow-700' },
  font:    { label: 'FONT',  cls: 'bg-indigo-100 text-indigo-700' },
  media:   { label: 'MEDIA', cls: 'bg-red-100 text-red-700' },
}

function TypeIcon({ type }: { type: AssetType }) {
  switch (type) {
    case 'css':
      return (
        <svg className="size-8 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M9 3H5l-1 10h2l.5-5h2L9 13h2L9 3Zm6 0h-2l-1 10h2l.5-5h2L15 13h2L15 3Z" />
        </svg>
      )
    case 'js':
      return (
        <svg className="size-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path strokeLinecap="round" d="M8 17v-6m4 6c0 1-1 1.5-2 1.5M16 11v4c0 1.5-1 2-2 2" />
        </svg>
      )
    case 'font':
      return (
        <svg className="size-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M4 20h2m4 0h2m-4-4 4-12 4 12m-6-4h4" />
        </svg>
      )
    case 'media':
      return (
        <svg className="size-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m10 9.5 5 3-5 3v-6Z" />
        </svg>
      )
    default:
      return (
        <svg className="size-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" d="m5 18 4-5 3 3 2-2.5 5 4.5" />
        </svg>
      )
  }
}

interface Props {
  asset: ExtractedAsset
  selected: boolean
  onToggle: () => void
}

export default function AssetCard({ asset, selected, onToggle }: Props) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)
  const badge = TYPE_BADGE[asset.type]
  const isVisual = asset.type === 'svg' || asset.type === 'image' || asset.type === 'favicon'

  function copyUrl() {
    const text = asset.inlineContent ? asset.inlineContent : asset.url
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const shortName = asset.filename.length > 28
    ? `${asset.filename.slice(0, 14)}…${asset.filename.slice(-10)}`
    : asset.filename

  const shortUrl = asset.url.startsWith('inline-')
    ? 'Contenu inline'
    : asset.url.length > 48
      ? `${asset.url.slice(0, 24)}…${asset.url.slice(-18)}`
      : asset.url

  return (
    <div
      onClick={onToggle}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-all ${
        selected
          ? 'border-gray-900 ring-1 ring-gray-900'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Checkbox */}
      <div className="absolute left-2.5 top-2.5 z-10">
        <div
          className={`flex size-5 items-center justify-center rounded border-2 transition-colors ${
            selected
              ? 'border-gray-900 bg-gray-900'
              : 'border-gray-300 bg-white group-hover:border-gray-500'
          }`}
        >
          {selected && (
            <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2 6 3 3 5-5" />
            </svg>
          )}
        </div>
      </div>

      {/* Badge type */}
      <div className="absolute right-2.5 top-2.5 z-10">
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Preview */}
      <div className="flex h-36 items-center justify-center bg-[#f7f8f8] p-3">
        {isVisual && !imgError ? (
          asset.inlineContent ? (
            <div
              className="flex max-h-full max-w-full items-center justify-center [&>svg]:max-h-28 [&>svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: asset.inlineContent }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.previewUrl}
              alt={asset.filename}
              className="max-h-28 max-w-full object-contain"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <TypeIcon type={asset.type} />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-gray-900" title={asset.filename}>
          {shortName}
        </p>
        <p className="truncate text-xs text-gray-400" title={asset.url}>
          {shortUrl}
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between border-t border-gray-100 px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate text-xs text-gray-400">{asset.domain || 'inline'}</span>
        <button
          onClick={copyUrl}
          className="ml-2 flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50"
          title="Copier l'URL"
        >
          {copied ? (
            <>
              <svg className="size-3 text-green-500" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2 6 3 3 5-5" />
              </svg>
              Copié
            </>
          ) : (
            <>
              <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="7" height="7" rx="1" />
                <path d="M8 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
    </div>
  )
}
