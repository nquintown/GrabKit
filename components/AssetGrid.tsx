'use client'

import type { ExtractedAsset } from '@/types/assets'
import AssetCard from './AssetCard'

interface Props {
  assets: ExtractedAsset[]
  selected: Set<string>
  onToggle: (id: string) => void
}

export default function AssetGrid({ assets, selected, onToggle }: Props) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <svg className="size-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path strokeLinecap="round" d="m9 9 6 6m0-6-6 6" />
        </svg>
        <p className="mt-3 text-sm font-medium text-gray-500">Aucun asset dans cette catégorie</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          selected={selected.has(asset.id)}
          onToggle={() => onToggle(asset.id)}
        />
      ))}
    </div>
  )
}
