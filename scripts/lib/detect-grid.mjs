/**
 * detect-grid.mjs — sprite-sheet grid detection.
 *
 * These sheets are AI-generated and do NOT share a uniform grid, so the cols/rows
 * must be measured per sheet. Detection uses alpha-projection gap analysis: a
 * regular grid leaves evenly-spaced gutters of empty space between frames. It is
 * reliable for well-separated sprites and reports LOW confidence for full-bleed /
 * very sparse sheets where the grid is ambiguous from pixels alone — those should
 * be confirmed by a human against the overlay image.
 */

import sharp from 'sharp'

// Contiguous runs of "content" in a 1-D projection, merged across tiny gaps.
function bands(profile, span) {
  const thr = Math.max(1, span * 0.015)
  const runs = []
  let start = -1
  for (let k = 0; k < profile.length; k++) {
    if (profile[k] > thr) {
      if (start < 0) start = k
    } else if (start >= 0) {
      runs.push([start, k - 1])
      start = -1
    }
  }
  if (start >= 0) runs.push([start, profile.length - 1])

  const minGap = span * 0.015
  const merged = []
  for (const r of runs) {
    if (merged.length && r[0] - merged[merged.length - 1][1] < minGap) {
      merged[merged.length - 1][1] = r[1]
    } else {
      merged.push([...r])
    }
  }
  return merged.filter((r) => r[1] - r[0] > span * 0.04)
}

function coefficientOfVariation(arr) {
  if (arr.length === 0) return 1
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  if (mean === 0) return 1
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length
  return Math.sqrt(variance) / mean
}

// Confidence that a band count reflects a real, regular grid on one axis.
// gapFraction (share of the projection that is empty gutter) gates it: a
// full-bleed sheet has almost no gutters, so even "regular" bands there are not
// trustworthy.
function axisConfidence(bandList, gapFraction) {
  const n = bandList.length
  if (n < 1) return 0
  const gapClarity = Math.max(0, Math.min(1, (gapFraction - 0.02) / 0.1))
  if (n === 1) return 0.15 * gapClarity // likely full-bleed; grid is ambiguous
  const widths = bandList.map((b) => b[1] - b[0])
  const centers = bandList.map((b) => (b[0] + b[1]) / 2)
  const gaps = []
  for (let i = 1; i < centers.length; i++) gaps.push(centers[i] - centers[i - 1])
  // Regular grid → uniform band widths AND uniform spacing → low CV → high score.
  const reg = 1 - (coefficientOfVariation(widths) + coefficientOfVariation(gaps))
  return Math.max(0, Math.min(1, reg)) * gapClarity
}

// Strong structural prior: if both dimensions divide evenly by a common cell
// size, that grid is almost certainly the real one (these assets are built on
// 128px cells). Used to confirm sheets where gap detection fails (full-bleed/sparse).
export function cellSizeHint(W, H) {
  for (const cell of [128, 96, 64]) {
    if (W % cell === 0 && H % cell === 0) {
      const cols = W / cell
      const rows = H / cell
      if (cols >= 1 && cols <= 12 && rows >= 1 && rows <= 12) {
        return { cell, cols, rows, frames: cols * rows }
      }
    }
  }
  return null
}

/**
 * Detect the frame grid of a sprite sheet.
 * @returns {{ W, H, cols, rows, frames, confidence, label, colBands, rowBands }}
 */
export async function detectGrid(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: ch } = info

  let alphaMax = 0
  for (let p = 0, i = 0; p < W * H; p++, i += ch) {
    if (data[i + 3] > alphaMax) alphaMax = data[i + 3]
  }
  // Transparent-background sheets key off alpha; opaque/white ones key off non-white.
  const useAlpha = alphaMax > 40

  const colHas = new Array(W).fill(0)
  const rowHas = new Array(H).fill(0)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch
      let content
      if (useAlpha) {
        content = data[i + 3] > 30
      } else {
        content = !(data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240)
      }
      if (content) {
        colHas[x]++
        rowHas[y]++
      }
    }
  }

  const colBands = bands(colHas, H)
  const rowBands = bands(rowHas, W)
  const cols = colBands.length
  const rows = rowBands.length

  // Fraction of each axis that is empty gutter (clear separation between frames).
  const colThr = Math.max(1, H * 0.015)
  const rowThr = Math.max(1, W * 0.015)
  const colGapFraction = colHas.filter((v) => v <= colThr).length / W
  const rowGapFraction = rowHas.filter((v) => v <= rowThr).length / H

  const confidence = axisConfidence(colBands, colGapFraction) * axisConfidence(rowBands, rowGapFraction)
  const label = confidence > 0.6 ? 'high' : confidence > 0.3 ? 'medium' : 'low'

  return {
    W, H, cols, rows, frames: cols * rows,
    confidence, label, colBands, rowBands, useAlpha,
    cellHint: cellSizeHint(W, H),
  }
}

/**
 * Write a review image: the sheet darkened with red/green lines at the detected
 * frame boundaries, so a human can confirm the grid (essential for low-confidence
 * full-bleed sheets).
 */
export async function writeOverlay(file, grid, outPath) {
  const { W, H, colBands, rowBands } = grid
  const rects = []
  for (const b of colBands) {
    rects.push(`<rect x="${b[0]}" y="0" width="3" height="${H}" fill="red"/>`)
    rects.push(`<rect x="${b[1] - 2}" y="0" width="3" height="${H}" fill="lime"/>`)
  }
  for (const b of rowBands) {
    rects.push(`<rect x="0" y="${b[0]}" width="${W}" height="3" fill="red"/>`)
    rects.push(`<rect x="0" y="${b[1] - 2}" width="${W}" height="3" fill="lime"/>`)
  }
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g opacity="0.6">${rects.join('')}</g></svg>`,
  )
  // Pre-rasterize the SVG to exact pixel size before compositing (sharp rejects
  // a composite layer larger than the base).
  const overlay = await sharp(svg).resize(W, H).png().toBuffer()
  const base = await sharp(file).flatten({ background: '#202028' }).resize(W, H).toBuffer()
  await sharp(base).composite([{ input: overlay }]).png().toFile(outPath)
}
