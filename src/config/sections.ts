/** Every content collection that holds a piece of work. */
export type PaintingCollection = 'studio' | 'urban' | 'pleinair' | 'artifacts';

export type Section = {
  slug: string;
  collection: PaintingCollection;
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
  {
    slug: 'artifacts',
    collection: 'artifacts',
    title: 'Artifacts',
    hasCategories: false,
    categories: [],
  },
];

/** Slugs a piece may cross-list itself into via `alsoIn`. */
export const SECTION_SLUGS = SECTIONS.map((s) => s.slug);

export function getSectionBySlug(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

/**
 * The section a URL belongs to, matching a section index and everything under
 * it (`/plein-air`, `/plein-air/selles-sur-cher`). Used to mark the nav.
 */
export function sectionFromPath(pathname: string): Section | undefined {
  const [first] = pathname.split('/').filter(Boolean);
  return first ? getSectionBySlug(first) : undefined;
}

/**
 * The section a piece lives in, derived from its collection. A cross-listed
 * piece keeps this as its home, so it always links to its one canonical page.
 */
export function sectionForCollection(collection: string): Section | undefined {
  return SECTIONS.find((s) => s.collection === collection);
}

/**
 * Pieces from other collections that ask to appear in this section via
 * `alsoIn`. They are shown in the gallery but keep their canonical detail page.
 */
export function crossListedInto<
  T extends { collection: string; data: { alsoIn?: string[] } },
>(section: Section, all: T[]): T[] {
  return all.filter(
    (entry) =>
      entry.collection !== section.collection &&
      (entry.data.alsoIn ?? []).includes(section.slug),
  );
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

export function availableCategories<T extends { data: { category?: string } }>(
  section: Section,
  paintings: T[],
): string[] {
  if (!section.hasCategories) return [];
  const present = new Set(
    paintings.map((p) => p.data.category).filter(Boolean),
  );
  return section.categories.filter((cat) => present.has(cat));
}
