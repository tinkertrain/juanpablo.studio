const CM_PER_INCH = 2.54;

// Keep one decimal, but drop it when it adds nothing ("30.0" -> "30").
const trim = (value: number) => Number(value.toFixed(1)).toString();

/**
 * "30cm x 40cm (11.8in x 15.7in)" from centimeter dimensions.
 * Returns null unless both dimensions are present and positive.
 */
export function formatSize(width?: number, height?: number): string | null {
  if (!width || !height || width <= 0 || height <= 0) return null;

  const cm = `${trim(width)}cm x ${trim(height)}cm`;
  const inches = `${trim(width / CM_PER_INCH)}in x ${trim(height / CM_PER_INCH)}in`;

  return `${cm} (${inches})`;
}
