import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import type { AstroIntegration } from 'astro';
import { SECTIONS } from '../config/sections';
import { ogImagePath } from '../utils/og';

// Full-resolution covers are multiple MB, which social scrapers (WhatsApp,
// iMessage) silently reject, so we emit a downscaled JPG per cover that
// og:image can point at. Both sides of that contract come from `ogImagePath`,
// so the path can only ever be defined in one place.
async function collectCovers(root: string): Promise<string[]> {
  const covers = new Set<string>();

  for (const { collection } of SECTIONS) {
    const dir = path.join(root, 'src/content', collection);
    if (!existsSync(dir)) continue;

    for (const file of await readdir(dir)) {
      if (!file.endsWith('.md')) continue;
      const md = await readFile(path.join(dir, file), 'utf8');
      const match = md.match(/^cover:\s*(.+)$/m);
      if (match) covers.add(match[1].trim().replace(/^["']|["']$/g, ''));
    }
  }

  return [...covers];
}

export default function ogImages(): AstroIntegration {
  return {
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = process.cwd();
        const clientDir = fileURLToPath(dir);

        let count = 0;
        for (const cover of await collectCovers(root)) {
          // Covers are project-root-absolute (/src/assets/img/...), the same
          // string the CMS writes and `resolveImage` looks up.
          const src = path.join(root, cover);
          if (!existsSync(src)) {
            logger.warn(`cover not found, skipping OG image: ${cover}`);
            continue;
          }

          const out = path.join(clientDir, ogImagePath(cover));
          await mkdir(path.dirname(out), { recursive: true });
          await sharp(src)
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 78 })
            .toFile(out);
          count++;
        }

        logger.info(`Generated ${count} OG share image(s) in /img/og/`);
      },
    },
  };
}
