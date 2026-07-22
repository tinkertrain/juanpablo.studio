#!/usr/bin/env node
// Batch-compress images for the web with MozJPEG, mirroring the settings I
// used to click through one by one in Squoosh (MozJPEG, quality 75, 1600px).
//
// Usage:
//   node scripts/compress-images.mjs [inputDir] [options]
//
//   inputDir            Folder of source images (default: raw-images/)
//   --out <dir>         Output folder (default: public/img)
//   --quality <n>       MozJPEG quality 1-100 (default: 75)
//   --width <n>         Max width in px, never upscales (default: 1600)
//   --pano-width <n>    Max width for wide panoramas (default: 2400)
//   --pano-ratio <n>    Width/height at or above which an image counts as a
//                       panorama and gets --pano-width (default: 2.2)
//
// Every image is re-encoded to .jpg. Originals are left untouched; drop them
// in raw-images/ (gitignored) so they never get pushed.

import { readdir, mkdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const DEFAULTS = {
  input: "raw-images",
  out: "public/img",
  quality: 75,
  width: 1600,
  panoWidth: 2400,
  panoRatio: 2.2,
};
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif"]);

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") opts.out = argv[++i];
    else if (arg === "--quality") opts.quality = Number(argv[++i]);
    else if (arg === "--width") opts.width = Number(argv[++i]);
    else if (arg === "--pano-width") opts.panoWidth = Number(argv[++i]);
    else if (arg === "--pano-ratio") opts.panoRatio = Number(argv[++i]);
    else rest.push(arg);
  }
  if (rest[0]) opts.input = rest[0];
  return opts;
}

function fmtBytes(n) {
  return n > 1e6 ? `${(n / 1e6).toFixed(1)}MB` : `${(n / 1e3).toFixed(0)}KB`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let entries;
  try {
    entries = await readdir(opts.input);
  } catch {
    console.error(`Input folder not found: ${opts.input}`);
    console.error(`Create it and drop your originals in, or pass a path: node scripts/compress-images.mjs <dir>`);
    process.exit(1);
  }

  const images = entries.filter((f) => SOURCE_EXT.has(parse(f).ext.toLowerCase()));
  if (images.length === 0) {
    console.error(`No images found in ${opts.input}`);
    process.exit(1);
  }

  await mkdir(opts.out, { recursive: true });
  console.log(
    `Compressing ${images.length} image(s): MozJPEG q${opts.quality}, max ${opts.width}px wide ` +
      `(${opts.panoWidth}px for panoramas >= ${opts.panoRatio}:1)`,
  );
  console.log(`  ${opts.input}/  ->  ${opts.out}/\n`);

  let totalIn = 0;
  let totalOut = 0;

  for (const file of images) {
    const inPath = join(opts.input, file);
    const outPath = join(opts.out, `${parse(file).name}.jpg`);
    try {
      const inSize = (await stat(inPath)).size;

      // Wide panoramas (e.g. sketchbook spreads) lose too much detail at the
      // standard cap, so give them a higher one. Account for EXIF orientation
      // when measuring the aspect ratio.
      const meta = await sharp(inPath).metadata();
      let [w, h] = [meta.width, meta.height];
      if (meta.orientation >= 5) [w, h] = [h, w];
      const targetWidth = w / h >= opts.panoRatio ? opts.panoWidth : opts.width;

      const info = await sharp(inPath)
        .rotate() // respect EXIF orientation
        .resize({ width: targetWidth, withoutEnlargement: true })
        .jpeg({ quality: opts.quality, mozjpeg: true })
        .toFile(outPath);
      const saved = (1 - info.size / inSize) * 100;
      totalIn += inSize;
      totalOut += info.size;
      console.log(
        `  ${file}  ${fmtBytes(inSize)} -> ${fmtBytes(info.size)}  (-${saved.toFixed(0)}%, ${info.width}x${info.height})`,
      );
    } catch (err) {
      console.error(`  ${file}  FAILED: ${err.message}`);
    }
  }

  if (totalIn > 0) {
    const saved = (1 - totalOut / totalIn) * 100;
    console.log(`\nDone. ${fmtBytes(totalIn)} -> ${fmtBytes(totalOut)}  (-${saved.toFixed(0)}% overall)`);
  }
}

main();
