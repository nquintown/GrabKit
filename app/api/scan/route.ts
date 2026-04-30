import { NextRequest, NextResponse } from 'next/server'
import { validateUrl } from '@/lib/validateUrl'
import { fetchHtml } from '@/lib/fetchHtml'
import { extractAssets } from '@/lib/extractAssets'
import type { ScanResult, AssetType } from '@/types/assets'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('url' in body)) {
    return NextResponse.json({ error: 'Champ url manquant.' }, { status: 400 })
  }

  const { url } = body as { url: unknown }
  if (typeof url !== 'string' || url.trim() === '') {
    return NextResponse.json({ error: 'URL manquante ou invalide.' }, { status: 400 })
  }

  const validation = validateUrl(url.trim())
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  let html: string
  try {
    html = await fetchHtml(url.trim())
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la récupération de la page.'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const assets = extractAssets(html, url.trim())

  const countsByType = assets.reduce<Partial<Record<AssetType, number>>>((acc, asset) => {
    acc[asset.type] = (acc[asset.type] ?? 0) + 1
    return acc
  }, {})

  const result: ScanResult = {
    url: url.trim(),
    scannedAt: new Date().toISOString(),
    domain: new URL(url.trim()).hostname,
    totalAssets: assets.length,
    countsByType,
    assets,
  }

  return NextResponse.json(result)
}
