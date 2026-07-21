// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";
import ogImages from "./src/integrations/og-images.mjs";

// https://astro.build/config
export default defineConfig({
    site: 'https://juanpablo.studio',
    integrations: [sitemap(), ogImages()],
    adapter: cloudflare()
});