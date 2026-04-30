import type { ScanResult, AssetType } from '@/types/assets'

const TYPE_LABELS: Record<AssetType, string> = {
  svg: 'SVG',
  image: 'Images',
  favicon: 'Favicons',
  css: 'CSS',
  js: 'JavaScript',
  font: 'Polices',
  media: 'Médias',
}

const TYPE_COLORS: Record<AssetType, string> = {
  svg: 'bg-violet-100 text-violet-700',
  image: 'bg-blue-100 text-blue-700',
  favicon: 'bg-amber-100 text-amber-700',
  css: 'bg-pink-100 text-pink-700',
  js: 'bg-yellow-100 text-yellow-700',
  font: 'bg-indigo-100 text-indigo-700',
  media: 'bg-red-100 text-red-700',
}

interface Props {
  result: ScanResult
  selectedCount: number
}

export default function ScanSummary({ result, selectedCount }: Props) {
  const types = Object.entries(result.countsByType) as [AssetType, number][]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
        Résultats de l&apos;analyse
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-3xl font-bold text-gray-900">{result.totalAssets}</p>
          <p className="mt-0.5 text-xs text-gray-500">Assets détectés</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{types.length}</p>
          <p className="mt-0.5 text-xs text-gray-500">Types différents</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{selectedCount}</p>
          <p className="mt-0.5 text-xs text-gray-500">Sélectionnés</p>
        </div>
        <div>
          <p className="truncate text-sm font-semibold text-gray-700">{result.domain}</p>
          <p className="mt-0.5 text-xs text-gray-500">Domaine analysé</p>
        </div>
      </div>

      {types.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          {types.map(([type, count]) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[type]}`}
            >
              <span className="font-bold">{count}</span>
              {TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
