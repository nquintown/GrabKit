import JSZip from 'jszip'
import type { ExtractedAsset } from '@/types/assets'

const MAX_ASSETS = 50
const MAX_BYTES = 50 * 1024 * 1024

export async function createAssetsZip(assets: ExtractedAsset[]): Promise<Buffer> {
  const limited = assets.slice(0, MAX_ASSETS)
  const zip = new JSZip()
  const readme: string[] = [
    'GrabKit — Export d\'assets',
    '=================================',
    `Exporté le : ${new Date().toLocaleString('fr-FR')}`,
    '',
    'LISTE DES ASSETS',
    '----------------',
    '',
  ]

  let totalBytes = 0
  const usedNames = new Set<string>()

  function uniqueName(base: string): string {
    if (!usedNames.has(base)) {
      usedNames.add(base)
      return base
    }
    const extIdx = base.lastIndexOf('.')
    const name = extIdx > -1 ? base.slice(0, extIdx) : base
    const ext = extIdx > -1 ? base.slice(extIdx) : ''
    let n = 2
    while (usedNames.has(`${name}-${n}${ext}`)) n++
    const final = `${name}-${n}${ext}`
    usedNames.add(final)
    return final
  }

  for (const asset of limited) {
    if (asset.inlineContent) {
      const fname = uniqueName(asset.filename)
      zip.file(fname, asset.inlineContent)
      readme.push(`[INLINE]  ${fname}`)
      readme.push(`          Source : ${asset.source}`)
      readme.push('')
      continue
    }

    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 10_000)
      const res = await fetch(asset.url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'GrabKit/1.0' },
      })
      clearTimeout(timer)

      if (!res.ok) {
        readme.push(`[ERREUR ${res.status}]  ${asset.filename}`)
        readme.push(`          URL : ${asset.url}`)
        readme.push('')
        continue
      }

      const buf = await res.arrayBuffer()
      if (totalBytes + buf.byteLength > MAX_BYTES) {
        readme.push(`[IGNORÉ — limite 50 Mo]  ${asset.filename}`)
        readme.push(`          URL : ${asset.url}`)
        readme.push('')
        continue
      }

      totalBytes += buf.byteLength
      const fname = uniqueName(asset.filename)
      zip.file(fname, buf)
      readme.push(`[OK]  ${fname}`)
      readme.push(`      URL : ${asset.url}`)
      readme.push('')
    } catch {
      readme.push(`[ERREUR]  ${asset.filename}`)
      readme.push(`          URL : ${asset.url}`)
      readme.push('')
    }
  }

  readme.push('')
  readme.push('─────────────────────────────────────────')
  readme.push(`Volume téléchargé : ${(totalBytes / 1024 / 1024).toFixed(2)} Mo`)
  readme.push('')
  readme.push('NOTE LÉGALE')
  readme.push('-----------')
  readme.push('Utilisez ces assets uniquement pour des usages légitimes : audit,')
  readme.push('inspiration, développement ou assets dont vous avez les droits.')
  readme.push('Respectez les droits d\'auteur et les licences des contenus extraits.')

  zip.file('README.txt', readme.join('\n'))

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) as Promise<Buffer>
}
