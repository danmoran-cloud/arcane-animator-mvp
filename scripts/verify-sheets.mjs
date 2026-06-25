/**
 * verify-sheets.mjs — re-detect every sheet registered in lib/sprite-sheets.ts
 * and flag where the registered grid disagrees with detection.
 *
 *   node scripts/verify-sheets.mjs            # summary (mismatches + low-confidence)
 *   node scripts/verify-sheets.mjs --all      # list every sheet
 *   node scripts/verify-sheets.mjs --overlays # also write review overlays to .sheet-review/
 *
 * High-confidence mismatches are real problems (wrong grid → panning). Low-confidence
 * rows are full-bleed/sparse sheets the detector can't judge — confirm those against
 * the overlay, not the number.
 */

import { readFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { detectGrid, writeOverlay } from './lib/detect-grid.mjs'

const ROOT = resolve('.')
const args = process.argv.slice(2)
const showAll = args.includes('--all')
const writeOverlays = args.includes('--overlays')

// Parse `'id': { url: '...', cols: N, rows: M, frames: F, ... }` entries.
const source = readFileSync(join(ROOT, 'lib', 'sprite-sheets.ts'), 'utf8')
const entryRe = /'([^']+)':\s*\{\s*url:\s*'([^']+)',\s*cols:\s*(\d+),\s*rows:\s*(\d+),\s*frames:\s*(\d+)/g
const entries = []
let m
while ((m = entryRe.exec(source)) !== null) {
  entries.push({ id: m[1], url: m[2], cols: +m[3], rows: +m[4], frames: +m[5] })
}

if (entries.length === 0) {
  console.error('No sprite-sheet entries found in lib/sprite-sheets.ts')
  process.exit(1)
}

const reviewDir = join(ROOT, '.sheet-review')
if (writeOverlays) mkdirSync(reviewDir, { recursive: true })

let mismatches = 0
let lowConf = 0
let unreadable = 0

console.log(`Verifying ${entries.length} sheets against lib/sprite-sheets.ts …\n`)

for (const e of entries) {
  const file = join(ROOT, 'public', e.url)
  let grid
  try {
    grid = await detectGrid(file)
  } catch {
    unreadable++
    console.log(`  ?  ${e.id.padEnd(34)} cannot read ${e.url}`)
    continue
  }

  const matchesDetected = grid.cols === e.cols && grid.rows === e.rows
  // The 128px-cell prior is decisive when the registered grid matches it — it
  // confirms full-bleed/sparse sheets that gap detection can't see.
  const matchesHint = grid.cellHint && grid.cellHint.cols === e.cols && grid.cellHint.rows === e.rows
  const highConf = grid.label === 'high'

  if (writeOverlays) {
    await writeOverlay(file, grid, join(reviewDir, `${e.id}.png`))
  }

  if (matchesDetected || matchesHint) {
    const via = matchesDetected ? grid.label : 'cell-size'
    if (showAll) console.log(`  ✓  ${e.id.padEnd(34)} ${e.cols}x${e.rows}  (via ${via})`)
    continue
  }

  // A HIGH-confidence disagreement is only treated as a real error when the
  // detector found at least as many cells as are registered. If it found fewer,
  // that's almost always a sparse sheet with empty cells the detector can't see
  // (registered count is the trustworthy one) — downgrade to a soft check.
  if (highConf && grid.frames >= e.frames) {
    mismatches++
    console.log(`  ✗  ${e.id.padEnd(34)} registered ${e.cols}x${e.rows}, detected ${grid.cols}x${grid.rows}  (conf HIGH — likely wrong)`)
  } else {
    lowConf++
    const hint = grid.cellHint ? `, 128px→${grid.cellHint.cols}x${grid.cellHint.rows}` : ''
    console.log(`  ~  ${e.id.padEnd(34)} registered ${e.cols}x${e.rows}, detected ${grid.cols}x${grid.rows}${hint}  (conf ${grid.label} — confirm via overlay)`)
  }
}

console.log(
  `\n${entries.length} checked · ${mismatches} high-confidence mismatch(es) · ${lowConf} low-confidence diff(s) · ${unreadable} unreadable`,
)
if (writeOverlays) console.log(`Overlays written to .sheet-review/`)
process.exit(mismatches > 0 ? 1 : 0)
