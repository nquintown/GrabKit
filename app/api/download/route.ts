import { NextRequest, NextResponse } from 'next/server'
import { createAssetsZip } from '@/lib/createAssetsZip'
import type { ExtractedAsset } from '@/types/assets'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('assets' in body)) {
    return NextResponse.json({ error: 'Champ assets manquant.' }, { status: 400 })
  }

  const { assets } = body as { assets: unknown }
  if (!Array.isArray(assets) || assets.length === 0) {
    return NextResponse.json({ error: 'Sélectionnez au moins un asset.' }, { status: 400 })
  }

  if (assets.length > 50) {
    return NextResponse.json({ error: 'Maximum 50 assets par téléchargement.' }, { status: 400 })
  }

  try {
    const zip = await createAssetsZip(assets as ExtractedAsset[])
    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="assetgobbler-export.zip"',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création du ZIP.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
