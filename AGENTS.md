## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Images

Artwork lives in `src/assets/img/` and is referenced from frontmatter as
`/src/assets/img/<file>.jpg`, which `src/utils/images.ts` resolves so Astro can
emit resized WebP variants. Decap writes that same path (`public_folder` in
`public/admin/config.yml`).

Only images that a CSS `url()` or an absolute social URL needs stay in
`public/img/`; those cannot go through the image pipeline.

That frontmatter path is build-time only, so Decap's preview pane and its image
widget thumbnails would 404 on it. `src/pages/src/assets/img/[...file].ts`
redirects the path to the hashed asset Astro emits, which is the only reason the
CMS can display saved artwork.

`npm run compress` re-encodes originals from `raw-images/` into
`src/assets/img/`.

## Styles

Three global stylesheets, imported by `src/layouts/Layout.astro`:
`vars.css` (tokens), `base.css` (reset plus the prose typography that markdown
bodies need, since scoped styles do not reach `<Content />`), and `layout.css`
(header, nav, footer). Everything else belongs in a component's own `<style>`.

There is no PostCSS config on purpose. Vite handles `@import`, and custom
properties must stay live at runtime or `[data-theme='dark']` cannot override
them. Use `color-mix()` for tints.

## Deployment

Cloudflare is set up to auto-deploy on push to `main`. Pushing (or merging a PR)
ships the change to https://juanpablo.studio, so there is no need to run
`npm run deploy` manually.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
