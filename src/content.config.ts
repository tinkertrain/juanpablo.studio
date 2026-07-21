import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const paintingSchema = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  location: z.string().optional(),
  medium: z.string().optional(),
  category: z.string().optional(),
  cover: z.string().optional(),
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
  pages,
};
