import type { FilterType, AssetType } from '@/types/assets'
import type { ScanResult } from '@/types/assets'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'svg', label: 'SVG' },
  { key: 'image', label: 'Images' },
  { key: 'favicon', label: 'Favicons' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JS' },
  { key: 'font', label: 'Polices' },
  { key: 'media', label: 'Médias' },
]

interface Props {
  active: FilterType
  onChange: (f: FilterType) => void
  result: ScanResult
}

export default function AssetFilters({ active, onChange, result }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label }) => {
        const count =
          key === 'all'
            ? result.totalAssets
            : (result.countsByType[key as AssetType] ?? 0)

        if (key !== 'all' && count === 0) return null

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              active === key
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                active === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
