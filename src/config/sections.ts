export type Section = {
  slug: string;
  collection: 'studio' | 'urban' | 'pleinair';
  title: string;
  hasCategories: boolean;
  categories: string[];
};

export const SECTIONS: Section[] = [
  {
    slug: 'studio-paintings',
    collection: 'studio',
    title: 'Studio Paintings',
    hasCategories: true,
    categories: ['oil', 'watercolor', 'gouache', 'acrylic', 'mixed-media', 'other'],
  },
  {
    slug: 'urban-sketching',
    collection: 'urban',
    title: 'Urban Sketching',
    hasCategories: false,
    categories: [],
  },
  {
    slug: 'plein-air',
    collection: 'pleinair',
    title: 'Plein Air',
    hasCategories: false,
    categories: [],
  },
];

export function getSectionBySlug(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export function categoryLabel(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function sectionUrl(section: Section): string {
  return `/${section.slug}`;
}

export function categoryUrl(section: Section, category: string): string {
  return `/${section.slug}/${category}`;
}

export function paintingUrl(
  section: Section,
  id: string,
  category?: string,
): string {
  if (section.hasCategories && category) {
    return `/${section.slug}/${category}/${id}`;
  }
  return `/${section.slug}/${id}`;
}

export function filterPaintings<T extends { data: { category?: string } }>(
  paintings: T[],
  category?: string | null,
): T[] {
  if (!category) return paintings;
  return paintings.filter((p) => p.data.category === category);
}
