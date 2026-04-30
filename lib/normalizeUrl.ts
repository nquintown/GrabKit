export function normalizeUrl(href: string, base: string): string | null {
  if (!href || href.startsWith('data:') || href.startsWith('javascript:')) return null
  try {
    return new URL(href.trim(), base).href
  } catch {
    return null
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function getFilename(url: string, fallback = 'asset'): string {
  try {
    if (url.startsWith('inline-')) return `${url}.svg`
    const pathname = new URL(url).pathname
    const name = pathname.split('/').filter(Boolean).pop()
    if (!name || name.length === 0) return fallback
    // strip query strings that might have crept into pathname
    return name.split('?')[0] || fallback
  } catch {
    return fallback
  }
}
