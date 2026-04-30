export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  let response: Response
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GrabKit/1.0 (asset-scanner; +https://grabkit.dev)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr,en;q=0.9',
      },
      redirect: 'follow',
    })
  } catch (err: unknown) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('La requête a expiré (délai de 10 secondes).')
    }
    throw new Error('Impossible de joindre cette page. Vérifiez l\'URL et réessayez.')
  }
  clearTimeout(timer)

  if (!response.ok) {
    throw new Error(`La page a répondu avec une erreur HTTP ${response.status}.`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new Error('La réponse n\'est pas une page HTML.')
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Impossible de lire le contenu de la page.')

  const MAX = 2 * 1024 * 1024
  let received = 0
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      received += value.length
      if (received > MAX) {
        await reader.cancel()
        throw new Error('Page trop volumineuse (maximum 2 Mo).')
      }
      chunks.push(value)
    }
  }

  const merged = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(merged)
}
