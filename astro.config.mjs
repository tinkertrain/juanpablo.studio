// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";
import ogImages from "./src/integrations/og-images.ts";

// https://astro.build/config
export default defineConfig({
    site: 'https://juanpablo.studio',
    integrations: [sitemap(), ogImages()],
    // `compile` resizes with sharp at build time and ships plain files. The
    // default would defer to a /_image endpoint, and sharp cannot run in a
    // Worker.
    adapter: cloudflare({ imageService: 'compile' })
});