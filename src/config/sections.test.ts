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
} from './sections';

const studio = getSectionBySlug('studio-paintings')!;
const urban = getSectionBySlug('urban-sketching')!;

describe('sections config', () => {
  it('defines exactly three sections', () => {
    expect(SECTIONS.map((s) => s.slug)).toEqual([
      'studio-paintings',
      'urban-sketching',
      'plein-air',
    ]);
  });

  it('only studio has categories', () => {
    expect(studio.hasCategories).toBe(true);
    expect(studio.categories).toContain('mixed-media');
    expect(urban.hasCategories).toBe(false);
    expect(urban.categories).toEqual([]);
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
