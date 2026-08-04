import { describe, it, expect } from 'vitest';
import {
  SECTIONS,
  getSectionBySlug,
  categoryLabel,
  sectionUrl,
  categoryUrl,
  paintingUrl,
  filterPaintings,
  availableCategories,
  SECTION_SLUGS,
  sectionForCollection,
  sectionFromPath,
  crossListedInto,
} from './sections';

const studio = getSectionBySlug('studio-paintings')!;
const urban = getSectionBySlug('urban-sketching')!;
const artifacts = getSectionBySlug('artifacts')!;

describe('sections config', () => {
  it('defines exactly four sections', () => {
    expect(SECTIONS.map((s) => s.slug)).toEqual([
      'studio-paintings',
      'urban-sketching',
      'plein-air',
      'artifacts',
    ]);
  });

  it('exposes every slug as a cross-listing target', () => {
    expect(SECTION_SLUGS).toEqual(SECTIONS.map((s) => s.slug));
  });

  it('only studio has categories', () => {
    expect(studio.hasCategories).toBe(true);
    expect(studio.categories).toContain('mixed-media');
    expect(urban.hasCategories).toBe(false);
    expect(urban.categories).toEqual([]);
    expect(artifacts.hasCategories).toBe(false);
    expect(artifacts.categories).toEqual([]);
  });

  it('builds flat artifact URLs', () => {
    expect(sectionUrl(artifacts)).toBe('/artifacts');
    expect(paintingUrl(artifacts, 'painted-lampshade')).toBe(
      '/artifacts/painted-lampshade',
    );
  });

  it('maps a collection back to its section', () => {
    expect(sectionForCollection('artifacts')).toBe(artifacts);
    expect(sectionForCollection('pleinair')?.slug).toBe('plein-air');
    expect(sectionForCollection('nope')).toBeUndefined();
  });

  it('looks up sections by slug', () => {
    expect(getSectionBySlug('plein-air')?.collection).toBe('pleinair');
    expect(getSectionBySlug('nope')).toBeUndefined();
  });

  it('humanizes category labels', () => {
    expect(categoryLabel('oil')).toBe('Oil');
    expect(categoryLabel('mixed-media')).toBe('Mixed Media');
  });

  it('builds section and category URLs', () => {
    expect(sectionUrl(studio)).toBe('/studio-paintings');
    expect(categoryUrl(studio, 'oil')).toBe('/studio-paintings/oil');
  });

  it('builds painting URLs with and without a category', () => {
    expect(paintingUrl(studio, 'misty-morning', 'oil')).toBe(
      '/studio-paintings/oil/misty-morning',
    );
    expect(paintingUrl(urban, 'via-garibaldi')).toBe(
      '/urban-sketching/via-garibaldi',
    );
  });

  it('filters paintings by category, passing all when no category', () => {
    const items = [
      { data: { category: 'oil' } },
      { data: { category: 'gouache' } },
    ];
    expect(filterPaintings(items, 'oil')).toHaveLength(1);
    expect(filterPaintings(items, null)).toHaveLength(2);
  });

  it('lists only categories present in the paintings', () => {
    const items = [
      { data: { category: 'gouache' } },
      { data: { category: 'oil' } },
    ];
    expect(availableCategories(studio, items)).toEqual(['oil', 'gouache']);
  });

  it('preserves the defined category order, not content order', () => {
    const items = [
      { data: { category: 'mixed-media' } },
      { data: { category: 'oil' } },
    ];
    expect(availableCategories(studio, items)).toEqual(['oil', 'mixed-media']);
  });

  it('returns no categories for a section without categories', () => {
    const items = [{ data: { category: 'oil' } }];
    expect(availableCategories(urban, items)).toEqual([]);
  });

  it('returns no categories when nothing matches the defined list', () => {
    const items = [{ data: {} }, { data: { category: 'pastel' } }];
    expect(availableCategories(studio, items)).toEqual([]);
  });
});

describe('sectionFromPath', () => {
  it('matches a section index, with or without a trailing slash', () => {
    expect(sectionFromPath('/plein-air')).toBe(getSectionBySlug('plein-air'));
    expect(sectionFromPath('/plein-air/')).toBe(getSectionBySlug('plein-air'));
  });

  it('matches pages nested under a section', () => {
    expect(sectionFromPath('/studio-paintings/oil')).toBe(studio);
    expect(sectionFromPath('/studio-paintings/oil/misty-morning')).toBe(studio);
    expect(sectionFromPath('/artifacts/painted-lampshade')).toBe(artifacts);
  });

  it('matches nothing outside the sections', () => {
    expect(sectionFromPath('/')).toBeUndefined();
    expect(sectionFromPath('/about')).toBeUndefined();
    expect(sectionFromPath('/oil/studio-paintings')).toBeUndefined();
  });
});

describe('cross-listing', () => {
  const scroll = { collection: 'studio', data: { alsoIn: ['artifacts'] } };
  const lamp = { collection: 'artifacts', data: { alsoIn: [] } };
  const sketch = { collection: 'urban', data: {} };
  const all = [scroll, lamp, sketch];

  it('pulls in pieces that ask for this section', () => {
    expect(crossListedInto(artifacts, all)).toEqual([scroll]);
  });

  it('never pulls in a piece from the section itself', () => {
    const homebound = { collection: 'artifacts', data: { alsoIn: ['artifacts'] } };
    expect(crossListedInto(artifacts, [homebound])).toEqual([]);
  });

  it('ignores pieces with no cross-listing at all', () => {
    expect(crossListedInto(studio, all)).toEqual([]);
    expect(crossListedInto(urban, all)).toEqual([]);
  });
});
