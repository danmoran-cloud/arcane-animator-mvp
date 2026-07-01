// Effects render spine. Import from here to get the render contract + registry;
// importing this module also registers the built-in renderers. New backends
// (particle/Pixi, vector/Lottie) register here as they land.

import { registerRenderer } from './render-core'
import { spriteRenderer } from './sprite-renderer'
import { particleRenderer } from './particle-renderer'
import { vectorRenderer } from './vector-renderer'
import { vectorFxRenderer } from './vector-fx'

registerRenderer(spriteRenderer)
registerRenderer(particleRenderer)
registerRenderer(vectorRenderer)
registerRenderer(vectorFxRenderer)

export * from './render-core'
export { loadAssets, loadImage, getCachedImage } from './image-cache'
export { subscribeFrame, getRenderScale } from './clock'
export { clipToExclusions } from './mask'
