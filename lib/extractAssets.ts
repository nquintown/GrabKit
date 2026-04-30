import * as cheerio from 'cheerio'
import type { ExtractedAsset, AssetType } from '@/types/assets'
import { normalizeUrl, getDomain, getFilename } from './normalizeUrl'

function hashStr(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(36)
}

function makeAsset(
  type: AssetType,
  url: string,
  source: string,
  inlineContent?: string,
): ExtractedAsset {
  const idKey = inlineContent ? `inline:${inlineContent.slice(0, 80)}` : url
  return {
    id: hashStr(idKey),
    type,
    url,
    source,
    filename: getFilename(url, `${type}-asset`),
    domain: getDomain(url),
    previewUrl: ['image', 'svg', 'favicon'].includes(type) && !inlineContent ? url : undefined,
    inlineContent,
  }
}

function isSvgUrl(url: string) {
  return /\.svg(\?|#|$)/i.test(url)
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|avif|bmp|tiff?|ico)(\?|#|$)/i.test(url)
}

function isFontUrl(url: string) {
  return /\.(woff2?|ttf|otf|eot)(\?|#|$)/i.test(url)
}

export function extractAssets(html: string, baseUrl: string): ExtractedAsset[] {
  const $ = cheerio.load(html)
  const seenKeys = new Set<string>()
  const assets: ExtractedAsset[] = []

  function add(asset: ExtractedAsset) {
    const key = asset.inlineContent
      ? `inline:${asset.inlineContent.slice(0, 100)}`
      : asset.url
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    assets.push(asset)
  }

  function resolve(href: string | undefined): string | null {
    if (!href) return null
    return normalizeUrl(href, baseUrl)
  }

  // ── Inline SVGs ──────────────────────────────────────────────────────────
  $('svg').each((_, el) => {
    const content = $.html(el)
    if (!content || content.length < 20) return
    const id = hashStr(`inline:${content.slice(0, 100)}`)
    const key = `inline:${content.slice(0, 100)}`
    if (seenKeys.has(key)) return
    seenKeys.add(key)
    assets.push({
      id,
      type: 'svg',
      url: `inline-svg-${id}`,
      source: 'inline',
      filename: `inline-${id}.svg`,
      domain: getDomain(baseUrl),
      inlineContent: content,
    })
  })

  // ── Images & external SVGs ───────────────────────────────────────────────
  $('img[src], img[data-src]').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    const url = resolve(src)
    if (!url) return
    if (isSvgUrl(url)) add(makeAsset('svg', url, 'img'))
    else if (isImageUrl(url)) add(makeAsset('image', url, 'img'))
  })

  // srcset (img + source)
  $('[srcset], [data-srcset]').each((_, el) => {
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset') || ''
    const source = el.tagName === 'source' ? 'picture>source' : 'srcset'
    srcset.split(',').forEach((part) => {
      const href = part.trim().split(/\s+/)[0]
      const url = resolve(href)
      if (!url) return
      if (isSvgUrl(url)) add(makeAsset('svg', url, source))
      else if (isImageUrl(url)) add(makeAsset('image', url, source))
    })
  })

  // Background images in style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const matches = style.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/g)
    for (const m of matches) {
      const url = resolve(m[1])
      if (!url) continue
      if (isSvgUrl(url)) add(makeAsset('svg', url, 'style[bg]'))
      else if (isImageUrl(url)) add(makeAsset('image', url, 'style[bg]'))
    }
  })

  // Meta OG image
  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
    const url = resolve($(el).attr('content'))
    if (!url) return
    if (isImageUrl(url) || isSvgUrl(url)) add(makeAsset('image', url, 'meta[og]'))
  })

  // ── Favicons ─────────────────────────────────────────────────────────────
  $('link[rel]').each((_, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase()
    if (!rel.includes('icon') && !rel.includes('apple-touch')) return
    const url = resolve($(el).attr('href'))
    if (!url) return
    add(makeAsset('favicon', url, `link[rel="${rel}"]`))
  })

  // Default /favicon.ico
  const defaultFavicon = resolve('/favicon.ico')
  if (defaultFavicon) add(makeAsset('favicon', defaultFavicon, 'default'))

  // ── Fonts (Google Fonts détectés dans les link[stylesheet]) ──────────────
  $('link[rel="stylesheet"]').each((_, el) => {
    const url = resolve($(el).attr('href'))
    if (!url) return
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
      add(makeAsset('font', url, 'link[stylesheet/font]'))
    }
    // CSS ordinaires ignorés
  })

  // ── Fonts ─────────────────────────────────────────────────────────────────
  $('link[as="font"], link[rel="preload"][as="font"]').each((_, el) => {
    const url = resolve($(el).attr('href'))
    if (!url) return
    add(makeAsset('font', url, 'link[preload/font]'))
  })

  // Font URLs inside <style> tags
  $('style').each((_, el) => {
    const content = $(el).html() || ''

    // @import Google Fonts
    const imports = content.matchAll(/@import\s+url\(['"]?(https?:\/\/fonts\.googleapis\.com[^'")\s]+)/gi)
    for (const m of imports) {
      const url = resolve(m[1])
      if (url) add(makeAsset('font', url, 'style[@import]'))
    }

    // url() font references
    const urlRefs = content.matchAll(/url\(['"]?([^'")\s]+\.(?:woff2?|ttf|otf|eot)[^'")\s]*)['"]?\)/gi)
    for (const m of urlRefs) {
      const url = resolve(m[1])
      if (url) add(makeAsset('font', url, 'style[url()]'))
    }
  })

  // Known font CDNs via link href
  $('link[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const url = resolve(href)
    if (!url) return
    if (
      url.includes('use.typekit.net') ||
      url.includes('use.fontawesome.com') ||
      url.includes('kit.fontawesome.com') ||
      isFontUrl(url)
    ) {
      add(makeAsset('font', url, 'link[font-cdn]'))
    }
  })

  // ── Media (YouTube / Vimeo iframes) ───────────────────────────────────────
  $('iframe[src]').each((_, el) => {
    const url = resolve($(el).attr('src'))
    if (!url) return
    if (
      url.includes('youtube.com') ||
      url.includes('youtube-nocookie.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    ) {
      add(makeAsset('media', url, 'iframe'))
    }
  })

  return assets
}
