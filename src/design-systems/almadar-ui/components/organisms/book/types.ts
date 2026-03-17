/**
 * BookViewer shared types
 *
 * Field names are canonical English. When entity data arrives from a
 * schema with non-English field names (e.g. Arabic .orb), a field map
 * translates them before passing to BookViewer. See `mapBookData()`.
 */

export interface BookData {
  title: string;
  subtitle?: string;
  author?: string;
  coverImageUrl?: string;
  direction?: 'rtl' | 'ltr';
  parts: BookPart[];
}

export interface BookPart {
  title: string;
  chapters: BookChapter[];
}

export interface BookChapter {
  id: string;
  title: string;
  content: string;
  orbitalSchema?: unknown;
}

/**
 * Maps raw entity field names to canonical BookData field names.
 * Each key is a canonical field, each value is the entity field name.
 *
 * @example
 * ```ts
 * // Arabic schema
 * const AR_BOOK_FIELDS: BookFieldMap = {
 *   title: 'العنوان',
 *   subtitle: 'العنوان_الفرعي',
 *   author: 'المؤلف',
 *   coverImageUrl: 'صورة_الغلاف',
 *   direction: 'الاتجاه',
 *   parts: 'الأجزاء',
 *   partTitle: 'العنوان',
 *   chapters: 'الفصول',
 *   chapterId: 'المعرف',
 *   chapterTitle: 'العنوان',
 *   chapterContent: 'المحتوى',
 *   chapterOrbitalSchema: 'المخطط_المداري',
 * };
 * ```
 */
export interface BookFieldMap {
  title: string;
  subtitle: string;
  author: string;
  coverImageUrl: string;
  direction: string;
  parts: string;
  partTitle: string;
  chapters: string;
  chapterId: string;
  chapterTitle: string;
  chapterContent: string;
  chapterOrbitalSchema: string;
}

/** Identity map — entity already uses canonical English field names */
export const IDENTITY_BOOK_FIELDS: BookFieldMap = {
  title: 'title',
  subtitle: 'subtitle',
  author: 'author',
  coverImageUrl: 'coverImageUrl',
  direction: 'direction',
  parts: 'parts',
  partTitle: 'title',
  chapters: 'chapters',
  chapterId: 'id',
  chapterTitle: 'title',
  chapterContent: 'content',
  chapterOrbitalSchema: 'orbitalSchema',
};

/** Arabic field map for الأمة_الرقمية schema */
export const AR_BOOK_FIELDS: BookFieldMap = {
  title: 'العنوان',
  subtitle: 'العنوان_الفرعي',
  author: 'المؤلف',
  coverImageUrl: 'صورة_الغلاف',
  direction: 'الاتجاه',
  parts: 'الأجزاء',
  partTitle: 'العنوان',
  chapters: 'الفصول',
  chapterId: 'المعرف',
  chapterTitle: 'العنوان',
  chapterContent: 'المحتوى',
  chapterOrbitalSchema: 'المخطط_المداري',
};

/** Registry of named field maps, keyed by locale string from render-ui props */
const FIELD_MAP_REGISTRY: Record<string, BookFieldMap> = {
  ar: AR_BOOK_FIELDS,
};

/**
 * Resolves a fieldMap prop to a BookFieldMap object.
 * Accepts a BookFieldMap object directly, a locale string key ("ar"),
 * or undefined (defaults to identity/English).
 */
export function resolveFieldMap(
  fieldMap: BookFieldMap | string | undefined,
): BookFieldMap {
  if (!fieldMap) return IDENTITY_BOOK_FIELDS;
  if (typeof fieldMap === 'string') return FIELD_MAP_REGISTRY[fieldMap] ?? IDENTITY_BOOK_FIELDS;
  return fieldMap;
}

/** Get a field value from a raw entity record */
function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

/**
 * Maps a raw entity record to a typed BookData using a field map.
 * Pass `IDENTITY_BOOK_FIELDS` for English schemas, `AR_BOOK_FIELDS` for Arabic, etc.
 */
export function mapBookData(
  raw: Record<string, unknown>,
  fields: BookFieldMap = IDENTITY_BOOK_FIELDS,
): BookData {
  const rawParts = (get(raw, fields.parts) ?? []) as Record<string, unknown>[];

  return {
    title: (get(raw, fields.title) as string) ?? '',
    subtitle: get(raw, fields.subtitle) as string | undefined,
    author: get(raw, fields.author) as string | undefined,
    coverImageUrl: get(raw, fields.coverImageUrl) as string | undefined,
    direction: (get(raw, fields.direction) as 'rtl' | 'ltr') ?? undefined,
    parts: rawParts.map((part) => {
      const rawChapters = (get(part, fields.chapters) ?? []) as Record<string, unknown>[];
      return {
        title: (get(part, fields.partTitle) as string) ?? '',
        chapters: rawChapters.map((ch) => ({
          id: (get(ch, fields.chapterId) as string) ?? '',
          title: (get(ch, fields.chapterTitle) as string) ?? '',
          content: (get(ch, fields.chapterContent) as string) ?? '',
          orbitalSchema: get(ch, fields.chapterOrbitalSchema),
        })),
      };
    }),
  };
}
