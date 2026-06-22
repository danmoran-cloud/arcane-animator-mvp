/**
 * convert-sprite.mjs
 *
 * Converts any sprite sheet PNG into the Arcane Animator standard format:
 *   1280 x 768 px  |  10 columns x 6 rows  |  128 x 128 px per frame  |  PNG with alpha
 *
 * Usage:
 *   node scripts/convert-sprite.mjs --input <path> --cols <n> --rows <n> --output <path> [options]
 *
 * Options:
 *   --input   <path>       Source sprite sheet PNG (required)
 *   --cols    <n>          Number of columns in the source sheet (required)
 *   --rows    <n>          Number of rows in the source sheet (required)
 *   --output  <path>       Output path for the converted sheet (required)
 *   --frames  <n>          How many frames to use from source (default: all, max 30)
 *   --fit     cover|contain|fill   How to fit non-square frames (default: contain)
 *   --black-to-alpha       Convert black/near-black pixels to transparent
 *   --black-threshold <n>  Brightness threshold for black-to-alpha (0-255, default: 30)
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'

// ── Parse args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function arg(flag, defaultVal) {
  const i = args.indexOf(flag)
  if (i === -1) return defaultVal
  return args[i + 1]
}
function flag(name) {
  return args.includes(name)
}

const inputPath    = arg('--input',  null)
const outputPath   = arg('--output', null)
const srcCols      = parseInt(arg('--cols',  '0'), 10)
const srcRows      = parseInt(arg('--rows',  '0'), 10)
const maxFrames    = parseInt(arg('--frames', '30'), 10)
const fitMode      = arg('--fit', 'contain')
const blackToAlpha = flag('--black-to-alpha')
const blackThresh  = parseInt(arg('--black-threshold', '30'), 10)

if (!inputPath || !outputPath || !srcCols || !srcRows) {
  console.error(`
Usage:
  node scripts/convert-sprite.mjs --input <path> --cols <n> --rows <n> --output <path> [options]

Options:
  --frames  <n>          Max frames to use from source (default: 30)
  --fit     cover|contain|fill  (default: contain)
  --black-to-alpha       Convert black backgrounds to transparency
  --black-threshold <n>  Brightness cutoff for --black-to-alpha (default: 30)
`)
  process.exit(1)
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OUT_COLS       = 10
const OUT_ROWS       = 6
const OUT_FRAME_SIZE = 128
const OUT_WIDTH      = OUT_COLS * OUT_FRAME_SIZE   // 1280
const OUT_HEIGHT     = OUT_ROWS * OUT_FRAME_SIZE   // 768
const MAX_OUT_FRAMES = OUT_COLS * OUT_ROWS         // 60

// ── Load source ───────────────────────────────────────────────────────────────

console.log(`Loading ${inputPath} …`)
const src = sharp(resolve(inputPath))
const meta = await src.metadata()
const srcWidth  = meta.width
const srcHeight = meta.height

const frameW = Math.floor(srcWidth  / srcCols)
const frameH = Math.floor(srcHeight / srcRows)
const totalSrcFrames = srcCols * srcRows
const framesToUse = Math.min(totalSrcFrames, maxFrames, MAX_OUT_FRAMES)

console.log(`Source: ${srcWidth}x${srcHeight}  →  ${srcCols}×${srcRows} grid  (${frameW}×${frameH}px per frame, ${totalSrcFrames} frames)`)
console.log(`Using ${framesToUse} frames  →  ${OUT_COLS}×${OUT_ROWS} grid at ${OUT_FRAME_SIZE}×${OUT_FRAME_SIZE}px`)

// ── Extract + process each frame ──────────────────────────────────────────────

const srcBuffer = await sharp(resolve(inputPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

async function extractFrame(index) {
  const col = index % srcCols
  const row = Math.floor(index / srcCols)
  const left = col * frameW
  const top  = row * frameH

  let pipeline = sharp(resolve(inputPath))
    .extract({ left, top, width: frameW, height: frameH })
    .ensureAlpha()

  if (fitMode === 'fill') {
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, { fit: 'fill' })
  } else if (fitMode === 'cover') {
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, { fit: 'cover' })
  } else {
    // contain — pad with transparency to maintain aspect ratio
    pipeline = pipeline.resize(OUT_FRAME_SIZE, OUT_FRAME_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  }

  if (blackToAlpha) {
    const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
    const pixels = new Uint8Array(data)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2]
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      if (brightness <= blackThresh) {
        pixels[i+3] = 0
      }
    }
    return sharp(Buffer.from(pixels), {
      raw: { width: OUT_FRAME_SIZE, height: OUT_FRAME_SIZE, channels: 4 },
    }).png().toBuffer()
  }

  return pipeline.png().toBuffer()
}

// ── Assemble output sheet ─────────────────────────────────────────────────────

console.log('Extracting frames …')
const frameBuffers = []
for (let i = 0; i < framesToUse; i++) {
  process.stdout.write(`  frame ${i + 1}/${framesToUse}\r`)
  frameBuffers.push(await extractFrame(i))
}
console.log()

// If source has fewer than 30 frames, loop to fill the grid
while (frameBuffers.length < MAX_OUT_FRAMES) {
  const src = frameBuffers[frameBuffers.length % framesToUse]
  frameBuffers.push(src)
}

console.log('Assembling output sheet …')
const compositeOps = frameBuffers.map((buf, i) => ({
  input: buf,
  left: (i % OUT_COLS) * OUT_FRAME_SIZE,
  top:  Math.floor(i / OUT_COLS) * OUT_FRAME_SIZE,
}))

const outDir = dirname(resolve(outputPath))
mkdirSync(outDir, { recursive: true })

await sharp({
  create: {
    width: OUT_WIDTH,
    height: OUT_HEIGHT,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(compositeOps)
  .png()
  .toFile(resolve(outputPath))

console.log(`✓ Saved to ${outputPath}`)
console.log(`  Output: ${OUT_WIDTH}×${OUT_HEIGHT}px  |  ${OUT_COLS}×${OUT_ROWS} grid  |  ${OUT_FRAME_SIZE}×${OUT_FRAME_SIZE}px per frame`)
