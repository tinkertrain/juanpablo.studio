// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: 'https://clay-astro-theme.netlify.app',
    integrations: [sitemap()],
    adapter: cloudflare()
});