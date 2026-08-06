import { describe, it, expect } from 'vitest';
import { MIN_MAX_SCALE, maxScaleFor, clampScale, zoomAt, clampPan } from './zoom';

describe('maxScaleFor', () => {
  it('returns the native pixel ratio when the image has resolution to spare', () => {
    // Napoli.jpg is 2296px wide, shown at 700px in a tall viewport.
    expect(maxScaleFor(2296, 700)).toBeCloseTo(3.28, 2);
  });

  it('holds the floor when the native ratio is too small to be usable', () => {
    // A 1600px image already displayed at 900px would only allow 1.78x.
    expect(maxScaleFor(1600, 900)).toBe(MIN_MAX_SCALE);
  });

  it('holds the floor when the image is displayed larger than its own pixels', () => {
    expect(maxScaleFor(800, 1200)).toBe(MIN_MAX_SCALE);
  });

  it('holds the floor when dimensions are not measurable yet', () => {
    expect(maxScaleFor(0, 0)).toBe(MIN_MAX_SCALE);
    expect(maxScaleFor(1600, 0)).toBe(MIN_MAX_SCALE);
  });
});

describe('clampScale', () => {
  it('never zooms out past fit', () => {
    expect(clampScale(0.4, 3)).toBe(1);
  });

  it('never zooms in past the ceiling', () => {
    expect(clampScale(9, 3)).toBe(3);
  });

  it('passes through a scale inside the range', () => {
    expect(clampScale(2.2, 3)).toBe(2.2);
  });
});

describe('zoomAt', () => {
  // Coordinates are relative to the centre of the stage, so the fit position
  // of the image is the origin.
  const at = (pan: { tx: number; ty: number }, scale: number, x: number, y: number) =>
    pan.tx + scale * x + 0 * y;

  it('leaves a centred image centred when zooming from the centre', () => {
    expect(zoomAt({ tx: 0, ty: 0 }, 1, 2, { x: 0, y: 0 })).toEqual({ tx: 0, ty: 0 });
  });

  it('keeps the point under the cursor fixed', () => {
    const focus = { x: 100, y: 50 };
    const next = zoomAt({ tx: 0, ty: 0 }, 1, 2, focus);

    // The image point that sat under the cursor was at image offset 100/50.
    // After doubling it must still land on the cursor.
    expect(next.tx + 2 * 100).toBe(focus.x);
    expect(next.ty + 2 * 50).toBe(focus.y);
  });

  it('keeps the point under the cursor fixed when already panned and zoomed', () => {
    const pan = { tx: -120, ty: 40 };
    const focus = { x: 30, y: -70 };
    const scale = 1.8;
    const nextScale = 2.6;

    const u = { x: (focus.x - pan.tx) / scale, y: (focus.y - pan.ty) / scale };
    const next = zoomAt(pan, scale, nextScale, focus);

    expect(next.tx + nextScale * u.x).toBeCloseTo(focus.x, 10);
    expect(next.ty + nextScale * u.y).toBeCloseTo(focus.y, 10);
  });

  it('is reversible, so zooming in then out returns to the starting pan', () => {
    const focus = { x: 210, y: -90 };
    const inward = zoomAt({ tx: 0, ty: 0 }, 1, 2.5, focus);
    const back = zoomAt(inward, 2.5, 1, focus);

    expect(back.tx).toBeCloseTo(0, 10);
    expect(back.ty).toBeCloseTo(0, 10);
  });

  it('does not let a vertical cursor offset move the image horizontally', () => {
    const next = zoomAt({ tx: 0, ty: 0 }, 1, 2, { x: 0, y: 120 });
    expect(next.tx).toBe(0);
    expect(at({ tx: next.tx, ty: next.ty }, 2, 0, 0)).toBe(0);
  });
});

describe('clampPan', () => {
  const image = { width: 800, height: 600 };
  const viewport = { width: 1000, height: 700 };

  it('centres an axis whose scaled image is smaller than the viewport', () => {
    expect(clampPan({ tx: 400, ty: -300 }, 1, image, viewport)).toEqual({ tx: 0, ty: 0 });
  });

  it('allows panning up to the edge once the image overflows', () => {
    // At 2x the image is 1600x1200, so slack is (1600-1000)/2 = 300 across
    // and (1200-700)/2 = 250 down.
    expect(clampPan({ tx: 120, ty: -80 }, 2, image, viewport)).toEqual({ tx: 120, ty: -80 });
  });

  it('stops at the edge rather than letting the image drift off screen', () => {
    expect(clampPan({ tx: 9999, ty: 9999 }, 2, image, viewport)).toEqual({ tx: 300, ty: 250 });
    expect(clampPan({ tx: -9999, ty: -9999 }, 2, image, viewport)).toEqual({ tx: -300, ty: -250 });
  });

  it('clamps each axis independently', () => {
    // At 1.5x the image is 1200x900: it overflows across but not down.
    expect(clampPan({ tx: 500, ty: 500 }, 1.5, image, viewport)).toEqual({ tx: 100, ty: 100 });
  });
});
