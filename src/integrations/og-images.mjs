import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

// Painting collections whose covers double as social share images.
const COLLECTIONS = ['studio', 'urban', 'pleinair'];

// Full-resolution covers are multiple MB, which social scrapers (WhatsApp,
// iMessage) silently reject, so we emit a downscaled JPG per cover that
// og:image can point at. Keep this in sync with `ogImagePath` in src/utils/og.ts.
async function collectCovers(root) {
  const covers = new Set();
  for (const collection of COLLECTIONS) {
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

export default function ogImages() {
  return {
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = process.cwd();
        const outDir = path.join(fileURLToPath(dir), 'img', 'og');
        await mkdir(outDir, { recursive: true });

        let count = 0;
        for (const cover of await collectCovers(root)) {
          const src = path.join(root, 'public', cover);
          if (!existsSync(src)) {
            logger.warn(`cover not found, skipping OG image: ${cover}`);
            continue;
          }
          const name = path.basename(cover).replace(/\.[^.]+$/, '') + '.jpg';
          await sharp(src)
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 78 })
            .toFile(path.join(outDir, name));
          count++;
        }
        logger.info(`Generated ${count} OG share image(s) in /img/og/`);
      },
    },
  };
}
