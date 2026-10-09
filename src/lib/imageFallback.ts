/**
 * Image fallback helpers.
 *
 * Local assets (bundled imports, /public paths) are used first. When a local
 * path is missing or fails to load we fall back to a high-quality modern
 * product photo instead of rendering an empty gray box.
 */

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const FALLBACK_IMAGES = {
  kitchen: UNSPLASH('photo-1556909212-d5b604d0c90d'),
  appliances: UNSPLASH('photo-1584568694244-14fbdf83bd30'),
  electronics: UNSPLASH('photo-1498049794561-7780e7231661'),
  furniture: UNSPLASH('photo-1555041469-a586c61ea9bc'),
  generic: UNSPLASH('photo-1493666438817-866a91353ca9'),
} as const;

export type FallbackGroup = keyof typeof FALLBACK_IMAGES;

const GROUP_RULES: { group: FallbackGroup; match: RegExp }[] = [
  { group: 'kitchen', match: /kitchen|dining|cook|microwave|bathroom/i },
  { group: 'appliances', match: /appliance|laundry|washing|refrigerat|climate|garment/i },
  { group: 'electronics', match: /electronic|television|tv|audio|smart|gadget|office|fitness/i },
  { group: 'furniture', match: /furniture|storage|decor|living|outdoor|garden|baby|travel/i },
];

/** Resolve which fallback photo group a category slug/name belongs to. */
export const getFallbackGroup = (category?: string | null): FallbackGroup => {
  if (!category) return 'generic';
  return GROUP_RULES.find((r) => r.match.test(category))?.group ?? 'generic';
};

/** Get a high-quality fallback photo URL for a product category. */
export const getFallbackImage = (category?: string | null): string =>
  FALLBACK_IMAGES[getFallbackGroup(category)];

/** True when the source points at a bundled/local/public asset path. */
export const isLocalAsset = (src?: string | null): boolean =>
  !!src && !/^https?:\/\//i.test(src);

/** Normalise a possibly-empty image source into something renderable. */
export const resolveImageSrc = (
  src: string | null | undefined,
  category?: string | null,
): string => {
  if (!src || src.trim() === '' || src === '/placeholder.svg') {
    return getFallbackImage(category);
  }
  return src;
};
