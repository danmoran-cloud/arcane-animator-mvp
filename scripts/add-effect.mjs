/**
 * add-effect.mjs
 *
 * Converts a sprite sheet from sprite-images/ into the standard format and
 * registers it as a New Effect in the app (no code editing required).
 *
 * Usage:
 *   node scripts/add-effect.mjs --input fire1_64.png --cols 10 --rows 6 --name "Fire Torch" --id "new-fire-torch"
 *
 * Options:
 *   --input   <filename>   File in the sprite-images/ folder (required)
 *   --cols    <n>          Columns in the source sheet (required)
 *   --rows    <n>          Rows in the source sheet (required)
 *   --name    <text>       Display name for the effect (required)
 *   --id      <text>       Unique effect ID, e.g. "new-fire-torch" (required)
 *   --frames  <n>          Frames to use from source (default: all, max 60)
 *   --speed   <0-100>      Default speed setting (default: 50)
 *   --intensity <0-100>    Default intensity setting (default: 80)
 *   --color   <hex>        Default color e.g. #ff6600 (default: #ff9500)
 *   --blend   screen|normal  Blend mode (default: screen)
 *   --fit     contain|cover|fill  Frame fit mode (default: contain)
 *   --black-to-alpha       Convert black pixels to transparent
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, join, dirname } from 'path'

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function arg(flag, defaultVal) {
  const i = args.indexOf(flag)
  if (i === -1) return defaultVal
  return args[i + 1]
}
function flag(name) { return args.includes(name) }

const inputFile    = arg('--input',     null)
const srcCols      = parseInt(arg('--cols',  '0'), 10)
const srcRows      = parseInt(arg('--rows',  '0'), 10)
const effectName   = arg('--name',      null)
const effectId     = arg('--id',        null)
const maxFrames    = parseInt(arg('--frames', '60'), 10)
const speed        = parseInt(arg('--speed', '50'), 10)
const intensity    = parseInt(arg('--intensity', '80'), 10)
const color        = arg('--color', '#ff9500')
const blendMode    = arg('--blend', 'screen')
const fitMode      = arg('--fit', 'contain')
const blackToAlpha = flag('--black-to-alpha')

if (!inputFile || !srcCols || !srcRows || !effectName || !effectId) {
  console.error(`
Usage:
  node scripts/add-effect.mjs --input <filename> --cols <n> --rows <n> --name "Effect Name" --id "new-effect-id"

All options:
  --frames <n>       Max frames to use (default: 60)
  --speed <0-100>    Default speed (default: 50)
  --intensity <0-100> Default intensity (default: 80)
  --color <hex>      Default color (default: #ff9500)
  --blend screen|normal  Blend mode (default: screen)
  --fit contain|cover|fill  Frame fit (default: contain)
  --black-to-alpha   Convert black backgrounds to transparent
`)
  process.exit(1)
}

if (!effectId.startsWith('new-')) {
  console.error('Error: --id must start with "new-" e.g. --id "new-fire-torch"')
  process.exit(1)
}

if (blendMode !== 'screen' && blendMode !== 'normal') {
  console.error('Error: --blend must be "screen" (light-emitting: fire, glow, magic, water) or "normal" (occluding: smoke, fog, debris)')
  process.exit(1)
}

// ── Paths ─────────────────────────────────────────────────────────────────────

const ROOT          = resolve('.')
const INPUT_PATH    = join(ROOT, 'sprite-images', inputFile)
const OUTPUT_DIR    = join(ROOT, 'public', 'effects', 'new')
const OUTPUT_FILE   = effectId + '.png'
const OUTPUT_PATH   = join(OUTPUT_DIR, OUTPUT_FILE)
const PUBLIC_URL    = `/effects/new/${OUTPUT_FILE}`
const LIB_PATH      = join(ROOT, 'lib', 'effects-library.ts')
const SHEETS_PATH   = join(ROOT, 'lib', 'sprite-sheets.ts')

// ── Standard output format ─────────────────────────────────────────────────────

const OUT_COLS       = 10
const OUT_ROWS       = 6
const OUT_FRAME_SIZE = 128
const OUT_WIDTH      = OUT_COLS * OUT_FRAME_SIZE   // 1280
const OUT_HEIGHT     = OUT_ROWS * OUT_FRAME_SIZE   // 768
const MAX_OUT_FRAMES = OUT_COLS * OUT_ROWS         // 60

// ── Convert sprite sheet ───────────────────────────────────────────────────────

console.log(`\nLoading sprite-images/${inputFile} …`)
const meta = await sharp(INPUT_PATH).metadata()
const srcWidth  = meta.width
const srcHeight = meta.height
const frameW    = Math.floor(srcWidth  / srcCols)
const frameH    = Math.floor(srcHeight / srcRows)
const totalSrcFrames = srcCols * srcRows
const framesToUse = Math.min(totalSrcFrames, maxFrames, MAX_OUT_FRAMES)

console.log(`Source: ${srcWidth}×${srcHeight}  →  ${srcCols}×${srcRows} grid  (${frameW}×${frameH}px per frame, ${totalSrcFrames} frames)`)
console.log(`Using ${framesToUse} frames  →  ${OUT_COLS}×${OUT_ROWS} grid at ${OUT_FRAME_SIZE}×${OUT_FRAME_SIZE}px`)

async function extractFrame(index) {
  const col = index % srcCols
  const row = Math.floor(index / srcCols)
  const left = col * frameW
  const top  = row * frameH

  let pipeline = sharp(INPUT_PATH)
    .extract({ left, top, width: frameW, height: frameH })
    .ensureAlpha()

  if (fitMode === 'fill') {
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, { fit: 'fill' })
  } else if (fitMode === 'cover') {
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, { fit: 'cover' })
  } else {
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  }

  if (blackToAlpha) {
    const { data } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    const pixels = new Uint8Array(data)
    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = (pixels[i] * 299 + pixels[i+1] * 587 + pixels[i+2] * 114) / 1000
      if (brightness <= 30) pixels[i+3] = 0
    }
    return sharp(Buffer.from(pixels), {
      raw: { width: OUT_FRAME_SIZE, height: OUT_FRAME_SIZE, channels: 4 },
    }).png().toBuffer()
  }

  return pipeline.png().toBuffer()
}

console.log('Extracting frames …')
const frameBuffers = []
for (let i = 0; i < framesToUse; i++) {
  process.stdout.write(`  frame ${i + 1}/${framesToUse}\r`)
  frameBuffers.push(await extractFrame(i))
}
console.log()

while (frameBuffers.length < MAX_OUT_FRAMES) {
  frameBuffers.push(frameBuffers[frameBuffers.length % framesToUse])
}

mkdirSync(OUTPUT_DIR, { recursive: true })

await sharp({
  create: { width: OUT_WIDTH, height: OUT_HEIGHT, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(frameBuffers.map((buf, i) => ({
    input: buf,
    left: (i % OUT_COLS) * OUT_FRAME_SIZE,
    top:  Math.floor(i / OUT_COLS) * OUT_FRAME_SIZE,
  })))
  .png()
  .toFile(OUTPUT_PATH)

console.log(`✓ Sprite saved → public/effects/new/${OUTPUT_FILE}`)

// ── Update effects-library.ts ──────────────────────────────────────────────────

console.log('\nUpdating effects-library.ts …')
let lib = readFileSync(LIB_PATH, 'utf8')

// Check for duplicate ID
if (lib.includes(`'${effectId}'`)) {
  console.error(`Error: effect ID "${effectId}" already exists in effects-library.ts`)
  process.exit(1)
}

// Insert ID into EffectId union
lib = lib.replace(
  '  // NEW_EFFECT_IDS',
  `  | '${effectId}'\n  // NEW_EFFECT_IDS`
)

// Insert definition into effectsLibrary array
const def = `  {
    id: '${effectId}',
    name: '${effectName}',
    pack: 'new',
    renderMode: 'localized',
    icon: 'sparkles',
    description: '${effectName} sprite animation',
    defaultSettings: { speed: ${speed}, intensity: ${intensity}, density: 50, color: '${color}', glowIntensity: 60, scale: 1 },
  },
  // NEW_EFFECT_DEFS`

lib = lib.replace('  // NEW_EFFECT_DEFS', def)

writeFileSync(LIB_PATH, lib, 'utf8')
console.log('✓ effects-library.ts updated')

// ── Update lib/sprite-sheets.ts ────────────────────────────────────────────────
// One shared geometry+presentation map feeds both the editor preview and the
// exporter via the lib/effects registry, so a single entry registers the effect
// for both render paths.

console.log('Updating lib/sprite-sheets.ts …')
let sheets = readFileSync(SHEETS_PATH, 'utf8')

if (sheets.includes(`'${effectId}':`)) {
  console.error(`Error: effect ID "${effectId}" already exists in sprite-sheets.ts`)
  process.exit(1)
}

// New Effects don't draw a color glow; blend is screen for light-emitting
// effects and normal for occluding ones (smoke/fog/debris).
const sheetEntry = `  '${effectId}': { url: '${PUBLIC_URL}', cols: ${OUT_COLS}, rows: ${OUT_ROWS}, frames: ${MAX_OUT_FRAMES}, glow: false, fps: 20, blend: '${blendMode}' },\n  // NEW_SHEETS_END`

sheets = sheets.replace('  // NEW_SHEETS_END', sheetEntry)

writeFileSync(SHEETS_PATH, sheets, 'utf8')
console.log('✓ sprite-sheets.ts updated')

// ── Done ───────────────────────────────────────────────────────────────────────

console.log(`
✓ Done! "${effectName}" added to the New Effects pack.
  Effect ID : ${effectId}
  Sprite    : public/effects/new/${OUTPUT_FILE}
  Format    : ${OUT_WIDTH}×${OUT_HEIGHT}px | ${OUT_COLS}×${OUT_ROWS} | ${OUT_FRAME_SIZE}×${OUT_FRAME_SIZE}px per frame

Restart your dev server to see the effect in the app.
`)
