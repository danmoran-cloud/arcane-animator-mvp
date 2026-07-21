# UVTT Integration — Design Note

Status: **design + parser scaffolding only.** Not wired to any UI or store action yet.
Scaffolding lives in [`lib/uvtt/`](lib/uvtt) (`types.ts`, `parse.ts`).

## Goal

Let Arcane Animator work with the **Universal VTT** format (`.dd2vtt` / `.uvtt`) so a
map's walls, doors, and light sources can be used with our animated maps.

## The one fact that shapes everything

A `.dd2vtt` file carries **two fundamentally different kinds of thing**:

1. A **map image** — pixels.
2. **Interactivity data** — walls (`line_of_sight`), doors (`portals`), and
   `lights`, expressed in grid-square coordinates.

The interactivity data is **instructions the destination VTT's engine runs at play
time**, based on where each token is standing ("block vision here; cast a shadow
when a token is there"). It is not pixels.

Arcane Animator exports a **flat WebM video** (see
[`components/editor/export-modal.tsx`](components/editor/export-modal.tsx)). A video
has no engine and no tokens, so **true dynamic lighting cannot be baked into it.**
This is true of *any* animated map, not a limitation specific to us.

## The "two lanes" model

A finished, in-play map is two layers riding side by side into the VTT (Foundry):

| Lane | What it is | Who honors it |
|------|------------|---------------|
| **Animated art** | Our Arcane Animator WebM (torches, water, magic) | Plays as the map's background image / tile |
| **Interactivity** | UVTT walls / doors / lights data | Foundry's lighting engine, live, per token |

Arcane Animator produces lane 1. UVTT carries lane 2. Our job is to **shuttle lane 2
through without losing it** — not to merge both into one file (which isn't possible).

## What will and won't work

- ❌ The Arcane Animator export will **not contain** working dynamic lighting.
- ✅ The export can **travel alongside** the UVTT data so the GM gets both animation
  and dynamic lighting in Foundry.
- ✅ The clean, no-caveats win is **import** — using UVTT data to auto-place our
  effects.

## Two directions

### Direction A — Import UVTT  *(do first; high value, low risk)*

Read a `.dd2vtt`, and inside the editor:

- Decode the embedded PNG → base **map layer**; set grid size from
  `pixels_per_grid`.
- **Auto-place our animated light effects** at each `lights[].position` (the
  differentiator: the file tells us exactly where every light belongs).
- Use `line_of_sight` walls as effect **exclusion zones** so effects don't bleed
  through walls.

This is a genuinely differentiated feature: *"drop in your Dungeondraft/Foundry map,
get it animated with the lights already placed."*

### Direction B — Export UVTT  *(do next, scoped to Foundry)*

On export, hand the GM **two files**:

1. The **animated WebM** (our product).
2. A **`.dd2vtt`** that round-trips the original walls/doors/lights data.

**Foundry workflow:** import the `.dd2vtt` to set up walls + dynamic lighting
automatically, then swap the static background for our animated WebM. Result: a map
that is both animated **and** dynamically lit — because Foundry layers our video
*under* its own lighting, not because the video contains the lighting.

**Caveat:** the UVTT `image` field expects a **static PNG**, so standard importers
won't accept an animated WebM there. Hence "two files delivered together."

## Platform reality

- **Foundry VTT** — imports UVTT natively. Primary target.
- **Roll20** — **no** native UVTT import; needs a paid (Pro) importer mod. Weak
  target; do not design around it.
- **Dungeondraft** — the common *source* of `.dd2vtt` files.

## Coordinate transform (the crux of the parser)

UVTT coordinates are in **grid-square units**, offset from `map_origin`. Our canvas is
capped by `fitToMaxEdge` (max edge 2560px, in [`lib/editor-store.tsx`](lib/editor-store.tsx)),
so source-image pixels and canvas units differ by a scale factor.

The parser derives one `scale` and expresses **everything** (walls, portals, light
centers and radii) in canvas units, with `gridSizeCanvasPx = pixels_per_grid * scale`.
Image dimensions come straight from `map_size * pixels_per_grid`, so no image decoding
is needed.

## Walls → exclusions is imperfect (and the code is honest about it)

Our `ExclusionZone` is a **filled region** (normalized 0..1 points). UVTT walls are
**open polylines**. So `wallLoopToExclusion` only converts *closed* loops and returns
`null` otherwise. Open walls are retained as `CanvasPolyline`s (for visualization /
round-trip), not forced into a shape they aren't.

## Current code

[`lib/uvtt/types.ts`](lib/uvtt/types.ts) — UVTT spec types + a canvas-space
`UvttImportResult`.

[`lib/uvtt/parse.ts`](lib/uvtt/parse.ts):

| Function | Purpose |
|----------|---------|
| `parseUvtt(text)` | File text → validated, canvas-space `UvttImportResult` |
| `buildMapLayer(result, name)` | Pinned base `MapLayer` from the embedded PNG |
| `buildGridLayer(result)` | `GridLayer` with `gridSize` = UVTT `pixels_per_grid` |
| `buildLightLayers(result, defaults, z)` | One `ExpandedEffectLayer` per UVTT light |
| `wallLoopToExclusion(wall, bounds)` | Closed wall loop → normalized `ExclusionZone` |

Not yet wired: no importer UI, no store action. Integration path (one `TODO` in
`parse.ts`): read a `File` → `parseUvtt` → dispatch `ADD_LAYER` (map, with
`canvasSize`) → add grid + light layers (look up `defaultSettings` from
`effectsLibrary` by `effectId`). Direction B reuses `result.raw`.

## Open questions

- Export packaging: two separate downloads, or a `.zip` bundling WebM + `.dd2vtt`?
- Do we surface imported walls/lights visually in the editor, or use them silently?
- Light effect mapping: always `torch`, or pick per light color/range?
