import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SECTION_SLUGS } from './config/sections';

// A typo here should fail the build, not silently drop the cross-listing.
const sectionSlug = z.enum(SECTION_SLUGS as [string, ...string[]]);

const paintingSchema = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  location: z.string().optional(),
  medium: z.string().optional(),
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  category: z.string().optional(),
  // Extra sections this piece appears in, on top of its own.
  alsoIn: z.array(sectionSlug).default([]),
  cover: z.string(),
  images: z.array(z.string()).default([]),
});

const painting = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }),
    schema: paintingSchema,
  });

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    templateKey: z.string().optional(),
    thumbnail: z.string().optional(),
    portrait: z.string().optional(),
    background: z.string().optional(),
    instagram: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const collections = {
  studio: painting('studio'),
  urban: painting('urban'),
  pleinair: painting('pleinair'),
  artifacts: painting('artifacts'),
  pages,
};
