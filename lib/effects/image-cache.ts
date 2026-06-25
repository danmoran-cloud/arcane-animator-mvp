'use client'

// Browser-side image cache shared by all canvas effect renderers (preview today,
// export later). Keeps one decoded HTMLImageElement per URL and de-dupes
// concurrent loads so a sprite sheet is fetched at most once.

const cache = new Map<string, HTMLImageElement>()
const loading = new Map<string, Promise<HTMLImageElement | null>>()

/** Synchronous lookup — returns null if the image hasn't finished loading yet. */
export function getCachedImage(url: string): HTMLImageElement | null {
  return cache.get(url) ?? null
}

/** Load (or reuse) an image. Resolves null on error so callers can fall back. */
export function loadImage(url: string): Promise<HTMLImageElement | null> {
  const existing = cache.get(url)
  if (existing) return Promise.resolve(existing)
  const inFlight = loading.get(url)
  if (inFlight) return inFlight

  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      cache.set(url, img)
      loading.delete(url)
      resolve(img)
    }
    img.onerror = () => {
      loading.delete(url)
      resolve(null)
    }
    img.src = url
  })
  loading.set(url, p)
  return p
}

export function loadAssets(urls: string[]): Promise<(HTMLImageElement | null)[]> {
  return Promise.all(urls.map(loadImage))
}
