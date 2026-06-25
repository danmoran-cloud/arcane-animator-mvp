/**
 * import-sheet.mjs — register a sprite sheet into the effects system with its
 * grid AUTO-DETECTED (never hand-typed).
 *
 *   node scripts/import-sheet.mjs --input rain-burst.png --pack rain \
 *        --id rain-burst --name "Rain Burst" [options]
 *
 * Required:
 *   --input <file>     Sheet in sprite-images/ (or an absolute/relative path)
 *   --pack  <pack>     Target pack folder under public/effects/ (e.g. rain, magic)
 *   --id    <id>       Unique effect id (e.g. rain-burst)
 *   --name  "<text>"   Display name
 *
 * Grid (omit to auto-detect; a 128px-cell sheet is trusted over gap detection):
 *   --cols <n> --rows <n>     Force the grid
 *
 * Presentation (written into the SPRITE_SHEETS entry):
 *   --blend screen|normal     Compositing (default: normal)
 *   --no-glow                  Disable the ambient color glow (default: glow on)
 *   --tint                     Radial color tint wash (caustics-style)
 *   --fps <n>                  Frame rate at speed=100 (default: omit = 16)
 *   --color <hex>              Default effect color (default: #ffffff)
 *   --speed <0-100> --intensity <0-100>   Default settings (default 50 / 80)
 *
 * By default this is a DRY RUN: it detects the grid, writes a review overlay to
 * .sheet-review/, and prints what it WOULD add. Pass --write to apply changes
 * (copies the PNG into public/effects/<pack>/ and edits lib/sprite-sheets.ts +
 * lib/effects-library.ts).
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { resolve, join, basename } from 'path'
import { detectGrid, writeOverlay } from './lib/detect-grid.mjs'

const args = process.argv.slice(2)
const arg = (flag, def) => {
  const i = args.indexOf(flag)
  return i === -1 ? def : args[i + 1]
}
const has = (flag) => args.includes(flag)

const inputArg = arg('--input')
const pack = arg('--pack')
const id = arg('--id')
const name = arg('--name')

if (!inputArg || !pack || !id || !name) {
  console.error('Required: --input <file> --pack <pack> --id <id> --name "<text>"  (see header for options)')
  process.exit(1)
}

const ROOT = resolve('.')
const inputPath = existsSync(inputArg) ? resolve(inputArg) : join(ROOT, 'sprite-images', inputArg)
if (!existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`)
  process.exit(1)
}

const write = has('--write')
const forcedCols = arg('--cols') ? parseInt(arg('--cols'), 10) : null
const forcedRows = arg('--rows') ? parseInt(arg('--rows'), 10) : null
const blend = arg('--blend', 'normal')
const glow = !has('--no-glow')
const tint = has('--tint')
const fps = arg('--fps') ? parseInt(arg('--fps'), 10) : null
const color = arg('--color', '#ffffff')
const speed = parseInt(arg('--speed', '50'), 10)
const intensity = parseInt(arg('--intensity', '80'), 10)

const SHEETS_PATH = join(ROOT, 'lib', 'sprite-sheets.ts')
const LIB_PATH = join(ROOT, 'lib', 'effects-library.ts')
const outFile = basename(inputPath)
const publicUrl = `/effects/${pack}/${outFile}`
const outPath = join(ROOT, 'public', 'effects', pack, outFile)

// ── Detect grid ────────────────────────────────────────────────────────────────

const grid = await detectGrid(inputPath)
let cols, rows, source
if (forcedCols && forcedRows) {
  cols = forcedCols
  rows = forcedRows
  source = 'forced (--cols/--rows)'
} else if (grid.cellHint) {
  // A clean 128/96/64px-cell grid is the strongest signal for these assets.
  cols = grid.cellHint.cols
  rows = grid.cellHint.rows
  source = `${grid.cellHint.cell}px cell-size`
} else {
  cols = grid.cols
  rows = grid.rows
  source = `gap detection (confidence ${grid.label})`
}
const frames = cols * rows

console.log(`\nSheet: ${inputPath}`)
console.log(`Size:  ${grid.W}x${grid.H}`)
console.log(`Grid:  ${cols}x${rows} = ${frames} frames   [${source}]`)
console.log(`       gap-detect ${grid.cols}x${grid.rows} (conf ${grid.label})` +
  (grid.cellHint ? `, 128px-cell ${grid.cellHint.cols}x${grid.cellHint.rows}` : ''))

// Always write a review overlay so the grid can be eyeballed.
const reviewDir = join(ROOT, '.sheet-review')
mkdirSync(reviewDir, { recursive: true })
const overlayPath = join(reviewDir, `${id}.png`)
await writeOverlay(inputPath, grid, overlayPath)
console.log(`Review overlay: ${overlayPath}`)

// Build the entries we would write.
const present = [
  blend !== 'normal' ? `blend: '${blend}'` : null,
  glow ? null : 'glow: false',
  tint ? 'tint: true' : null,
  fps ? `fps: ${fps}` : null,
].filter(Boolean)
const presentStr = present.length ? `, ${present.join(', ')}` : ''
const sheetEntry = `  '${id}': { url: '${publicUrl}', cols: ${cols}, rows: ${rows}, frames: ${frames}${presentStr} },`

const renderMode = tint ? 'terrain' : 'localized'
const libDef = `  {
    id: '${id}',
    name: '${name}',
    pack: '${pack}',
    renderMode: '${renderMode}',
    icon: 'sparkles',
    description: '${name} sprite animation',
    defaultSettings: { speed: ${speed}, intensity: ${intensity}, density: 50, color: '${color}', glowIntensity: 60, scale: 1 },
  },`

if (!write) {
  console.log('\n── DRY RUN (pass --write to apply) ──')
  console.log('\nWould copy sprite →', outPath)
  console.log('\nWould add to lib/sprite-sheets.ts:')
  console.log(sheetEntry)
  console.log('\nWould add to lib/effects-library.ts (id union + definition):')
  console.log(libDef)
  console.log('\nReview the overlay above, then re-run with --write.')
  process.exit(0)
}

// ── Apply ──────────────────────────────────────────────────────────────────────

let sheets = readFileSync(SHEETS_PATH, 'utf8')
if (sheets.includes(`'${id}':`)) {
  console.error(`\nError: '${id}' already exists in sprite-sheets.ts`)
  process.exit(1)
}

// Copy the sprite into the pack folder.
mkdirSync(join(ROOT, 'public', 'effects', pack), { recursive: true })
copyFileSync(inputPath, outPath)
console.log(`\n✓ Sprite copied → public/effects/${pack}/${outFile}`)

// Insert the SPRITE_SHEETS entry just before the object's closing brace.
const lines = sheets.split('\n')
const declIdx = lines.findIndex((l) => l.includes('export const SPRITE_SHEETS'))
if (declIdx === -1) {
  console.error('Could not locate SPRITE_SHEETS in sprite-sheets.ts')
  process.exit(1)
}
let closeIdx = -1
for (let i = declIdx + 1; i < lines.length; i++) {
  if (lines[i] === '}') {
    closeIdx = i
    break
  }
}
lines.splice(closeIdx, 0, sheetEntry)
writeFileSync(SHEETS_PATH, lines.join('\n'), 'utf8')
console.log('✓ lib/sprite-sheets.ts updated')

// Register the effect definition.
let lib = readFileSync(LIB_PATH, 'utf8')
if (!lib.includes(`'${id}'`)) {
  lib = lib.replace('  // NEW_EFFECT_IDS', `  | '${id}'\n  // NEW_EFFECT_IDS`)
  lib = lib.replace('  // NEW_EFFECT_DEFS', `${libDef}\n  // NEW_EFFECT_DEFS`)
  writeFileSync(LIB_PATH, lib, 'utf8')
  console.log('✓ lib/effects-library.ts updated')
} else {
  console.log('• effects-library.ts already has this id — skipped')
}

console.log(`\n✓ "${name}" imported into the ${pack} pack as ${id}. Restart the dev server to see it.`)
