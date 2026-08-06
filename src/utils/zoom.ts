/**
 * Zoom and pan arithmetic for the lightbox.
 *
 * All coordinates are relative to the centre of the stage, so the image at its
 * fit position sits at the origin. Scale 1 means fit-to-viewport. Keeping this
 * DOM-free is what makes it testable, which matters because the pan clamp and
 * the focus-preserving zoom are where the off-by-ones live.
 */

/** Fully zoomed out: the image fits the viewport. */
export const MIN_SCALE = 1;

/**
 * Every image gets at least this much zoom range, even when it lacks the pixels
 * to fill it. Below roughly this much magnification the control reads as broken,
 * and a photo of a painting upscaled a little looks soft rather than pixelated.
 */
export const MIN_MAX_SCALE = 2.5;

export interface Pan {
  tx: number;
  ty: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * How far this particular image can be zoomed: up to one image pixel per screen
 * pixel, but never less than {@link MIN_MAX_SCALE}. Deriving the ceiling from
 * the image itself means re-exporting sources at a higher resolution deepens the
 * zoom with no code change.
 */
export function maxScaleFor(naturalWidth: number, renderedWidth: number): number {
  if (!(naturalWidth > 0) || !(renderedWidth > 0)) return MIN_MAX_SCALE;
  return Math.max(naturalWidth / renderedWidth, MIN_MAX_SCALE);
}

export function clampScale(scale: number, maxScale: number): number {
  return Math.min(Math.max(scale, MIN_SCALE), Math.max(maxScale, MIN_SCALE));
}

/**
 * Pan offsets for a scale change that holds `focus` still. A point at image
 * offset `u` renders at `tx + scale * u`, so preserving it means solving
 * `tx' + nextScale * u = focus` for the new offset.
 */
export function zoomAt(pan: Pan, scale: number, nextScale: number, focus: Point): Pan {
  const ratio = nextScale / scale;
  return {
    tx: focus.x - ratio * (focus.x - pan.tx),
    ty: focus.y - ratio * (focus.y - pan.ty),
  };
}

/**
 * Keeps the image edges from drifting inside the viewport. An axis with no
 * overflow is pinned to centred, which is why zooming back out always lands the
 * image where it started.
 */
export function clampPan(pan: Pan, scale: number, image: Size, viewport: Size): Pan {
  const axis = (offset: number, imageLength: number, viewportLength: number) => {
    const slack = (imageLength * scale - viewportLength) / 2;
    if (slack <= 0) return 0;
    return Math.min(Math.max(offset, -slack), slack);
  };

  return {
    tx: axis(pan.tx, image.width, viewport.width),
    ty: axis(pan.ty, image.height, viewport.height),
  };
}
