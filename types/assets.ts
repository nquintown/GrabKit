export type AssetType = 'svg' | 'image' | 'favicon' | 'css' | 'js' | 'font' | 'media'

export interface ExtractedAsset {
  id: string
  type: AssetType
  url: string
  source: string
  filename: string
  domain: string
  previewUrl?: string
  inlineContent?: string
}

export interface ScanResult {
  url: string
  scannedAt: string
  domain: string
  totalAssets: number
  countsByType: Partial<Record<AssetType, number>>
  assets: ExtractedAsset[]
}

export interface DownloadRequest {
  assets: ExtractedAsset[]
}

export type FilterType = AssetType | 'all'
