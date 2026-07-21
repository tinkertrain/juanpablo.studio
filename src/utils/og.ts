// Maps a painting cover path (e.g. /img/Foo.jpg) to its downscaled social
// share image emitted at build time by the og-images integration.
export function ogImagePath(cover: string): string {
  const base = cover.split('/').pop()!.replace(/\.[^.]+$/, '');
  return `/img/og/${base}.jpg`;
}
