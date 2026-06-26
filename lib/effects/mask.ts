// Exclusion-zone clipping, shared by the editor preview and the exporter.
//
// Effects render across their layer bounds; exclusion zones are freeform polygons
// (points normalized 0..1 in layer space) where the effect must NOT appear. We
// clip the drawing region to "bounds MINUS the polygons" using the even-odd fill
// rule, so it works for every renderer (sprite/particle/vector) without each one
// knowing about masks. Apply on a saved context state, draw the effect, restore.

interface Pt {
  x: number
  y: number
}
interface Zone {
  points: Pt[]
}
interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Set the current clip to the layer bounds with the exclusion polygons punched
 * out. No-op when there are no valid zones. Caller is responsible for ctx.save()
 * before and ctx.restore() after.
 */
export function clipToExclusions(
  ctx: CanvasRenderingContext2D,
  zones: Zone[] | undefined,
  bounds: Bounds,
): void {
  const valid = (zones ?? []).filter((z) => z.points && z.points.length >= 3)
  if (valid.length === 0) return

  ctx.beginPath()
  ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height)
  for (const zone of valid) {
    zone.points.forEach((p, i) => {
      const x = bounds.x + p.x * bounds.width
      const y = bounds.y + p.y * bounds.height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
  }
  ctx.clip('evenodd')
}
