export function validateUrl(input: string): { valid: boolean; error?: string } {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return { valid: false, error: 'URL invalide. Exemple : https://example.com' }
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { valid: false, error: 'Seuls les protocoles HTTP et HTTPS sont autorisés.' }
  }

  const hostname = url.hostname.toLowerCase()

  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
  if (blocked.includes(hostname)) {
    return { valid: false, error: 'Les adresses locales ne sont pas autorisées.' }
  }

  const privateRanges = [
    /^10\.\d+\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^169\.254\.\d+\.\d+$/,
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+$/,
    /^fc[0-9a-f]{2}:/i,
    /^fe[89ab][0-9a-f]:/i,
  ]

  for (const range of privateRanges) {
    if (range.test(hostname)) {
      return { valid: false, error: 'Les adresses IP privées ne sont pas autorisées.' }
    }
  }

  return { valid: true }
}
