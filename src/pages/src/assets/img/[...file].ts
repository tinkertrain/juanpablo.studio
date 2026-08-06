import type { APIRoute } from 'astro';

/**
 * Frontmatter stores artwork as `/src/assets/img/<file>` (see src/utils/images.ts),
 * which is a build-time path, not a URL. Decap's preview pane and its image widget
 * thumbnails put that string straight into an `<img src>` at runtime, so without
 * this route they 404 and the editor shows broken images.
 *
 * Redirect to whatever hashed asset Vite emitted for the original.
 */
const urls = import.meta.glob<string>(
  '/src/assets/img/**/*.{jpeg,jpg,png,webp,avif}',
  { query: '?url', import: 'default', eager: true },
);

export const prerender = false;

export const GET: APIRoute = ({ params, redirect }) => {
  const url = urls[`/src/assets/img/${params.file}`];
  return url ? redirect(url, 302) : new Response(null, { status: 404 });
};
