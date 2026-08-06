/**
 * Artwork lives in src/assets so Astro can resize and re-encode it, but the
 * paths in frontmatter are plain strings (that is what the CMS writes). This
 * maps one to the other at build time.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/img/**/*.{jpeg,jpg,png,webp,avif}',
  { eager: true },
);

export function resolveImage(src: string): ImageMetadata {
  const file = files[src];
  if (!file) {
    throw new Error(
      `No image at ${src}. Artwork belongs in src/assets/img/, referenced as /src/assets/img/<file>.`,
    );
  }
  return file.default;
}
